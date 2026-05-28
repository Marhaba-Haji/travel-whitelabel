import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DIAL_CODES } from "@/lib/dial-codes";
import { getAttribution, getSessionId } from "@/hooks/useSessionTracking";

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

const RegisterDialog = ({ open, onOpenChange, priceInr, isFree, title }: Props) => {
  const [loading, setLoading] = useState(false);
  const gstAmount = isFree ? 0 : Math.round(priceInr * 0.18);
  const totalPayable = isFree ? 0 : priceInr + gstAmount;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", dialCode: "+91", phone: "", countryCode: "IN" },
  });

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

      // Build PayU form and submit
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.action;
      Object.entries(data.params as Record<string, string>).forEach(([k, val]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = val;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Reserve your seat</DialogTitle>
          <DialogDescription className="text-foreground/70">
            {title} · {isFree ? "Free" : `₹${totalPayable} (incl. 18% GST)`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="fullName" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl><Input placeholder="Your name" {...field} disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="you@example.com" {...field} disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <FormField name="dialCode" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <Select value={field.value} onValueChange={(val) => {
                    field.onChange(val);
                    const found = DIAL_CODES.find((d) => d.dial === val);
                    if (found) form.setValue("countryCode", found.code);
                  }} disabled={loading}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {DIAL_CODES.map((d) => (
                        <SelectItem key={`${d.code}-${d.dial}`} value={d.dial}>
                          {d.flag} {d.dial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp number</FormLabel>
                  <FormControl><Input type="tel" placeholder="98765 43210" {...field} disabled={loading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {!isFree && (
              <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1 text-sm">
                <div className="flex justify-between text-foreground/70"><span>Seat price</span><span>₹{priceInr.toFixed(0)}</span></div>
                <div className="flex justify-between text-foreground/70"><span>GST (18%)</span><span>₹{gstAmount}</span></div>
                <div className="flex justify-between pt-1.5 border-t border-border font-bold text-foreground"><span>Total payable</span><span>₹{totalPayable}</span></div>
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading}
              className="w-full h-12 rounded-full text-base font-semibold bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Securing your seat…</>
              ) : (
                <>{isFree ? "Confirm Free Seat" : `Pay ₹${totalPayable} & Reserve`}</>
              )}
            </Button>
            <div className="flex items-center justify-center gap-4 text-xs text-foreground/60 pt-1">
              <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Secure PayU checkout</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> 24-hour refund</span>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;