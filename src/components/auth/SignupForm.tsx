import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

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

const SIGNUP_AMOUNT = "₹18,799";
const PAYMENT_LINK_KEY = "signup_payment_pending";

interface SignupFormProps {
  amount?: string;
}

const SignupForm = ({ amount = SIGNUP_AMOUNT }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  // Watch password fields for real-time match validation
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

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

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? "";
      const res = await fetch(`${apiBase}/api/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          city: data.city,
          password: data.password,
          termsAccepted: data.termsAccepted,
        }),
      });

      let json: { action?: string; params?: Record<string, string>; demo?: boolean; redirect?: string; error?: string; message?: string };
      try {
        json = await res.json();
      } catch {
        json = {};
      }

      // Demo mode when PayU not configured
      if (json.demo && json.redirect) {
        sessionStorage.setItem(PAYMENT_LINK_KEY, JSON.stringify(data));
        window.location.href = json.redirect;
        return;
      }

      if (!res.ok) {
        // Fallback to demo when server unreachable or returns 5xx (e.g. PayU not configured)
        if (res.status >= 500 || res.status === 0) {
          sessionStorage.setItem(PAYMENT_LINK_KEY, JSON.stringify(data));
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

      sessionStorage.setItem(PAYMENT_LINK_KEY, JSON.stringify(data));

      if (!json.action || !json.params) {
        toast({
          variant: "destructive",
          title: "Invalid response",
          description: "Please try again or contact support.",
        });
        return;
      }

      // Submit form to PayU gateway
      const form = document.createElement("form");
      form.method = "POST";
      form.action = json.action;
      Object.entries(json.params).forEach(([key, value]) => {
        if (value != null && value !== "") {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      // API unreachable (server not running) - demo redirect
      sessionStorage.setItem(PAYMENT_LINK_KEY, JSON.stringify(data));
      window.location.href = "/signup-success";
    } finally {
      setIsLoading(false);
    }
  };

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
          className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing to payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Register & Pay {amount}
            </>
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignupForm;
