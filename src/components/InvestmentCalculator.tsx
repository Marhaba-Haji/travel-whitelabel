import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Calculator, Sparkles } from "lucide-react";

const InvestmentCalculator = () => {
  const [bookingsPerMonth, setBookingsPerMonth] = useState([10]);
  
  // Average commission per booking
  const avgCommissionPerBooking = 2000;
  const investmentAmount = 18799;
  
  const monthlyEarnings = bookingsPerMonth[0] * avgCommissionPerBooking;
  const yearlyEarnings = monthlyEarnings * 12;
  const roi = Math.round((yearlyEarnings / investmentAmount) * 100);
  const paybackMonths = Math.ceil(investmentAmount / monthlyEarnings);

  return (
    <div className="bg-card border-2 border-primary/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Investment Calculator</h3>
          <p className="text-xs text-muted-foreground">See your potential earnings</p>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Bookings per month</span>
          <span className="text-lg font-bold text-primary">{bookingsPerMonth[0]}</span>
        </div>
        <Slider
          value={bookingsPerMonth}
          onValueChange={setBookingsPerMonth}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1</span>
          <span>50</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Monthly Earnings</span>
          <span className="font-bold text-foreground">₹{monthlyEarnings.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <span className="text-sm font-medium text-foreground">Yearly Earnings</span>
          <span className="font-bold text-primary text-lg">₹{yearlyEarnings.toLocaleString()}</span>
        </div>
      </div>

      {/* ROI Highlight */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-2xl font-bold text-primary">{roi}x</span>
          <span className="text-sm text-muted-foreground">Return on Investment</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Investment recovered in <span className="font-semibold text-primary">{paybackMonths} {paybackMonths === 1 ? 'month' : 'months'}</span></span>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;
