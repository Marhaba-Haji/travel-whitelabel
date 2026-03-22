import { AlertCircle, FileCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onReset: () => void;
  onRetry?: () => void;
}

function hasVisaContent(details: VisaResult["visaDetails"]): boolean {
  return !!(details?.visaCopyHtml && details.visaCopyHtml.length > 200);
}

function openPrintWindow(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;

  // Inject zero-margin @page rule into the raw HTML for clean PDF output
  const pageStyle = `<style>@page { margin: 0; size: auto; }</style>`;
  const injected = html.replace(/<head([^>]*)>/i, `<head$1>${pageStyle}`);

  win.document.open();
  win.document.write(injected);
  win.document.close();

  // Wait for content to render then trigger print
  setTimeout(() => {
    win.focus();
    win.print();
  }, 1200);
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

export default function VisaResultsStep({ result, onReset, onRetry }: VisaResultsStepProps) {
  const { success, visaDetails, error, mofaMessage } = result;
  const hasVisa = hasVisaContent(visaDetails);
  // Inject styles: show only .page-content-inner, disable clicks, scale to fit
  const visaHtml = visaDetails?.visaCopyHtml
    ? visaDetails.visaCopyHtml.replace(
        /<head([^>]*)>/i,
        `<head$1><meta name="viewport" content="width=device-width, initial-scale=1"><style>
html,body{margin:0;padding:0;overflow-x:hidden}
body>*{display:none!important}
.page-content-inner{display:block!important}
body{pointer-events:none;user-select:none;transform-origin:top left;width:800px;transform:scale(calc(100vw / 800))}
img{max-width:100%;height:auto}
a,button,input,select{pointer-events:none!important;cursor:default!important}
</style>`
      )
    : undefined;

  const handleSaveAsPdf = () => {
    if (visaHtml) {
      openPrintWindow(visaHtml);
    }
  };

  return (
    <div className="space-y-4">
      {success && hasVisa ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
          <div className="flex items-start gap-3">
            <FileCheck className="h-6 w-6 shrink-0 text-green-600 dark:text-green-500" />
            <div className="space-y-3 flex-1 min-w-0">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Visa Preview</h3>

              <iframe
                title="MOFA visa preview"
                srcDoc={visaHtml}
                className="h-[min(72vh,940px)] w-full rounded border bg-white"
                sandbox=""
              />

              <Button type="button" className="w-full gap-2" onClick={handleSaveAsPdf}>
                <Printer className="h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </div>
        </div>
      ) : success && !hasVisa ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="space-y-2 flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Could not capture visa preview</h3>
              <p className="text-sm text-amber-950/90 dark:text-amber-100/90">
                The portal responded, but we couldn't capture the print visa output. Try again with a fresh captcha, or check directly on{" "}
                <a href="https://visa.mofa.gov.sa/visaservices/searchvisa" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                  visa.mofa.gov.sa
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
            <div className="space-y-2">
              <h3 className="font-semibold text-destructive">Lookup failed</h3>
              <p className="text-sm">{error || "No visa record found or the captcha was incorrect. Please try again."}</p>
              {cleanMofaMessage(mofaMessage) && (
                <p className="text-xs text-muted-foreground border-t border-destructive/20 pt-2 mt-2">
                  MOFA response: {cleanMofaMessage(mofaMessage)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {onRetry && !success && (
          <Button variant="default" className="flex-1" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant="outline" className={onRetry && !success ? "flex-1" : "w-full"} onClick={onReset}>
          {success ? "Check another visa" : "Start over"}
        </Button>
      </div>
    </div>
  );
}
