import { useEffect, useRef, useState } from "react";
import { useExitIntent } from "@/hooks/useExitIntent";
import LeadMagnetModal from "./LeadMagnetModal";

/**
 * Global behavioral lead capture — mounts once near the app root.
 * Renders nothing until the user shows leave intent or scrolls deep + dwells.
 * Frequency-capped to once per 7 days via localStorage. Once the user closes
 * (or submits) the modal, it will not reopen for the rest of the session.
 */
const SESSION_DISMISS_KEY = "mdmc_lead_modal_dismissed";

const LeadMagnetTrigger = () => {
  const { triggered } = useExitIntent({ enabled: true });
  const [open, setOpen] = useState(false);
  const hasOpenedRef = useRef(false);

  // Open exactly once per session, only if user hasn't already dismissed it
  useEffect(() => {
    if (!triggered || hasOpenedRef.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_DISMISS_KEY)) return;
    hasOpenedRef.current = true;
    setOpen(true);
  }, [triggered]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && typeof window !== "undefined") {
      // Mark as dismissed for this session so it cannot reopen
      sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
      // Also refresh the 7-day cooldown so it doesn't appear on next visit immediately
      try {
        localStorage.setItem("mdmc_lead_modal_last", String(Date.now()));
      } catch {}
    }
  };

  return <LeadMagnetModal open={open} onOpenChange={handleOpenChange} source="exit_intent" />;
};

export default LeadMagnetTrigger;