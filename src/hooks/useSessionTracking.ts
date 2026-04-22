import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "mdmc_session_id";
const ATTRIBUTION_KEY = "mdmc_attribution";
const TRACKED_KEY = "mdmc_session_tracked";

interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  first_seen_at?: string;
}

function ensureSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function captureAttribution(): Attribution {
  // Persistent across the browser tab, set once on first load
  const existing = sessionStorage.getItem(ATTRIBUTION_KEY);
  if (existing) return JSON.parse(existing);

  const params = new URLSearchParams(window.location.search);
  const attr: Attribution = {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_term: params.get("utm_term") || undefined,
    utm_content: params.get("utm_content") || undefined,
    referrer: document.referrer || undefined,
    landing_page: window.location.pathname + window.location.search,
    first_seen_at: new Date().toISOString(),
  };
  sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attr));
  return attr;
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

/**
 * Captures UTM/referrer once per session and upserts a visitor_sessions row.
 * Returns the active session_id via getSessionId() helper.
 */
export function useSessionTracking() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionId = ensureSessionId();
    const attr = captureAttribution();

    if (sessionStorage.getItem(TRACKED_KEY)) return;
    sessionStorage.setItem(TRACKED_KEY, "1");

    // Fire and forget — never block UX
    (async () => {
      try {
        await supabase.from("visitor_sessions").insert({
          session_id: sessionId,
          utm_source: attr.utm_source,
          utm_medium: attr.utm_medium,
          utm_campaign: attr.utm_campaign,
          utm_term: attr.utm_term,
          utm_content: attr.utm_content,
          referrer: attr.referrer,
          landing_page: attr.landing_page,
          device: detectDevice(),
          user_agent: navigator.userAgent.slice(0, 500),
        });
      } catch {
        /* swallow — analytics must never break UX */
      }
    })();
  }, []);
}

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
  return raw ? JSON.parse(raw) : null;
}