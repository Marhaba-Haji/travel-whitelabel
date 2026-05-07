import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ItineraryProvider } from "@/contexts/ItineraryContext";
import Index from "./pages/Index";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import PageLoader from "./components/PageLoader";
import SessionTrackingMount from "./components/SessionTrackingMount";

const NyraWidget = lazy(() => import("@/components/NyraWidget"));
const LeadMagnetTrigger = lazy(() => import("@/components/lead/LeadMagnetTrigger"));
const LiveActivity = lazy(() => import("@/components/lead/LiveActivity"));

const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const SignupSuccess = lazy(() => import("./pages/SignupSuccess"));
const AccountPendingActivation = lazy(() => import("./pages/AccountPendingActivation"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const CategoriesDestinations = lazy(() => import("./pages/CategoriesDestinations"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SharedItinerary = lazy(() => import("./pages/SharedItinerary"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const UmrahVisaCheck = lazy(() => import("./pages/UmrahVisaCheck"));
const Resource = lazy(() => import("./pages/Resource"));
const BookDemo = lazy(() => import("./pages/BookDemo"));
const Contact = lazy(() => import("./pages/Contact"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="aurora-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ItineraryProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SessionTrackingMount />
            <NyraWidget />
            <Suspense fallback={null}>
              <LeadMagnetTrigger />
              <LiveActivity />
            </Suspense>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signup-success" element={<SignupSuccess />} />
                <Route path="/account-pending" element={<AccountPendingActivation />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/categories-destinations" element={<CategoriesDestinations />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/itinerary/:shareId" element={<SharedItinerary />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/umrah-visa-check" element={<UmrahVisaCheck />} />
                <Route path="/resource/:slug" element={<Resource />} />
                <Route path="/book-demo" element={<BookDemo />} />
                <Route path="/contact" element={<Contact />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </TooltipProvider>
        </ItineraryProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
);

export default App;
