import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CaptchaStepProps {
  onSubmit: (sessionData: string, captchaText: string) => void;
  isLoading?: boolean;
  passportNumber?: string;
  firstName?: string;
  countryCode?: string;
}

export default function CaptchaStep({
  onSubmit,
  isLoading = false,
  passportNumber,
  firstName,
  countryCode,
}: CaptchaStepProps) {
  const [sessionData, setSessionData] = useState<string | null>(null);
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [captchaText, setCaptchaText] = useState("");
  const [fetchingCaptcha, setFetchingCaptcha] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadCaptcha = async () => {
    setFetchError(null);
    setFetchingCaptcha(true);
    setCaptchaText("");
    try {
      const { data, error } = await supabase.functions.invoke("visa-captcha", {
        body: {
          passportNumber: passportNumber?.trim() || undefined,
          firstName: firstName?.trim() || undefined,
          countryCode: countryCode?.trim() || undefined,
        },
      });

      if (error) {
        setFetchError("Failed to load. Tap Retry.");
        return;
      }

      if (!data?.sessionData || !data?.captchaImageBase64) {
        setFetchError(data?.error || "MOFA unavailable. Retry in a minute.");
        return;
      }

      setSessionData(data.sessionData);
      setCaptchaImage(`data:image/png;base64,${data.captchaImageBase64}`);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error && err.message.includes("abort")
          ? "Timed out"
          : "Failed to load"
      );
    } finally {
      setFetchingCaptcha(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionData && captchaText.trim()) {
      onSubmit(sessionData, captchaText.trim());
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        Enter characters (case-sensitive). Retry if image doesn&apos;t load.
      </p>

      {fetchingCaptcha ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 sm:p-8">
          <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
          <p className="text-xs sm:text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : fetchError ? (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-destructive">{fetchError}</p>
          <Button type="button" variant="outline" onClick={loadCaptcha} className="min-h-[44px] touch-manipulation">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : captchaImage ? (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-auto flex items-center gap-3">
              <img
                src={captchaImage}
                alt="Captcha"
                className="h-12 sm:h-14 rounded border bg-muted object-contain flex-shrink-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 touch-manipulation"
                onClick={loadCaptcha}
                title="Refresh captcha"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="captcha" className="text-xs sm:text-sm">Captcha</Label>
            <Input
              id="captcha"
              value={captchaText}
              onChange={(e) => setCaptchaText(e.target.value)}
              placeholder="Enter characters"
              autoComplete="off"
              autoCapitalize="off"
              className="font-mono text-base sm:text-lg tracking-widest min-h-[44px] h-auto py-2.5"
            />
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] touch-manipulation"
            disabled={!captchaText.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Visa Status"
            )}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
