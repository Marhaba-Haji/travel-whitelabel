import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import PassportUploadStep, { type PassportExtractResult } from "@/components/visa/PassportUploadStep";
import VisaDetailsForm, { type VisaDetailsValues } from "@/components/visa/VisaDetailsForm";
import { supabase } from "@/integrations/supabase/client";
import CaptchaStep from "@/components/visa/CaptchaStep";
import VisaResultsStep, { type VisaResult } from "@/components/visa/VisaResultsStep";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { FileImage, FileEdit, Shield, CheckCircle2 } from "lucide-react";

/** Dev-only optional prefill via .env.development.local (see .env.example). */
function readVisaTestPrefillFromEnv(): Partial<VisaDetailsValues> {
  const p = import.meta.env.VITE_VISA_TEST_PASSPORT?.trim();
  const f = import.meta.env.VITE_VISA_TEST_FIRST_NAME?.trim();
  const c = import.meta.env.VITE_VISA_TEST_COUNTRY?.trim();
  const out: Partial<VisaDetailsValues> = {};
  if (p) out.passportNumber = p;
  if (f) out.firstName = f;
  if (c) out.countryCode = c;
  return out;
}

const VISA_TEST_PREFILL = readVisaTestPrefillFromEnv();

const STEPS = [
  { id: 1, label: "Upload Passport", icon: FileImage },
  { id: 2, label: "Confirm Details", icon: FileEdit },
  { id: 3, label: "Captcha", icon: Shield },
  { id: 4, label: "Results", icon: CheckCircle2 },
];



export default function UmrahVisaCheck() {
  const [step, setStep] = useState(1);
  const [extractedData, setExtractedData] = useState<PassportExtractResult>({});
  const [formValues, setFormValues] = useState<Partial<VisaDetailsValues>>(() => ({ ...VISA_TEST_PREFILL }));
  const [lookupLoading, setLookupLoading] = useState(false);
  const [result, setResult] = useState<VisaResult | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleExtracted = (data: PassportExtractResult) => {
    setExtractedData(data);
    setFormValues((prev) => ({
      ...prev,
      passportNumber: data.passportNumber ?? prev.passportNumber,
      firstName: data.firstName ?? prev.firstName,
      countryCode: data.nationality ?? prev.countryCode,
    }));
    if (data.passportNumber || data.firstName) {
      setStep(2);
    }
  };

  const handleDetailsSubmit = (values: VisaDetailsValues) => {
    setFormValues(values);
    setStep(3);
  };

  const handleCaptchaSubmit = async (sessionData: string, captchaText: string) => {
    if (!formValues.passportNumber || !formValues.firstName || !formValues.countryCode) {
      toast({ variant: "destructive", title: "Missing details", description: "Please go back and fill all fields." });
      return;
    }

    setLookupLoading(true);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("visa-lookup", {
        body: {
          sessionData,
          passportNumber: formValues.passportNumber,
          firstName: formValues.firstName,
          countryCode: formValues.countryCode,
          captchaText,
        },
      });

      if (fnError) {
        setResult({ success: false, error: "Visa lookup failed. Please try again." });
        toast({ variant: "destructive", title: "Error", description: "Visa lookup failed. Please try again." });
        return;
      }

      setResult({
        success: data.success,
        visaDetails: data.visaDetails,
        error: data.error,
        mofaMessage: typeof data.mofaMessage === "string" ? data.mofaMessage : undefined,
      });
      if (data.success) setStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setResult({ success: false, error: msg.includes("abort") ? "Request timed out. Please try again." : msg });
      toast({ variant: "destructive", title: "Error", description: "Visa lookup failed. Please try again." });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setExtractedData({});
    setFormValues({ ...VISA_TEST_PREFILL });
    setResult(null);
  };

  const canGoToStep = (s: number) => {
    if (s === 1) return true;
    if (s === 2) return true;
    if (s === 3) return !!formValues.passportNumber && !!formValues.firstName && !!formValues.countryCode;
    if (s === 4) return !!result;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Umrah Visa Status Check</h1>
          <p className="mt-2 text-muted-foreground">
            Check your Umrah visa status using your passport details. Your data is not stored.
          </p>
        </div>

        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => canGoToStep(s.id) && setStep(s.id)}
                disabled={!canGoToStep(s.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                } ${!canGoToStep(s.id) ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-90"}`}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step - 1]?.label ?? "Step"}</CardTitle>
            <CardDescription>
              {step === 1 && "Upload your passport front page (image or PDF) to auto-fill details."}
              {step === 2 && "Review and edit your passport details before continuing."}
              {step === 3 && "Solve the captcha to verify your request."}
              {step === 4 && "Your visa lookup result."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <PassportUploadStep
                  onExtracted={handleExtracted}
                  disabled={lookupLoading}
                />
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full text-center text-sm text-muted-foreground underline hover:text-foreground"
                >
                  Skip and enter details manually
                </button>
              </div>
            )}

            {step === 2 && (
              <VisaDetailsForm
                defaultValues={{
                  passportNumber: extractedData.passportNumber ?? formValues.passportNumber ?? "",
                  firstName: extractedData.firstName ?? formValues.firstName ?? "",
                  countryCode: formValues.countryCode ?? "",
                }}
                onSubmit={handleDetailsSubmit}
                isLoading={lookupLoading}
              />
            )}

            {step === 3 && (
              <CaptchaStep
                onSubmit={handleCaptchaSubmit}
                isLoading={lookupLoading}
                passportNumber={formValues.passportNumber}
                firstName={formValues.firstName}
                countryCode={formValues.countryCode}
              />
            )}

            {step === 4 && result && (
              <VisaResultsStep
                result={result}
                onReset={handleReset}
                onRetry={handleRetry}
                fileNameHint={formValues.passportNumber}
              />
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This service retrieves visa information from the official Saudi Ministry of Foreign Affairs (MOFA) portal. We do not store your passport data.
        </p>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
