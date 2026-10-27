// Build-time static prerendering.
//
// Why this exists: the site is a pure client-side React SPA (createRoot, no
// hydrateRoot/SSR). Every route's <head> (title/description/canonical/OG) is
// only set after React mounts and react-helmet-async's effect flushes — so a
// crawler or tool that fetches the raw HTML without running JS sees the same
// generic index.html <head> and an empty #root on every single URL. That is
// exactly the "0 crawlable words" + "duplicate title/meta on every page"
// finding from the site audit.
//
// Fix: after `vite build`, boot the production build locally, visit every
// public route in a real browser (Playwright), let React + Helmet render and
// commit, then write the fully-rendered HTML to dist/<route>/index.html. A
// static host resolves /about to dist/about/index.html before falling back
// to the SPA shell, so crawlers get real per-page content and metadata while
// real users still get the SPA (React re-renders over the snapshot on load —
// harmless since the content already matches).
//
// Run via `npm run build` (chained as part of the build script).

import { chromium } from "playwright";
import { preview } from "vite";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const PORT = 4384;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Same project the live site talks to (src/integrations/supabase/client.ts) —
// the anon key is public/safe, matching that file.
const SUPABASE_URL = "https://kofijegdzeshitunwddn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmlqZWdkemVzaGl0dW53ZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjQxNTIsImV4cCI6MjA4NjUwMDE1Mn0.knr8JAjauZWGl-3Wd4BbaMCEZLujxHR7veJs4rQEwVw";

// Public, indexable routes only. Keep in sync with src/App.tsx.
// Deliberately excluded: /login, /signup*, /account-pending, /admin*,
// /masterclass/success, /masterclass/failed — auth/checkout-flow pages that
// robots.txt already disallows or that have no stable canonical content.
const STATIC_ROUTES = [
  "/",
  "/about",
  "/terms-of-service",
  "/privacy-policy",
  "/refund-policy",
  "/categories-destinations",
  "/blog",
  "/umrah-visa-check",
  "/book-demo",
  "/contact",
  "/masterclass",
  "/bangalore-umrah-package",
];

async function getDynamicRoutes() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const routes = [];

  const { data: posts, error: postsErr } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");
  if (postsErr) console.warn("[prerender] could not fetch blog_posts:", postsErr.message);
  for (const p of posts ?? []) routes.push(`/blog/${p.slug}`);

  const { data: magnets, error: magnetsErr } = await supabase
    .from("lead_magnets")
    .select("slug")
    .eq("is_active", true);
  if (magnetsErr) console.warn("[prerender] could not fetch lead_magnets:", magnetsErr.message);
  for (const m of magnets ?? []) routes.push(`/resource/${m.slug}`);

  return routes;
}

function outFileFor(route) {
  const clean = route === "/" ? "" : route;
  return join(DIST, clean.replace(/^\//, ""), "index.html");
}

async function snapshot(browser, route) {
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 30_000 });
    // react-helmet-async flushes title/meta in a passive effect right after
    // commit; networkidle already implies React has mounted and fetched any
    // page data, this just gives Helmet's effect a tick to land.
    await page.waitForTimeout(250);
    const html = await page.content();
    const outFile = outFileFor(route);
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(outFile, html, "utf-8");
    return { route, ok: true };
  } catch (err) {
    return { route, ok: false, error: err.message };
  } finally {
    await page.close();
  }
}

async function main() {
  const server = await preview({
    root: ROOT,
    preview: { port: PORT, host: "127.0.0.1", strictPort: true },
  });

  const browser = await chromium.launch();
  const routes = [...STATIC_ROUTES, ...(await getDynamicRoutes())];

  const results = [];
  for (const route of routes) {
    results.push(await snapshot(browser, route));
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));

  const failed = results.filter((r) => !r.ok);
  console.log(`[prerender] ${results.length - failed.length}/${results.length} routes snapshotted.`);
  for (const f of failed) console.error(`[prerender] FAILED ${f.route}: ${f.error}`);

  if (failed.length) {
    // Fail the build loudly rather than silently shipping a route with no
    // prerendered snapshot (it would just fall back to the CSR-only shell).
    process.exitCode = 1;
  }
}

main();
