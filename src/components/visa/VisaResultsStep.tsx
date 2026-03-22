import { FileCheck, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VisaResult {
  success: boolean;
  visaDetails?: {
    visaCopyBase64?: string;
    visaCopyMime?: string;
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

function hasVisaCopy(details: VisaResult["visaDetails"]): boolean {
  return !!(details?.visaCopyBase64 && details.visaCopyBase64.length > 500);
}

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

export default function VisaResultsStep({ result, onReset, onRetry, fileNameHint }: VisaResultsStepProps) {
  const { success, visaDetails, error, mofaMessage } = result;
  const hasVisa = hasVisaCopy(visaDetails);

  return (
    <div className="space-y-4">
      {success && hasVisa ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
          <div className="flex items-start gap-3">
            <FileCheck className="h-6 w-6 shrink-0 text-green-600 dark:text-green-500" />
            <div className="space-y-3 flex-1 min-w-0">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Visa Found</h3>

              <div className="flex justify-center overflow-auto max-h-[min(70vh,900px)] rounded border bg-white">
                <img
                  src={`data:${visaDetails!.visaCopyMime || "image/png"};base64,${visaDetails!.visaCopyBase64}`}
                  alt="MOFA visa copy"
                  className="max-w-full object-contain"
                />
              </div>

              <Button
                type="button"
                className="w-full gap-2"
                onClick={() =>
                  downloadBase64(
                    visaDetails!.visaCopyBase64!,
                    visaDetails!.visaCopyMime || "image/png",
                    fileNameHint
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Visa
              </Button>
            </div>
          </div>
        </div>
      ) : success && !hasVisa ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="space-y-2 flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Could not capture visa
              </h3>
              <p className="text-sm text-amber-950/90 dark:text-amber-100/90">
                The portal responded, but we couldn't capture the visa document.
                Try again with a fresh captcha, or check directly on{" "}
                <a href="https://visa.mofa.gov.sa/visaservices/searchvisa" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                  visa.mofa.gov.sa
                </a>.
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
              <p className="text-sm">
                {error || "No visa record found or the captcha was incorrect. Please try again."}
              </p>
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
