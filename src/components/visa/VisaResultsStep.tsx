import type { ReactNode } from "react";
import { FileCheck, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VisaResult {
  success: boolean;
  visaDetails?: {
    rawText?: string;
    /** High-res visa copy for display + download (preferred) */
    visaCopyBase64?: string;
    visaCopyMime?: string;
    /** @deprecated use visaCopyBase64 */
    visaImageBase64?: string;
  };
  error?: string;
  /** Visible MOFA dialog/alert text when the API could classify a rejection (debug / transparency). */
  mofaMessage?: string;
}

interface VisaResultsStepProps {
  result: VisaResult;
  onReset: () => void;
  onRetry?: () => void;
  /** Used in download filename, e.g. last digits of passport */
  fileNameHint?: string;
}

function getVisaCopyBase64(details: VisaResult["visaDetails"]): string | undefined {
  return details?.visaCopyBase64 || details?.visaImageBase64;
}

function getVisaCopyMime(details: VisaResult["visaDetails"]): string {
  return details?.visaCopyMime || "image/png";
}

function downloadVisaCopy(base64: string, mime: string, fileNameHint?: string) {
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

/** Backend or old builds sometimes return success with only this — not real visa data. */
function isPlaceholderOrBoilerplate(rawText: string | undefined): boolean {
  if (!rawText?.trim()) return true;
  const t = rawText.toLowerCase();
  if (t.length < 40) return true;
  if (/check completed|please verify the result on the official mofa|verify directly at visa\.mofa/i.test(t)) {
    return true;
  }
  // Short snippet that’s only nav/footer chrome (MOFA mixes Arabic UI labels in)
  const navOnly =
    /القائمة الرئيسية|سياسة الخصوصية|خدمات الزوار|منصة التأشيرات/.test(rawText) &&
    !/تاريخ|إصدار|انتهاء|تأشيرة|visa|passport|جواز|nationality|الجنسية|border|حدود/i.test(rawText);
  if (navOnly && t.length < 800) return true;
  return false;
}

/** MOFA boilerplate that ends up in rawText / visa copy when no real visa was found. */
function looksLikeMofaChromeOnly(rawText: string | undefined): boolean {
  if (!rawText?.trim()) return true;
  const t = rawText.toLowerCase();
  const hasOnlyBoilerplate =
    /ملفات الارتباط|cookie|سياسة الخصوصية|privacy policy|إستخدامك لموقعنا|usage policy/i.test(t) &&
    !/تاريخ الإصدار|تاريخ الانتهاء|date of issue|date of expiry|visa number|رقم التأشيرة.*\d|حالة التأشيرة|نوع التأشيرة|border number|الرقم الحدودي/i.test(t);
  return hasOnlyBoilerplate;
}

/** True only when we have something a user can actually use (visa copy, table text, etc.). */
function hasExtractableVisaContent(
  rawText: string | undefined,
  visaCopyBase64: string | undefined,
  visaCopyMime?: string
): boolean {
  // If backend returned a non-trivial binary copy, trust it even when parsed text is noisy.
  const copyLen = (visaCopyBase64 ?? "").trim().length;
  if (copyLen > 1200) return true;
  if (visaCopyBase64 && visaCopyMime?.includes("pdf")) return true;
  if (visaCopyBase64 && !looksLikeMofaChromeOnly(rawText)) return true;
  if (isPlaceholderOrBoilerplate(rawText)) return false;
  const t = (rawText ?? "").toLowerCase();
  const substantialArabic = /[\u0600-\u06FF]{30,}/.test(rawText ?? "");
  const looksLikeVisa =
    /تاريخ الإصدار|تاريخ الانتهاء|date of issue|date of expiry|حالة التأشيرة|نوع التأشيرة|visa number|جواز|passport|nationality|الجنسية|border number|الرقم الحدودي|expir|issued|application/.test(
      t
    ) ||
    (substantialArabic && (rawText?.length ?? 0) > 120);
  const lineCount = (rawText ?? "").split(/\n/).filter((l) => l.trim().length > 3).length;
  return looksLikeVisa || (lineCount >= 4 && (rawText?.length ?? 0) > 100);
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

/** Strip MOFA privacy / cookie boilerplate from the message shown to users. */
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
  const copyB64 = getVisaCopyBase64(visaDetails);
  const copyMime = getVisaCopyMime(visaDetails);
  const hasUsefulData = hasExtractableVisaContent(visaDetails?.rawText, copyB64, copyMime);
  // API said success but we have no real data — don’t pretend the lookup was useful
  const ambiguousSuccess = success && !hasUsefulData;

  return (
    <div className="space-y-4">
      {success && hasUsefulData ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
          <div className="flex items-start gap-3">
            <FileCheck className="h-6 w-6 shrink-0 text-green-600 dark:text-green-500" />
            <div className="space-y-2 flex-1 min-w-0">
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                {copyMime.includes("pdf") ? "Issued visa (PDF)" : "Issued visa copy"}
              </h3>
              <div className="rounded bg-white/80 p-3 text-green-900 dark:bg-black/20 dark:text-green-100 space-y-3">
                {copyB64 && copyMime.includes("pdf") && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Same document you get from MOFA’s print page (Print → Save as PDF). Preview below if your browser supports it.
                    </p>
                    <div className="w-full overflow-hidden rounded border bg-white">
                      <iframe
                        title="Visa PDF preview"
                        src={`data:${copyMime};base64,${copyB64}`}
                        className="h-[min(70vh,820px)] w-full"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full gap-2"
                      onClick={() => downloadVisaCopy(copyB64, copyMime, fileNameHint)}
                    >
                      <Download className="h-4 w-4" />
                      Download visa PDF
                    </Button>
                  </div>
                )}
                {copyB64 && !copyMime.includes("pdf") && (
                  <div className="space-y-3">
                    <div className="flex justify-center overflow-auto max-h-[min(70vh,900px)] rounded border bg-white">
                      <img
                        src={`data:${copyMime};base64,${copyB64}`}
                        alt="MOFA visa copy"
                        className="max-w-full object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full gap-2"
                      onClick={() => downloadVisaCopy(copyB64, copyMime, fileNameHint)}
                    >
                      <Download className="h-4 w-4" />
                      Download visa copy
                    </Button>
                  </div>
                )}
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
                The portal responded, but we couldn’t read a visa record or “no record” message from the page.
                That usually means the form layout changed, the captcha failed, or the session timed out — not that your visa is invalid.
              </p>
              <p className="text-sm text-amber-950/90 dark:text-amber-100/90">
                <strong>What to do:</strong> try again with a fresh captcha, or check directly on the official site:{" "}
                <a
                  href="https://visa.mofa.gov.sa/visaservices/searchvisa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:no-underline"
                >
                  visa.mofa.gov.sa — Print visa
                </a>
                .
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
        When MOFA opens the official print visa page, we save the same output as Print → Save as PDF. Confirm all details against your passport and MOFA if needed.
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
