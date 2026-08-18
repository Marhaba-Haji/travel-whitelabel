import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Mail, Copy, Check, Download, Loader2 } from "lucide-react";
import LogoAnimated from "@/components/landing/LogoAnimated";
import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { downloadInvoice } from "@/lib/invoice-pdf";
import { toast } from "sonner";

const SignupSuccess = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [params] = useSearchParams();
  const orderId = params.get("order");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    try {
      const pending = sessionStorage.getItem("signup_payment_pending");
      if (pending) {
        const data = JSON.parse(pending);
        setUserEmail(data.email ?? null);
        sessionStorage.removeItem("signup_payment_pending");
      }
    } catch {
      // Ignore parse errors
    }

    // Ensure order ID is always visible in the URL
    if (orderId && !window.location.search.includes("order=")) {
      const url = new URL(window.location.href);
      url.searchParams.set("order", orderId);
      window.history.replaceState({}, "", url);
    }
  }, [orderId]);

  const copyOrder = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      await downloadInvoice(orderId);
    } catch (e) {
      toast.error((e as Error).message || "Could not generate invoice");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-background">
      <SEOHead
        title="Signup Successful"
        description="Your marhabaDMC signup is complete. Start your travel business with a white-label portal, flight/hotel/visa APIs, AI sales assistant, training, and ongoing support. Check your email for next steps."
        path="/signup-success"
        noIndex
      />
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl text-center animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>

          <div className="mb-6">
            <LogoAnimated size="lg" />
          </div>

          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Registration Successful!
          </h1>
          <p className="text-muted-foreground mb-6">
            Welcome to marhabaDMC! Your account has been created and your payment has been processed.
          </p>

          {userEmail && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8 p-4 bg-muted/50 rounded-xl">
              <Mail className="h-4 w-4" />
              <span>Check your inbox at <strong className="text-foreground">{userEmail}</strong> for next steps.</span>
            </div>
          )}

          {orderId && (
            <div className="mb-8 p-4 rounded-xl bg-muted/50 text-left">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Order ID</div>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-sm font-semibold text-foreground break-all">{orderId}</code>
                <button
                  type="button"
                  onClick={copyOrder}
                  className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors"
                  aria-label="Copy order ID"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Please save this Order ID for your records and any support requests.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {downloading ? "Preparing invoice…" : "Download Invoice (PDF)"}
              </button>
            </div>
          )}

          <div className="space-y-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign in to your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccess;
