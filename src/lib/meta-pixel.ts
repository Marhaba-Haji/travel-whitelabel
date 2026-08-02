/**
 * Meta Pixel event helpers.
 *
 * The pixel base code (ID 1349063087083648) is already loaded site-wide through
 * the Google Tag Manager container, so we NEVER call fbq('init') here — doing so
 * would double-count PageViews. We only fire event code on real user actions.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type LeadSource = "contact_form" | "demo_booking" | "signup_review_order";

const newEventId = () => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/**
 * Fires Meta's standard `Lead` event plus a matching dataLayer push
 * (so a GTM trigger can be added later without code changes).
 */
export const trackLead = (
  source: LeadSource,
  params: Record<string, unknown> = {},
) => {
  if (typeof window === "undefined") return;

  const eventID = newEventId();

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", { content_name: source, ...params }, { eventID });
    }
  } catch (e) {
    console.warn("fbq Lead event failed", e);
  }

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "lead", lead_source: source, event_id: eventID, ...params });
  } catch {
    /* ignore */
  }

  return eventID;
};
