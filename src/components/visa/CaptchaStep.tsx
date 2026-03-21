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
        setFetchError("Failed to load captcha. Please try again.");
        return;
      }

      if (!data?.sessionData || !data?.captchaImageBase64) {
        setFetchError(
          data?.error ||
            "MOFA did not return a captcha image. Tap Retry or try again in a minute."
        );
        return;
      }

      setSessionData(data.sessionData);
      setCaptchaImage(`data:image/png;base64,${data.captchaImageBase64}`);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error && err.message.includes("abort")
          ? "Request timed out"
          : "Failed to load captcha"
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter the characters exactly as shown (case-sensitive). The captcha is tied to this session and expires in about 5 minutes. If the image is missing or the page looks empty, use <strong>Retry</strong> — MOFA's site sometimes loads the captcha late or only after a refresh.
      </p>

      {fetchingCaptcha ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading captcha...</p>
        </div>
      ) : fetchError ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{fetchError}</p>
          <Button type="button" variant="outline" onClick={loadCaptcha}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : captchaImage ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={captchaImage}
              alt="Captcha"
              className="h-14 rounded border bg-muted object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={loadCaptcha}
              title="Refresh captcha"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="captcha">Enter captcha</Label>
            <Input
              id="captcha"
              value={captchaText}
              onChange={(e) => setCaptchaText(e.target.value)}
              placeholder="Type the characters above"
              autoComplete="off"
              autoCapitalize="off"
              className="font-mono text-lg tracking-widest"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!captchaText.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking visa status...
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
