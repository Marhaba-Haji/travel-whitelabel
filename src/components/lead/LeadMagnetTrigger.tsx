import { useState } from "react";
import { useExitIntent } from "@/hooks/useExitIntent";
import LeadMagnetModal from "./LeadMagnetModal";

/**
 * Global behavioral lead capture — mounts once near the app root.
 * Renders nothing until the user shows leave intent or scrolls deep + dwells.
 * Frequency-capped to once per 7 days via localStorage.
 */
const LeadMagnetTrigger = () => {
  const { triggered } = useExitIntent({ enabled: true });
  const [open, setOpen] = useState(false);

  // Open the modal exactly once when triggered
  if (triggered && !open) {
    setTimeout(() => setOpen(true), 50);
  }

  return <LeadMagnetModal open={open} onOpenChange={setOpen} source="exit_intent" />;
};

export default LeadMagnetTrigger;