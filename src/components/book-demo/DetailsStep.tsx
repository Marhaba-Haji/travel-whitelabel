import { format } from "date-fns";
import { ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DIAL_CODES } from "@/lib/dial-codes";

const detailsSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  country_code: z.string().min(2),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^\d{6,15}$/, "Enter a valid WhatsApp number (digits only)"),
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .max(255)
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export type DetailsValues = z.infer<typeof detailsSchema>;

export interface DetailsStepProps {
  date: Date;
  time: string;
  fullName: string;
  setFullName: (v: string) => void;
  countryCode: string;
  setCountryCode: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  submitting: boolean;
  onBack: () => void;
  onValidSubmit: (values: DetailsValues) => void;
  fieldClass: string;
  textareaClass: string;
  selectTriggerClass: string;
  primaryBtnClass: string;
  secondaryBtnClass: string;
}

const DetailsStep = ({
  date,
  time,
  fullName,
  setFullName,
  countryCode,
  setCountryCode,
  whatsapp,
  setWhatsapp,
  email,
  setEmail,
  notes,
  setNotes,
  submitting,
  onBack,
  onValidSubmit,
  fieldClass,
  textareaClass,
  selectTriggerClass,
  primaryBtnClass,
  secondaryBtnClass,
}: DetailsStepProps) => {
  const handleSubmit = () => {
    const parsed = detailsSchema.safeParse({
      full_name: fullName,
      country_code: countryCode,
      whatsapp_number: whatsapp,
      email: email || undefined,
      notes,
    });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first || "Please check your details");
      return;
    }
    onValidSubmit(parsed.data);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <UserIcon className="h-5 w-5 text-[#412A86]" />
        <h3 className="font-poppins font-bold text-xl text-gray-900">Your details</h3>
      </div>
      <p className="text-sm text-gray-600 mb-5">
        Booking for{" "}
        <span className="font-semibold text-gray-900">
          {format(date, "EEE, d MMM")} at {time}
        </span>
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full name *</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className={fieldClass}
          />
        </div>

        <div>
          <Label>WhatsApp number *</Label>
          <div className="mt-1.5 flex gap-2">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className={cn("w-[130px]", selectTriggerClass)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {DIAL_CODES.map((c) => (
                  <SelectItem key={c.code} value={c.dial}>
                    {c.flag} {c.dial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
              placeholder="9876543210"
              className={cn(fieldClass, "flex-1")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={fieldClass}
          />
        </div>

        <div>
          <Label htmlFor="notes">Anything specific you'd like to see? (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Focus on B2C portal & flight API integration"
            className={textareaClass}
            maxLength={500}
          />
        </div>

        <p className="text-xs text-gray-500">
          By confirming, you agree to be contacted by our team about this demo.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className={secondaryBtnClass}
          disabled={submitting}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className={cn(primaryBtnClass, "px-7")}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Confirming...
            </>
          ) : (
            <>Confirm Booking</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DetailsStep;