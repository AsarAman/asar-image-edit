import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { DefaultProviders } from "./components/providers/default.tsx";
import { trackPageView } from "./lib/analytics";

// Eager load: Homepage, Auth Callback, and NotFound (critical paths)
import Index from "./pages/Index.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy load: Heavy routes that don't need immediate loading
const EditorPage = lazy(() => import("./pages/editor/page.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/page.tsx"));
const AccountPage = lazy(() => import("./pages/account/page.tsx"));
const TestimonialsPage = lazy(() => import("./pages/testimonials/page.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/privacy/page.tsx"));
const TermsAndConditions = lazy(() => import("./pages/terms/page.tsx"));
const RefundPolicy = lazy(() => import("./pages/refund/page.tsx"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        <p className="mt-4 text-lg font-bold">Loading...</p>
      </div>
    </div>
  );
}

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

// Component to track page views
function PageViewTracker() {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null;
}

function AppContent() {
  const ga4MeasurementId = useQuery(api.analytics.getGA4MeasurementId);

  // Initialize Google Analytics when measurement ID is available
  useEffect(() => {
    if (ga4MeasurementId && !window.gtag) {
      console.log("Initializing GA4 with measurement ID:", ga4MeasurementId);
      
      // Load gtag.js script
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`;
      document.head.appendChild(script);

      // Initialize dataLayer and gtag function
      window.dataLayer = window.dataLayer || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function gtag(...args: any[]) {
        window.dataLayer?.push(args);
      }
      window.gtag = gtag as (command: string, targetId: string, config?: Record<string, unknown>) => void;
      
      // Initialize GA4
      gtag("js", new Date());
      gtag("config", ga4MeasurementId, {
        send_page_view: false // We'll manually track page views
      });
      
      console.log("GA4 initialized successfully");
    }
  }, [ga4MeasurementId]);

  return (
    <BrowserRouter>
      <PageViewTracker />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <DefaultProviders>
      <AppContent />
    </DefaultProviders>
  );
}
