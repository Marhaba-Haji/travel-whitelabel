import { useRef, type ReactNode } from "react";
import { FileCheck, AlertCircle, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VisaResult {
  success: boolean;
  visaDetails?: {
    rawText?: string;
    /** Rendered HTML of the visa page for display + print-to-PDF */
    visaCopyHtml?: string;
    /** @deprecated legacy base64 screenshot */
    visaCopyBase64?: string;
    visaCopyMime?: string;
    /** @deprecated use visaCopyHtml */
    visaImageBase64?: string;
  };
  error?: string;
  mofaMessage?: string;
}

interface VisaResultsStepProps {
  result: VisaResult;
  onReset: () => void;
  onRetry?: () => void;
  fileNameHint?: string;
}

/** True only when we have something a user can actually use. */
function hasExtractableVisaContent(details: VisaResult["visaDetails"]): boolean {
  if (!details) return false;
  if (details.visaCopyHtml && details.visaCopyHtml.length > 200) return true;
  if (details.visaCopyBase64 && details.visaCopyBase64.length > 5000) return true;
  if (details.visaImageBase64 && details.visaImageBase64.length > 200) return true;
  const raw = details.rawText;
  if (!raw?.trim() || raw.length < 40) return false;
  const t = raw.toLowerCase();
  return /تاريخ الإصدار|تاريخ الانتهاء|date of issue|date of expiry|حالة التأشيرة|نوع التأشيرة|visa number|passport|nationality|border number|الرقم الحدودي/.test(t);
}

function formatVisaResult(rawText: string): ReactNode {
  if (!rawText?.trim()) return null;
  const lines = rawText.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return <p className="text-sm">{rawText}</p>;
  return (
    <div className="space-y-1.5 text-sm">
      {lines.map((line, i) => (
        <div key={i} className="flex gap-2">
          {line.includes(":") ? (
            <>
              <span className="shrink-0 font-medium text-muted-foreground">
                {line.split(":")[0].trim()}:
              </span>
              <span>{line.split(":").slice(1).join(":").trim()}</span>
            </>
          ) : (
            <span>{line}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function cleanMofaMessage(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  let s = raw
    .replace(/×/g, "")
    .replace(/منصة التأشيرات/g, "")
    .replace(/من خلال إستخدامك لموقعنا[\s\S]*/i, "")
    .replace(/إغلاق/g, "")
    .trim();
  if (s.length < 5) return undefined;
  return s;
}

/** Open visa HTML in a new window and trigger print for Save-as-PDF */
function VisaHtmlViewer({ html }: { html: string }) {
  const handleSaveAsPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to save the visa as PDF.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for content to render then trigger print
    printWindow.addEventListener("load", () => {
      printWindow.focus();
      printWindow.print();
    });
    // Fallback if load doesn't fire
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <Button type="button" className="w-full gap-2" onClick={handleSaveAsPdf}>
        <Printer className="h-4 w-4" />
        Save as PDF
      </Button>
      <p className="text-xs text-muted-foreground">
        Opens the visa in a new tab → choose "Save as PDF" as your printer → Save.
      </p>
    </div>
  );
}

/** Legacy: download base64 image/pdf */
function downloadBase64(base64: string, mime: string, fileNameHint?: string) {
  const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("pdf") ? "pdf" : "png";
  const safe = (fileNameHint || "").replace(/[^\w-]/g, "").slice(-12) || "visa";
  const name = `mofa-visa-${safe}-${Date.now()}.${ext}`;
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}

export default function VisaResultsStep({ result, onReset, onRetry, fileNameHint }: VisaResultsStepProps) {
  const { success, visaDetails, error, mofaMessage } = result;
  const hasUsefulData = hasExtractableVisaContent(visaDetails);
  const ambiguousSuccess = success && !hasUsefulData;

  const visaCopyHtml = visaDetails?.visaCopyHtml;
  const legacyBase64 = visaDetails?.visaCopyBase64 || visaDetails?.visaImageBase64;
  const legacyMime = visaDetails?.visaCopyMime || "image/png";

  return (
    <div className="space-y-4">
      {success && hasUsefulData ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
          <div className="flex items-start gap-3">
            <FileCheck className="h-6 w-6 shrink-0 text-green-600 dark:text-green-500" />
            <div className="space-y-2 flex-1 min-w-0">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Issued visa copy</h3>
              <div className="rounded bg-white/80 p-3 text-green-900 dark:bg-black/20 dark:text-green-100 space-y-3">
                {visaCopyHtml ? (
                  <VisaHtmlViewer html={visaCopyHtml} />
                ) : legacyBase64 ? (
                  <div className="space-y-3">
                    {legacyMime.includes("pdf") ? (
                      <iframe
                        title="Visa PDF preview"
                        src={`data:${legacyMime};base64,${legacyBase64}`}
                        className="h-[min(70vh,820px)] w-full rounded border bg-white"
                      />
                    ) : (
                      <div className="flex justify-center overflow-auto max-h-[min(70vh,900px)] rounded border bg-white">
                        <img
                          src={`data:${legacyMime};base64,${legacyBase64}`}
                          alt="MOFA visa copy"
                          className="max-w-full object-contain"
                        />
                      </div>
                    )}
                    <Button
                      type="button"
                      className="w-full gap-2"
                      onClick={() => downloadBase64(legacyBase64, legacyMime, fileNameHint)}
                    >
                      <Download className="h-4 w-4" />
                      Download visa copy
                    </Button>
                  </div>
                ) : null}
                {formatVisaResult(visaDetails?.rawText ?? "")}
              </div>
            </div>
          </div>
        </div>
      ) : ambiguousSuccess ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="space-y-2 flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Could not show visa information
              </h3>
              <p className="text-sm text-amber-950/90 dark:text-amber-100/90">
                The portal responded, but we couldn't read a visa record from the page.
                Try again with a fresh captcha, or check directly on{" "}
                <a href="https://visa.mofa.gov.sa/visaservices/searchvisa" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                  visa.mofa.gov.sa
                </a>.
              </p>
            </div>
          </div>
        </div>
      ) : !success ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
            <div className="space-y-2">
              <h3 className="font-semibold text-destructive">Lookup failed</h3>
              <p className="text-sm">
                {error || "No visa record found or the captcha was incorrect. Please try again."}
              </p>
              {cleanMofaMessage(mofaMessage) ? (
                <p className="text-xs text-muted-foreground border-t border-destructive/20 pt-2 mt-2">
                  MOFA response: {cleanMofaMessage(mofaMessage)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Confirm all details against your passport and MOFA if needed.
      </p>

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
