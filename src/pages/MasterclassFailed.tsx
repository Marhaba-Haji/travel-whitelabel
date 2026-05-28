import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";

const MasterclassFailed = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-[#fef0f8] flex items-center justify-center px-4 py-12">
    <SEOHead title="Payment Failed" description="Payment could not be completed." path="/masterclass/failed" noIndex />
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
      <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
        <XCircle className="h-9 w-9 text-red-600" />
      </div>
      <h1 className="font-poppins font-bold text-2xl mt-4">Payment didn't go through</h1>
      <p className="text-foreground/70 mt-2">No worries — no charge was made. Give it another try.</p>
      <Link to="/masterclass">
        <Button className="mt-6 h-12 rounded-full px-8 bg-[#412A86] hover:bg-[#412A86]/90 text-white font-semibold">
          Try Again
        </Button>
      </Link>
    </div>
  </div>
);

export default MasterclassFailed;