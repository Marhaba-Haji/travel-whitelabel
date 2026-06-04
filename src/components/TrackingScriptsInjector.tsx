import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTrackingScripts, type TrackingScript } from "@/hooks/useTrackingScripts";

/**
 * Parses an HTML snippet (which may contain <script>, <noscript>, <meta>, <iframe>, raw text)
 * and returns real DOM nodes that will actually execute inline scripts when appended.
 * Using innerHTML alone does NOT execute scripts — we must recreate <script> elements manually.
 */
const parseSnippet = (html: string): Node[] => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const out: Node[] = [];
  template.content.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === "SCRIPT") {
        const s = document.createElement("script");
        for (const { name, value } of Array.from(el.attributes)) {
          s.setAttribute(name, value);
        }
        if (el.textContent) s.appendChild(document.createTextNode(el.textContent));
        out.push(s);
      } else {
        out.push(el.cloneNode(true));
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      // skip whitespace-only text nodes
      if ((node.textContent ?? "").trim()) out.push(node.cloneNode(true));
    }
  });
  return out;
};

const TrackingScriptsInjector = () => {
  const { data: scripts } = useTrackingScripts();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (!scripts || scripts.length === 0) return;

    const eligible = scripts.filter((s) => {
      if (s.load_strategy === "exclude_admin" && isAdmin) return false;
      return true;
    });

    const injected: { id: string; nodes: Node[]; parent: HTMLElement }[] = [];

    eligible.forEach((s: TrackingScript) => {
      const nodes = parseSnippet(s.code);
      if (nodes.length === 0) return;

      // mark each node so we can clean up reliably
      nodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          (n as HTMLElement).setAttribute("data-tracking-id", s.id);
        }
      });

      let parent: HTMLElement;
      let position: "append" | "prepend" = "append";
      if (s.placement === "head") parent = document.head;
      else if (s.placement === "body_start") {
        parent = document.body;
        position = "prepend";
      } else {
        parent = document.body;
      }

      if (position === "prepend") {
        // insert in reverse so order is preserved at top
        [...nodes].reverse().forEach((n) => parent.insertBefore(n, parent.firstChild));
      } else {
        nodes.forEach((n) => parent.appendChild(n));
      }
      injected.push({ id: s.id, nodes, parent });
    });

    return () => {
      injected.forEach(({ nodes, parent }) => {
        nodes.forEach((n) => {
          if (n.parentNode === parent) parent.removeChild(n);
        });
      });
    };
  }, [scripts, isAdmin]);

  return null;
};

export default TrackingScriptsInjector;