import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, CheckCircle2, CreditCard, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import OrderSummary from "./OrderSummary";

// Phone validation for Indian format: +91XXXXXXXXXX or 10 digits
const phoneRegex = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .min(1, "Full name is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .refine(
        (val) => {
          // Remove spaces and dashes for validation
          const cleaned = val.replace(/[\s-]/g, "");
          return phoneRegex.test(cleaned);
        },
        {
          message: "Please enter a valid Indian phone number (+91XXXXXXXXXX or 10 digits)",
        }
      ),
    city: z
      .string()
      .min(2, "City must be at least 2 characters")
      .min(1, "City is required"),
    couponCode: z.string().optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const PAYMENT_LINK_KEY = "signup_payment_pending";

interface SignupFormProps {
  selectedPlanName: string;
  planBasePrice: number;
  planKey: string;
  gstPercent: number;
  symbol?: string;
  billingCycle?: "monthly" | "annual";
}

type CouponValidation =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "valid"; discount_type: string; discount_value: number }
  | { status: "invalid"; error: string };

const SignupForm = ({ selectedPlanName, planBasePrice, planKey, gstPercent, symbol = "₹", billingCycle = "annual" }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponValidation, setCouponValidation] = useState<CouponValidation>({ status: "idle" });
  const [showSummary, setShowSummary] = useState(false);
  const [validatedData, setValidatedData] = useState<SignupFormValues | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const subtotalForDiscount = planBasePrice * (1 + gstPercent / 100);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      couponCode: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  // Watch password fields for real-time match validation
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const couponCode = form.watch("couponCode");
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const computeDiscountSavings = (): number => {
    if (couponValidation.status !== "valid") return 0;
    if (couponValidation.discount_type === "percentage") {
      return subtotalForDiscount * (couponValidation.discount_value / 100);
    }
    return Math.min(couponValidation.discount_value, subtotalForDiscount);
  };

  const discountSavings = computeDiscountSavings();
  const couponSavingsFormatted = discountSavings > 0
    ? `${symbol}${Math.round(discountSavings).toLocaleString("en-IN")}`
    : null;

  const validateCoupon = async () => {
    const code = String(couponCode || "").trim().toUpperCase();
    if (!code) {
      setCouponValidation({ status: "idle" });
      return;
    }
    setCouponValidation({ status: "validating" });
    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { code, planKey },
      });
      if (error) {
        setCouponValidation({ status: "invalid", error: error.message || "Validation failed" });
        return;
      }
      const result = data as { valid: boolean; error?: string; discount_type?: string; discount_value?: number };
      if (!result.valid) {
        setCouponValidation({ status: "invalid", error: result.error || "Invalid coupon code" });
        return;
      }
      if (
        (result.discount_type === "percentage" || result.discount_type === "fixed") &&
        typeof result.discount_value === "number"
      ) {
        setCouponValidation({ status: "valid", discount_type: result.discount_type, discount_value: result.discount_value });
      } else {
        setCouponValidation({ status: "invalid", error: "Invalid discount data" });
      }
    } catch (e) {
      setCouponValidation({ status: "invalid", error: (e as Error).message || "Failed to validate coupon" });
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, "");
    
    // If starts with +91, keep it
    if (cleaned.startsWith("+91")) {
      // Limit to +91 followed by 10 digits
      const digits = cleaned.slice(3);
      if (digits.length <= 10) {
        return `+91${digits}`;
      }
      return `+91${digits.slice(0, 10)}`;
    }
    
    // If starts with 91 and has more than 2 digits, add +
    if (cleaned.startsWith("91") && cleaned.length > 2) {
      const digits = cleaned.slice(2);
      if (digits.length <= 10) {
        return `+91${digits}`;
      }
      return `+91${digits.slice(0, 10)}`;
    }
    
    // If just digits and length > 0, format as +91
    if (/^\d+$/.test(cleaned) && cleaned.length > 0) {
      if (cleaned.length <= 10) {
        return cleaned;
      }
      return cleaned.slice(0, 10);
    }
    
    return cleaned;
  };

  const getEdgeFunctionUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kofijegdzeshitunwddn.supabase.co";
    return `${supabaseUrl}/functions/v1/create-payment`;
  };

  const onSubmit = async (data: SignupFormValues) => {
    setValidatedData(data);
    // Persist the registration immediately (without the password) so we capture
    // the lead even if the user abandons before payment.
    try {
      const cleanedPhone = data.phone.replace(/\D/g, "").slice(-10);
      const { data: existing } = await supabase
        .from("registrations")
        .select("id, status")
        .eq("email", data.email.trim())
        .maybeSingle();

      if (existing?.id) {
        setRegistrationId(existing.id);
      } else {
        const { data: inserted, error } = await supabase
          .from("registrations")
          .insert({
            full_name: data.fullName.trim().slice(0, 100),
            email: data.email.trim().slice(0, 255),
            phone: cleanedPhone || data.phone.trim(),
            city: data.city ? data.city.trim().slice(0, 100) : null,
            terms_accepted: Boolean(data.termsAccepted),
            plan_name: selectedPlanName,
            status: "pending_payment",
          })
          .select("id")
          .single();
        if (error) {
          console.warn("Pre-payment registration save failed:", error.message);
        } else if (inserted?.id) {
          setRegistrationId(inserted.id);
        }
      }
    } catch (e) {
      console.warn("Pre-payment registration save error:", (e as Error).message);
    }
    setShowSummary(true);
  };

  const proceedToPayment = async () => {
    if (!validatedData) return;
    setIsLoading(true);

    try {
      const url = getEdgeFunctionUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone,
          city: validatedData.city,
          couponCode: validatedData.couponCode?.trim() || undefined,
          password: validatedData.password,
          termsAccepted: validatedData.termsAccepted,
          planName: selectedPlanName,
          planKey: planKey,
          billingCycle: billingCycle,
        }),
      });

      let json: { action?: string; params?: Record<string, string>; demo?: boolean; redirect?: string; error?: string; message?: string } = {};
      try {
        json = (await res.json()) as typeof json;
      } catch {
        toast({
          variant: "destructive",
          title: "Invalid server response",
          description: "Could not process payment setup. Please try again.",
        });
        return;
      }

      if (json.demo && json.redirect) {
        sessionStorage.setItem(PAYMENT_LINK_KEY, JSON.stringify(validatedData));
        window.location.href = json.redirect;
        return;
      }

      if (!res.ok) {
        if (res.status >= 500 || res.status === 0) {
          sessionStorage.setItem(PAYMENT_LINK_KEY, JSON.stringify(validatedData));
          window.location.href = "/signup-success";
          return;
        }
        toast({
          variant: "destructive",
          title: json.error || "Payment setup failed",
          description: json.message || "Please try again or contact support.",
        });
        return;
      }

      sessionStorage.setItem(PAYMENT_LINK_KEY, JSON.stringify(validatedData));

      if (!json.action || !json.params) {
        toast({
          variant: "destructive",
          title: "Payment gateway not available",
          description: json.error || json.message || "PayU may not be configured.",
        });
        return;
      }

      const payForm = document.createElement("form");
      payForm.method = "POST";
      payForm.action = json.action;
      Object.entries(json.params).forEach(([key, value]) => {
        if (value != null && value !== "") {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          payForm.appendChild(input);
        }
      });
      document.body.appendChild(payForm);
      payForm.submit();
    } catch (err) {
      console.error("Payment setup error:", err);
      toast({
        variant: "destructive",
        title: "Cannot reach payment server",
        description: "Please try again later or contact support.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showSummary && validatedData) {
    return (
      <OrderSummary
        fullName={validatedData.fullName}
        email={validatedData.email}
        phone={validatedData.phone}
        city={validatedData.city}
        couponCode={validatedData.couponCode?.trim().toUpperCase()}
        selectedPlanName={selectedPlanName}
        basePrice={planBasePrice}
        gstPercent={gstPercent}
        symbol={symbol}
        billingCycle={billingCycle}
        discount={
          couponValidation.status === "valid"
            ? { type: couponValidation.discount_type, value: couponValidation.discount_value }
            : null
        }
        onConfirm={proceedToPayment}
        onBack={() => setShowSummary(false)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="h-11"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-11"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="h-11"
                    {...field}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Mumbai"
                    className="h-11"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="couponCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Coupon Code (optional)
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter code for discount"
                    className="h-11 flex-1"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (couponValidation.status !== "idle") setCouponValidation({ status: "idle" });
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 shrink-0"
                  onClick={validateCoupon}
                  disabled={isLoading || !field.value?.trim()}
                >
                  {couponValidation.status === "validating" ? "..." : "Apply"}
                </Button>
              </div>
              {couponValidation.status === "valid" && couponSavingsFormatted && (
                <p className="text-sm text-primary font-medium">
                  Coupon applied! You&apos;ll save {couponSavingsFormatted}
                </p>
              )}
              {couponValidation.status === "invalid" && (
                <p className="text-sm text-destructive">{couponValidation.error}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    className="h-11 pr-10"
                    {...field}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`h-11 pr-10 ${
                      passwordsMatch && confirmPassword
                        ? "border-primary/50"
                        : ""
                    }`}
                    {...field}
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {passwordsMatch && confirmPassword && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer font-normal text-sm">
                  I agree to the{" "}
                  <Link
                    to="/terms-of-service"
                    className="text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold rounded-full bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg"
          disabled={isLoading}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Review Order & Pay {couponSavingsFormatted ? `— Save ${couponSavingsFormatted}` : `${symbol}${Math.round(planBasePrice * (1 + gstPercent / 100)).toLocaleString("en-IN")}`}
        </Button>

        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#412A86] hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500">
          Want to see how it works?{" "}
          <Link
            to="/book-demo"
            className="text-[#412A86] hover:underline font-semibold"
          >
            Book a Demo
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignupForm;
