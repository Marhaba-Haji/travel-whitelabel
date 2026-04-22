import { useSessionTracking } from "@/hooks/useSessionTracking";

/**
 * Tiny wrapper so we can call the session-tracking hook inside <BrowserRouter>
 * without converting App.tsx into a function component with hooks.
 */
const SessionTrackingMount = () => {
  useSessionTracking();
  return null;
};

export default SessionTrackingMount;