import { useCallback, useMemo, useRef } from "react";
import { AlertCircle, Download, FileCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const MOFA_BASE = "https://visa.mofa.gov.sa";

/**
 * Base CSS + layout — same structure/order as emergent-visacheck `complete_html`
 * (backend/server.py), before merged stylesheet rules.
 */
const EMERGENT_BASE_CSS = `
* { box-sizing: border-box; }
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}
.visa-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
table { width: 100%; border-collapse: collapse; }
td, th { padding: 8px; border: 1px solid #ddd; }
img { max-width: 100%; height: auto; }
`;

export interface VisaResult {
  success: boolean;
  visaDetails?: {
    visaCopyHtml?: string;
  };
  error?: string;
  mofaMessage?: string;
}

interface VisaResultsStepProps {
  result: VisaResult;
  /** Used as document title so “Save as PDF” suggests a name like Visa-{passport}-{firstName}. */
  applicantPassport?: string;
  applicantFirstName?: string;
  onReset: () => void;
  onRetry?: () => void;
}

function hasVisaContent(details: VisaResult["visaDetails"]): boolean {
  return !!(details?.visaCopyHtml && details.visaCopyHtml.length > 200);
}

function rewriteAssetUrls(html: string): string {
  return html
    .replace(/(\s(?:src|href)=["'])(\/[^"']*)(["'])/gi, (_, p1, path, p3) => `${p1}${MOFA_BASE}${path}${p3}`)
    .replace(/(\s(?:src|href)=["'])(?!https?:|\/\/|data:|#|javascript:)([^"']*)(["'])/gi, (_, p1, path, p3) => `${p1}${MOFA_BASE}/${path.startsWith("/") ? path.slice(1) : path}${p3}`);
}

function rewriteHref(href: string): string {
  const h = href.trim();
  if (!h) return h;
  if (h.startsWith("//")) return `https:${h}`;
  if (h.startsWith("/")) return `${MOFA_BASE}${h}`;
  if (!/^https?:/i.test(h)) return `${MOFA_BASE}/${h.replace(/^\//, "")}`;
  return h;
}

/**
 * Visa fragment selection — mirrors emergent-visacheck `page.evaluate` in server.py,
 * with slightly safer `.container` resolution when multiple exist.
 */
function findVisaFragmentHtml(doc: Document): string {
  const portlet =
    doc.querySelector(".portlet-body") ??
    doc.querySelector(".visa-content") ??
    doc.querySelector(".print-content") ??
    doc.querySelector("#print-area") ??
    doc.querySelector(".ticket-container");
  if (portlet) return portlet.outerHTML;

  const main =
    doc.querySelector(".page-content-inner") ??
    doc.querySelector(".page-content") ??
    doc.querySelector("#content .container") ??
    doc.querySelector(".page-content-inner .container") ??
    doc.querySelector(".container");
  if (main) return main.outerHTML;

  return doc.body?.innerHTML ?? "";
}

/** Collect inline <style> text + stylesheet link hrefs from source (client stand-in for live cssRules scrape). */
function collectStylesAndLinks(doc: Document): { mergedCss: string; linkTags: string } {
  const cssChunks: string[] = [];
  doc.querySelectorAll("style").forEach((el) => {
    const t = el.textContent?.trim();
    if (t) cssChunks.push(t);
  });

  const linkParts: string[] = [];
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
    const href = el.getAttribute("href");
    if (!href || href.startsWith("javascript:")) return;
    const abs = rewriteHref(href);
    linkParts.push(`<link rel="stylesheet" href="${abs.replace(/"/g, "&quot;")}" />`);
  });

  return {
    mergedCss: cssChunks.join("\n"),
    linkTags: linkParts.join("\n"),
  };
}

function stripScriptsFromHtmlFragment(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

function escapeHtmlText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Safe segments for print/PDF default filename (browsers use document title). */
function sanitizeFilenameSegment(value: string, maxLen: number): string {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001F]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, maxLen)
    .trim();
}

function buildVisaSaveTitle(passport?: string, firstName?: string): string {
  const p = sanitizeFilenameSegment(passport ?? "", 32).replace(/\s+/g, "");
  const n = sanitizeFilenameSegment(firstName ?? "", 48).replace(/\s+/g, "-");
  if (p && n) return `Visa-${p}-${n}`;
  if (p) return `Visa-${p}`;
  if (n) return `Visa-${n}`;
  return "Saudi Visa";
}

/** Inject hide-others CSS when we keep a full document (extraction not used). */
function getVisaOnlyCss(forHtml: string): string {
  const shell = `
  body > *:not(.page-container):not(#content) { display: none !important; }
  .page-container > *:not(#content) { display: none !important; }
  .page-container { padding: 0 !important; margin: 0 !important; border: none !important; }
  .page-footer, [class*="page-footer"], [id*="footer"] { display: none !important; }
  header, footer, nav, .header, .navbar, [role="banner"] { display: none !important; }
  #content, .page-content#content { display: block !important; margin: 0 !important; padding: 0 !important; position: relative !important; top: 0 !important; left: 0 !important; }
`;

  const classContainer = /class=["'][^"']*\bcontainer\b[^"']*["']/i.test(forHtml);
  const hasInner = /page-content-inner/i.test(forHtml);

  if (hasInner && classContainer) {
    return `${shell}
  #content > *:not(.page-content-inner):not(:has(.page-content-inner)) { display: none !important; }
  .page-content-inner ~ * { display: none !important; }
  .page-content-inner { display: block !important; margin: 0 !important; padding: 0 !important; }
  .page-content-inner > *:not(.container):not(:has(.container)) { display: none !important; }
  .page-content-inner .container ~ * { display: none !important; }
  .page-content-inner .container { display: block !important; margin: 0 !important; }
`;
  }
  if (classContainer) {
    return `${shell}
  #content > *:not(.container):not(:has(.container)) { display: none !important; }
  #content .container ~ * { display: none !important; }
  #content .container { display: block !important; margin: 0 !important; }
`;
  }
  if (hasInner) {
    return `${shell}
  #content > *:not(.page-content-inner):not(:has(.page-content-inner)) { display: none !important; }
  .page-content-inner ~ * { display: none !important; }
  .page-content-inner { display: block !important; margin: 0 !important; position: relative !important; top: 0 !important; left: 0 !important; }
`;
  }
  return shell;
}

function injectVisaOnlyCss(html: string): string {
  const style = `<style id="visa-only-override">${getVisaOnlyCss(html)}</style>`;
  if (html.includes("<head")) {
    return html.replace(/<head([^>]*)>/i, (m) => m + style);
  }
  return html.replace(/<body/i, `<head>${style}</head><body`);
}

/**
 * One canonical document for iframe + print — same string as emergent’s `visa_html` / `complete_html`.
 * Order: meta/title/base → base CSS → merged source styles → link tags → body > .visa-container > fragment.
 */
function buildEmergentCompleteHtml(rawVisaHtml: string, documentTitle: string): string {
  const titleEscaped = escapeHtmlText(documentTitle);
  const raw = rewriteAssetUrls(rawVisaHtml);
  try {
    const parser = new DOMParser();
    let doc = parser.parseFromString(raw, "text/html");
    let fragment = findVisaFragmentHtml(doc);
    let { mergedCss, linkTags } = collectStylesAndLinks(doc);

    /** API may return markup where fragment is empty or tiny — inject hide CSS and re-extract (legacy shapes). */
    if (!fragment.trim() || fragment.length < 80) {
      const injected = injectVisaOnlyCss(raw).replace(/<script\b[\s\S]*?<\/script>/gi, "");
      doc = parser.parseFromString(injected, "text/html");
      fragment = findVisaFragmentHtml(doc);
      const extra = collectStylesAndLinks(doc);
      mergedCss = [mergedCss, extra.mergedCss].filter(Boolean).join("\n");
      linkTags = [linkTags, extra.linkTags].filter(Boolean).join("\n");
    }

    fragment = stripScriptsFromHtmlFragment(fragment);
    fragment = rewriteAssetUrls(fragment);
    if (!fragment.trim()) {
      fragment = doc.body?.innerHTML ? stripScriptsFromHtmlFragment(doc.body.innerHTML) : "";
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titleEscaped}</title>
  <base href="${MOFA_BASE}/" />
  <style type="text/css">${EMERGENT_BASE_CSS}</style>
  <style type="text/css">${mergedCss}</style>
  ${linkTags}
</head>
<body>
  <div class="visa-container">${fragment}</div>
</body>
</html>`;
  } catch {
    const safe = stripScriptsFromHtmlFragment(raw);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${titleEscaped}</title>
  <base href="${MOFA_BASE}/" />
  <style type="text/css">${EMERGENT_BASE_CSS}</style>
</head>
<body><div class="visa-container">${safe}</div></body>
</html>`;
  }
}

/**
 * emergent-visacheck App.js — Download PDF: iframe.print(); on failure window.open + document.write(same html) + print @ 500ms.
 * No sandbox on iframe (sandbox can block print in some browsers).
 */
function printVisaLikeEmergent(iframe: HTMLIFrameElement | null, visaHtml: string): boolean {
  if (!iframe) return false;
  try {
    const iframeWindow = iframe.contentWindow;
    if (iframeWindow) {
      iframeWindow.focus();
      iframeWindow.print();
      return true;
    }
  } catch {
    /* fall through */
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;
  try {
    printWindow.document.write(visaHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  } catch {
    printWindow.close();
    return false;
  }
  return true;
}

function cleanMofaMessage(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const s = raw
    .replace(/×/g, "")
    .replace(/منصة التأشيرات/g, "")
    .replace(/من خلال إستخدامك لموقعنا[\s\S]*/i, "")
    .replace(/إغلاق/g, "")
    .trim();
  return s.length < 5 ? undefined : s;
}

export default function VisaResultsStep({
  result,
  applicantPassport,
  applicantFirstName,
  onReset,
  onRetry,
}: VisaResultsStepProps) {
  const { success, visaDetails, error, mofaMessage } = result;
  const hasVisa = hasVisaContent(visaDetails);
  const rawVisaHtml = visaDetails?.visaCopyHtml;

  const visaIframeRef = useRef<HTMLIFrameElement>(null);

  const saveTitle = useMemo(
    () => buildVisaSaveTitle(applicantPassport, applicantFirstName),
    [applicantPassport, applicantFirstName],
  );

  /** Single string for iframe + print — matches reference storing one `visaHtml`. */
  const visaHtml = useMemo(
    () => (rawVisaHtml ? buildEmergentCompleteHtml(rawVisaHtml, saveTitle) : ""),
    [rawVisaHtml, saveTitle],
  );

  const handleDownloadPdf = useCallback(() => {
    const iframe = visaIframeRef.current;
    if (!iframe) return;

    const ok = printVisaLikeEmergent(iframe, visaHtml);
    if (!ok) {
      toast({
        variant: "destructive",
        title: "Popup blocked",
        description: "Allow popups to print or save as PDF.",
      });
    }
  }, [visaHtml]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {success && hasVisa ? (
        <div className="space-y-3 sm:space-y-4">
          <Alert variant="success" className="p-3 sm:p-4">
            <FileCheck className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">Visa Found</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              Visa preview below. <strong>Download PDF</strong> opens print — choose <strong>Save as PDF</strong>. Suggested file name uses your passport and first name (same as the document title).
            </AlertDescription>
          </Alert>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">Visa Preview</p>
            <div className="w-full overflow-auto rounded-lg border bg-[#f5f5f5] shadow-inner">
              <iframe
                ref={visaIframeRef}
                title="Visa preview"
                srcDoc={visaHtml}
                className="block min-h-[min(75vh,900px)] w-full min-w-0 border-0 bg-transparent"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            className="w-full gap-2 min-h-[44px] touch-manipulation"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4 shrink-0" />
            Download PDF
          </Button>
        </div>
      ) : success && !hasVisa ? (
        <Alert variant="warning" className="p-3 sm:p-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Verification Complete</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            Preview unavailable. Try again or check{" "}
            <a
              href="https://visa.mofa.gov.sa/visaservices/searchvisa"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:no-underline"
            >
              visa.mofa.gov.sa
            </a>
            .
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="p-3 sm:p-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Lookup Failed</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            {error || "No visa record found or the captcha was incorrect. Please try again."}
            {cleanMofaMessage(mofaMessage) && (
              <span className="block mt-2 pt-2 border-t border-destructive/20 text-xs">
                MOFA: {cleanMofaMessage(mofaMessage)}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {onRetry && !success && (
          <Button variant="default" className="min-h-[44px] touch-manipulation flex-1" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant="outline" className="min-h-[44px] touch-manipulation flex-1 sm:min-w-[120px]" onClick={onReset}>
          {success ? "New search" : "Start over"}
        </Button>
      </div>
    </div>
  );
}
