import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import PassportUploadStep, { type PassportExtractResult } from "@/components/visa/PassportUploadStep";
import VisaDetailsForm, { type VisaDetailsValues } from "@/components/visa/VisaDetailsForm";
import { supabase } from "@/integrations/supabase/client";
import CaptchaStep from "@/components/visa/CaptchaStep";
import VisaResultsStep, { type VisaResult } from "@/components/visa/VisaResultsStep";
import VisaStepIndicator from "@/components/visa/VisaStepIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import SEOHead from "@/components/seo/SEOHead";
import { serviceSchema, breadcrumbSchema, SITE_URL } from "@/lib/seo-schemas";

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
  { id: 1, label: "Upload Passport", description: "Upload a clear photo or PDF of your passport to auto-fill details." },
  { id: 2, label: "Confirm Details", description: "Review and edit your passport details before continuing." },
  { id: 3, label: "Verify", description: "Enter the captcha to verify your request." },
  { id: 4, label: "Results", description: "Your visa lookup result." },
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

  // Dev-only: ?mock=visa shows sample issued visa; use URL params for real user data (e.g. ?mock=visa&passport=R6026268&firstName=SHAMS%20UL&country=IND)
  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(location.search).get("mock") === "visa") {
      const params = new URLSearchParams(location.search);
      // Real user data from passport (defaults from attached image)
      const passport = params.get("passport") || "R6026268";
      const firstName = params.get("firstName") || "SHAMS UL";
      const surname = params.get("surname") || "HAQ";
      const country = params.get("country") || "IND";
      const dob = params.get("dob") || "30/05/1981";
      const placeOfBirth = params.get("placeOfBirth") || "KOLAR, KARNATAKA";

      // Prefill form with real input
      setFormValues((prev) => ({
        ...prev,
        passportNumber: passport,
        firstName: decodeURIComponent(firstName),
        countryCode: country,
      }));

      const sampleHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        @media print { .no-print{display:none} body{font-family:Arial;padding:20px} }
        body{margin:0;font-family:Arial;padding:20px;background:#fff}
        .visa-box{border:1px solid #333;padding:24px;max-width:800px;margin:0 auto}
        table{width:100%;border-collapse:collapse}
        td{padding:8px;border:1px solid #ddd}
        .header{text-align:center;margin-bottom:20px;font-size:18px}
      </style></head><body>
        <button class="no-print" onclick="window.print()">Print</button>
        <a class="no-print" href="#">Close</a>
        <div class="visa-box">
          <div class="header">Ministry of Foreign Affairs - Kingdom of Saudi Arabia<br>Visa Copy</div>
          <table>
            <tr><td>Passport Number</td><td>${passport}</td></tr>
            <tr><td>Surname</td><td>${surname}</td></tr>
            <tr><td>Given Names</td><td>${decodeURIComponent(firstName)}</td></tr>
            <tr><td>Nationality</td><td>${country}</td></tr>
            <tr><td>Date of Birth</td><td>${dob}</td></tr>
            <tr><td>Place of Birth</td><td>${decodeURIComponent(placeOfBirth)}</td></tr>
            <tr><td>Visa Type</td><td>Umrah</td></tr>
            <tr><td>Date of Issue</td><td>19/10/2024</td></tr>
            <tr><td>Date of Expiry</td><td>18/01/2025</td></tr>
          </table>
          <p style="margin-top:20px">This is a sample visa document for UI testing. Real MOFA output will look similar.</p>
        </div>
      </body></html>`;
      setResult({ success: true, visaDetails: { visaCopyHtml: sampleHtml } });
      setStep(4);
    }
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
      toast({ variant: "destructive", title: "Missing details", description: "Fill all fields." });
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
      // Always advance to results step so the user sees the outcome
      setStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setStep(4);
      setResult({ success: false, error: msg.includes("abort") ? "Timed out. Try again." : msg });
      toast({ variant: "destructive", title: "Error", description: "Lookup failed. Try again." });
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
    <div className="min-h-screen bg-white relative overflow-hidden" data-visa-page>
      <SEOHead
        title="Umrah Visa Status Checker"
        description="Check your Saudi Umrah visa status instantly using official MOFA data. Upload your passport, verify, and get real-time results. Free and secure."
        path="/umrah-visa-check"
        keywords={["Umrah visa check", "MOFA visa status", "Saudi visa verification", "Umrah visa lookup"]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to check your Umrah visa status",
            description:
              "Verify your Saudi Umrah visa using official MOFA data in three steps.",
            totalTime: "PT2M",
            step: [
              { "@type": "HowToStep", position: 1, name: "Upload passport", text: "Upload a clear scan of your passport bio page." },
              { "@type": "HowToStep", position: 2, name: "Solve captcha", text: "Confirm the MOFA captcha to authorize the lookup." },
              { "@type": "HowToStep", position: 3, name: "View status", text: "Receive your live Umrah visa status from MOFA." },
            ],
          },
          serviceSchema(
            "Umrah Visa Status Check",
            "Free Saudi Umrah visa verification using official MOFA data with passport OCR and captcha automation.",
            `${SITE_URL}/umrah-visa-check`,
          ),
          breadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: "Umrah Visa Check", url: `${SITE_URL}/umrah-visa-check` },
          ]),
        ]}
      />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#2D9BFC]/5 rounded-full blur-3xl pointer-events-none" />
      <Header />
      <main className={`container mx-auto px-4 sm:px-6 pt-[4.5rem] lg:pt-20 pb-5 sm:pb-10 md:pb-12 relative z-10 ${step === 4 ? "max-w-4xl" : "max-w-xl"}`}>
        <div className="mb-5 sm:mb-8 text-center space-y-4 sm:space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <span className="inline-block bg-cyan-50 text-cyan-600 font-bold tracking-wide text-xs px-4 py-1.5 rounded-full uppercase mb-2">
              Visa Service
            </span>
            <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight text-gray-900">
              Umrah Visa <span className="text-[#B968C7]">Status Check</span>
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed px-1">
              Official MOFA data. Your data is not stored.
            </p>
          </div>

          <VisaStepIndicator
            currentStep={step}
            canGoToStep={canGoToStep}
            onStepClick={setStep}
          />
        </div>

        <Card className="rounded-3xl bg-white border border-gray-100 shadow-soft">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="font-poppins text-lg font-bold text-gray-900">{STEPS[step - 1]?.label ?? "Step"}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {STEPS[step - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-3 sm:space-y-4">
                <PassportUploadStep
                  onExtracted={handleExtracted}
                  disabled={lookupLoading}
                />
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2 text-center text-xs sm:text-sm text-muted-foreground underline hover:text-foreground touch-manipulation min-h-[44px] flex items-center justify-center"
                >
                  Enter details manually
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
                applicantPassport={formValues.passportNumber}
                applicantFirstName={formValues.firstName}
                onReset={handleReset}
                onRetry={handleRetry}
              />
            )}
          </CardContent>
        </Card>

        <p className="mt-4 sm:mt-6 text-center text-[11px] sm:text-xs text-muted-foreground px-2">
          Sourced from MOFA. Passport data not stored.
        </p>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
