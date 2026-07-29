import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, KeyRound, Sparkles, Repeat } from "lucide-react";
import { ADDONS } from "@/lib/pricing";
import { useContactSettings } from "@/hooks/useContactSettings";

/**
 * Add-on band rendered directly below the three plan cards on the Pricing
 * section. Visually distinct from the plan cards — this is an add-on, not a
 * fourth tier.
 *
 * Prices sourced from `src/lib/pricing.ts` (ADDONS).
 */
const BrandSetupPack = () => {
  const { whatsappUrl } = useContactSettings();
  const pack = ADDONS.brandSetupPack;
  const sm = ADDONS.socialMediaManagement;

  return (
    <div className="max-w-5xl mx-auto mb-14">
      {/* ── Brand Setup Pack ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#412A86]/15 bg-gradient-to-br from-[#412A86]/[0.04] via-white to-[#2D9BFC]/[0.04] shadow-[0_8px_30px_rgb(0,0,0,0.05)] p-6 md:p-8">
        <div className="grid md:grid-cols-5 gap-6 md:gap-8 items-start">
          {/* Header + price */}
          <div className="md:col-span-2 space-y-3">
            <Badge className="bg-white text-[#412A86] border border-[#412A86]/20 hover:bg-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full px-3 py-1 shadow-none">
              Add-on
            </Badge>
            <h3 className="font-poppins text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {pack.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-gray-900">
                ₹{pack.price.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-medium text-gray-500">
                one-time + 18% GST
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {pack.tagline}
            </p>
            <p className="text-xs text-gray-500 italic">{pack.eligibility}</p>
            <Button
              asChild
              className="mt-2 h-12 rounded-full px-6 bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg"
            >
              <Link to="/signup?addon=brand-setup">Add to any plan</Link>
            </Button>
          </div>

          {/* Includes list */}
          <div className="md:col-span-3 space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">
                What's included
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {pack.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#412A86] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Value justification — the ₹14,999 vs freelancer-₹5,000 story */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-[#412A86] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Google Business Profile verification</span>{" "}
                  handled end-to-end.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Repeat className="h-4 w-4 text-[#412A86] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Five business profiles</span> created,
                  configured and cross-linked (GBP, LinkedIn, Instagram, Facebook, X).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <KeyRound className="h-4 w-4 text-[#412A86] flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  <span className="font-bold text-gray-900">
                    Full credential handover — every account is yours, in your name, with your passwords.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Social Media Management (secondary sub-add-on) ── */}
      <div className="mt-4 rounded-3xl border border-gray-100 bg-white shadow-[0_4px_16px_rgb(0,0,0,0.03)] p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 shadow-none">
              Ongoing add-on
            </Badge>
            <h4 className="font-poppins text-lg font-bold text-gray-900">
              {sm.name}
            </h4>
          </div>
          <p className="mt-1.5 text-sm text-gray-600">{sm.tagline}</p>
          <p className="mt-1 text-xs text-gray-500 italic">{sm.eligibility}</p>
        </div>
        <div className="md:text-right shrink-0">
          <div className="flex md:justify-end items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900">
              ₹{sm.price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-medium text-gray-500">/ month + 18% GST</span>
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-2 h-10 rounded-full px-5 border-gray-200 bg-white text-gray-900 hover:border-[#412A86]/30 hover:bg-white"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Talk to us
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandSetupPack;