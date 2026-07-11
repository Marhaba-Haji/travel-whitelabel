/**
 * Reliable scrolling to homepage sections that live inside LazyOnVisible
 * wrappers.
 *
 * A plain scrollIntoView() fails here in two ways:
 *  1. The target may not be in the DOM yet — it mounts only when its lazy
 *     placeholder nears the viewport (and #contact's placeholder is labelled
 *     "footer", so an id lookup alone can't find it).
 *  2. Even once scrolling starts, lazy sections ABOVE the target mount and
 *     replace their estimated placeholder heights with real ones, moving the
 *     target mid-scroll — the user lands in the wrong section.
 *
 * This helper waits for the target (or its placeholder), smooth-scrolls to
 * it, then keeps re-pinning it while surrounding sections settle. Any user
 * input (wheel/touch/key) cancels immediately so we never fight the user.
 *
 * Loops are timer-driven (not requestAnimationFrame) so the scroll still
 * completes if the tab loses visibility mid-navigation.
 */

const HEADER_OFFSET = 96; // fixed header (80px) + breathing room
const TICK_MS = 80;

// Section ids whose LazyOnVisible placeholder uses a different label
const LAZY_LABEL_BY_ID: Record<string, string> = {
  contact: "footer",
};

// Only one scroll job at a time — a new click cancels the previous job
let cancelActive: (() => void) | null = null;

export function scrollToHomeSection(rawId: string): void {
  const sectionId = rawId.replace(/^#/, "");
  if (!sectionId) return;

  cancelActive?.();

  const deadline = Date.now() + 5000;
  let cancelled = false;
  let timer: number | null = null;

  const cleanup = () => {
    cancelled = true;
    if (timer !== null) window.clearInterval(timer);
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
    if (cancelActive === cancel) cancelActive = null;
  };
  const cancel = () => cleanup();
  cancelActive = cancel;

  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("keydown", cancel);

  const findTarget = (): Element | null =>
    document.getElementById(sectionId) ||
    document.querySelector(
      `[data-lazy-section="${LAZY_LABEL_BY_ID[sectionId] ?? sectionId}"]`,
    );

  const desiredTop = (el: Element) =>
    Math.max(0, window.scrollY + el.getBoundingClientRect().top - HEADER_OFFSET);

  // Phase 3: keep pinning the target while lazy sections above it mount and
  // shift the layout; stop once stable for ~0.5s, on timeout, or user input.
  const startCorrecting = () => {
    let stableTicks = 0;
    timer = window.setInterval(() => {
      if (cancelled || Date.now() > deadline) return cleanup();
      const el = findTarget();
      if (!el) return cleanup();
      const top = desiredTop(el);
      if (Math.abs(top - window.scrollY) > 4) {
        window.scrollTo({ top, behavior: "auto" });
        stableTicks = 0;
      } else if (++stableTicks >= 6) {
        cleanup();
      }
    }, TICK_MS);
  };

  // Phase 2: smooth-scroll toward the target, wait until the animation
  // settles (scrollY stops changing), then hand over to the correction loop.
  const startScroll = (el: Element) => {
    window.scrollTo({ top: desiredTop(el), behavior: "smooth" });
    let lastY = -1;
    let settledTicks = 0;
    timer = window.setInterval(() => {
      if (cancelled || Date.now() > deadline) return cleanup();
      if (Math.abs(window.scrollY - lastY) < 1) {
        settledTicks++;
      } else {
        settledTicks = 0;
      }
      lastY = window.scrollY;
      if (settledTicks >= 3) {
        if (timer !== null) window.clearInterval(timer);
        startCorrecting();
      }
    }, TICK_MS);
  };

  // Phase 1: wait for the target or its lazy placeholder to exist (it may
  // not, right after navigating from another route).
  const waitForElement = () => {
    const el = findTarget();
    if (el) return startScroll(el);
    timer = window.setInterval(() => {
      if (cancelled || Date.now() > deadline) return cleanup();
      const found = findTarget();
      if (found) {
        if (timer !== null) window.clearInterval(timer);
        startScroll(found);
      }
    }, TICK_MS);
  };

  waitForElement();
}
