import { Link, useSearchParams } from "react-router-dom";
import { XCircle, ArrowRight } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import "@/styles/masterclass.css";

const MasterclassFailed = () => {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  return (
  <div className="mc-scope min-h-screen mc-bg-radial flex items-center justify-center px-4 py-12">
    <SEOHead
      title="Payment Failed"
      description="Payment could not be completed."
      path="/masterclass/failed"
      noIndex
    />
    <div className="mc-glass-strong w-full max-w-md p-8 text-center relative overflow-hidden">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-[var(--mc-error)]/15 blur-3xl pointer-events-none" />
      <div className="relative h-16 w-16 mx-auto rounded-full bg-[var(--mc-error)]/15 border border-[var(--mc-error)]/40 flex items-center justify-center">
        <XCircle className="h-9 w-9 text-[var(--mc-error)]" />
      </div>
      <h1 className="mc-h-md mt-5 text-[var(--mc-on-surface)]">Payment didn't go through</h1>
      <p className="mt-2 text-[var(--mc-on-surface-variant)]">
        No worries — no charge was made. Give it another try.
      </p>
      {orderId && (
        <div className="mt-5 rounded-xl bg-white/[0.04] border border-[rgba(213,189,240,0.18)] p-3 text-left">
          <div className="mc-label text-[var(--mc-on-surface-variant)] text-[10px]">Order ID (quote in support)</div>
          <code className="font-mono text-xs font-semibold text-[var(--mc-on-surface)] break-all">{orderId}</code>
        </div>
      )}
      <Link to="/masterclass" className="mc-cta mc-cta-primary mt-6 h-12 px-8">
        Try Again <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </div>
  );
};

export default MasterclassFailed;
