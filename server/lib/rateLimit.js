/**
 * Minimal in-memory sliding-window rate limiter shared by API routes.
 * Buckets are keyed by `${ip}:${bucket}`; stale entries are purged
 * periodically so the map cannot grow without bound.
 */

const rateLimitMap = new Map();

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref?.();

export function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
}

/**
 * @param {string} ip
 * @param {string} bucket - logical endpoint name
 * @param {number} max - allowed requests per window
 * @param {number} windowMs - window length in ms
 * @returns {boolean} true if the request is allowed
 */
export function checkRateLimit(ip, bucket, max, windowMs) {
  const key = `${ip}:${bucket}`;
  const now = Date.now();
  let entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    rateLimitMap.set(key, entry);
  }
  entry.count++;
  return entry.count <= max;
}

/** Express middleware factory. */
export function rateLimiter(bucket, max, windowMs, message) {
  return (req, res, next) => {
    if (!checkRateLimit(getClientIp(req), bucket, max, windowMs)) {
      return res.status(429).json({ error: message || "Too many requests. Please try again later." });
    }
    next();
  };
}
