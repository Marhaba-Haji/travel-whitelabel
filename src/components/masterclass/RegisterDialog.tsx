import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DIAL_CODES } from "@/lib/dial-codes";
import { getAttribution, getSessionId } from "@/hooks/useSessionTracking";
import "@/styles/masterclass.css";

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  dialCode: z.string().min(1, "Required"),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(15),
  countryCode: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  priceInr: number;
  isFree: boolean;
  title: string;
}

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mc-label text-[var(--mc-on-surface-variant)] block mb-2">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-[var(--mc-error)] mt-1.5">{error}</p>}
  </div>
);

const RegisterDialog = ({ open, onOpenChange, priceInr, isFree, title }: Props) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", dialCode: "+91", phone: "", countryCode: "IN" },
  });
  const { register, handleSubmit, formState, watch, setValue } = form;
  const dialCode = watch("dialCode");

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-webinar-payment", {
        body: {
          fullName: v.fullName,
          email: v.email,
          phone: v.phone,
          dialCode: v.dialCode,
          countryCode: v.countryCode,
          utm: getAttribution() || {},
          sessionId: getSessionId(),
        },
      });
      if (error) throw error;

      if (data?.free) {
        window.location.href = `/masterclass/success?reg=${data.registrationId}`;
        return;
      }

      const payForm = document.createElement("form");
      payForm.method = "POST";
      payForm.action = data.action;
      Object.entries(data.params as Record<string, string>).forEach(([k, val]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = val;
        payForm.appendChild(input);
      });
      document.body.appendChild(payForm);
      payForm.submit();
    } catch (err) {
      console.error("register error", err);
      toast({
        title: "Could not start payment",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="mc-scope sm:max-w-md border-0 p-0 bg-transparent shadow-none">
        <div className="mc-glass-strong p-6 md:p-7 relative overflow-hidden">
          {/* Halo */}
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[var(--mc-secondary)]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[var(--mc-tertiary)]/15 blur-3xl pointer-events-none" />

          <DialogHeader className="relative space-y-2 text-left">
            <span className="mc-chip mc-chip-green w-fit">Reserve your seat</span>
            <DialogTitle className="mc-h-md text-[var(--mc-on-surface)]">
              {title}
            </DialogTitle>
            <DialogDescription className="text-[var(--mc-on-surface-variant)] text-sm">
              {isFree
                ? "Free seat · No card needed"
                : `Today only · ₹${priceInr.toFixed(0)} · Live class only`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="relative mt-5 space-y-4">
            <Field label="Full name" error={formState.errors.fullName?.message}>
              <input
                className="mc-input"
                placeholder="Your name"
                disabled={loading}
                {...register("fullName")}
              />
            </Field>

            <Field label="Email" error={formState.errors.email?.message}>
              <input
                type="email"
                className="mc-input"
                placeholder="you@example.com"
                disabled={loading}
                {...register("email")}
              />
            </Field>

            <div className="grid grid-cols-[110px_1fr] gap-2">
              <Field label="Code">
                <select
                  className="mc-input pr-2 appearance-none"
                  disabled={loading}
                  value={dialCode}
                  onChange={(e) => {
                    setValue("dialCode", e.target.value, { shouldValidate: true });
                    const found = DIAL_CODES.find((d) => d.dial === e.target.value);
                    if (found) setValue("countryCode", found.code);
                  }}
                >
                  {DIAL_CODES.map((d) => (
                    <option
                      key={`${d.code}-${d.dial}`}
                      value={d.dial}
                      className="bg-[var(--mc-surface-c)] text-[var(--mc-on-surface)]"
                    >
                      {d.flag} {d.dial}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="WhatsApp number" error={formState.errors.phone?.message}>
                <input
                  type="tel"
                  className="mc-input"
                  placeholder="98765 43210"
                  disabled={loading}
                  {...register("phone")}
                />
              </Field>
            </div>

            <button type="submit" disabled={loading} className="mc-cta mc-cta-primary w-full h-14 text-base">
              {loading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Securing your seat…
                </>
              ) : (
                <>
                  {isFree ? "Confirm Free Seat" : `Pay ₹${priceInr.toFixed(0)} & Reserve`}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[var(--mc-on-surface-variant)] pt-1">
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Secure PayU checkout
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> 24-hour refund
              </span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
