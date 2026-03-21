import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/countries";

const schema = z.object({
  passportNumber: z.string().min(1, "Passport number is required").max(50),
  firstName: z.string().min(1, "First name is required").max(100),
  countryCode: z.string().min(1, "Please select your nationality"),
});

export type VisaDetailsValues = z.infer<typeof schema>;

interface VisaDetailsFormProps {
  defaultValues: Partial<VisaDetailsValues>;
  onSubmit: (values: VisaDetailsValues) => void;
  isLoading?: boolean;
}

export default function VisaDetailsForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: VisaDetailsFormProps) {
  const form = useForm<VisaDetailsValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      passportNumber: defaultValues.passportNumber ?? "",
      firstName: defaultValues.firstName ?? "",
      countryCode: defaultValues.countryCode ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="passportNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passport Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. A1234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="As shown on passport" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          Continue to captcha
        </Button>
      </form>
    </Form>
  );
}
