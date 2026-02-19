import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, User, Mail, Phone, MapPin, Ticket, Loader2, Package } from "lucide-react";

interface OrderSummaryProps {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  couponCode?: string;
  selectedPlanName: string;
  basePrice: number;
  gstPercent: number;
  symbol: string;
  discount?: { type: string; value: number } | null;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const OrderSummary = ({
  fullName,
  email,
  phone,
  city,
  couponCode,
  selectedPlanName,
  basePrice,
  gstPercent,
  symbol,
  discount,
  onConfirm,
  onBack,
  isLoading,
}: OrderSummaryProps) => {
  const gstAmount = basePrice * (gstPercent / 100);
  const subtotal = basePrice + gstAmount;

  let discountAmount = 0;
  if (discount) {
    if (discount.type === "percentage") {
      discountAmount = subtotal * (discount.value / 100);
    } else {
      discountAmount = discount.value;
    }
  }
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const formatAmount = (val: number) =>
    `${symbol}${Math.round(val).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-foreground">Order Summary</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Please review your details before proceeding to payment.
      </p>

      {/* Selected Plan */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Selected Plan</p>
            <p className="font-semibold text-foreground">{selectedPlanName}</p>
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div className="bg-muted/50 border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Registration Details
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground w-16">Name</span>
            <span className="text-sm font-medium text-foreground">{fullName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground w-16">Email</span>
            <span className="text-sm font-medium text-foreground">{email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground w-16">Phone</span>
            <span className="text-sm font-medium text-foreground">{phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground w-16">City</span>
            <span className="text-sm font-medium text-foreground">{city}</span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-muted/50 border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Price Breakdown
        </h3>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price ({selectedPlanName})</span>
            <span className="font-medium text-foreground">{formatAmount(basePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST ({gstPercent}%)</span>
            <span className="font-medium text-foreground">{formatAmount(gstAmount)}</span>
          </div>
          {discount && discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 text-primary">
                <Ticket className="h-3.5 w-3.5" />
                Coupon ({couponCode})
              </span>
              <span className="font-medium text-primary">-{formatAmount(discountAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Amount</span>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
              {formatAmount(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        MarhabaDMC — Annual Subscription · {selectedPlanName}
      </div>

      <Button
        type="button"
        onClick={onConfirm}
        className="w-full h-12 text-base font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Confirm & Pay {formatAmount(totalAmount)}
          </>
        )}
      </Button>
    </div>
  );
};

export default OrderSummary;
