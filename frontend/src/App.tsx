import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import VenueDetail from "./pages/VenueDetail.tsx";
import Feedback from "./pages/Feedback.tsx";
import Auth from "./pages/Auth.tsx";
import PaymentVerify from "./pages/PaymentVerify.tsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout.tsx";
import Overview from "./pages/dashboard/Overview";
import Venues from "./pages/dashboard/Venues";
import Inspections from "./pages/dashboard/Inspections";
import QR from "./pages/dashboard/QR";
import DashboardFeedback from "./pages/dashboard/Feedback";
import Settings from "./pages/dashboard/Settings";
import SubscriptionManagement from "./pages/dashboard/SubscriptionManagement.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/venue/:id" element={<VenueDetail />} />
          <Route path="/feedback/:venueId" element={<Feedback />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment/verify" element={<PaymentVerify />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="venues" element={<Venues />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="qr" element={<QR />} />
            <Route path="feedback" element={<DashboardFeedback />} />
            <Route path="settings" element={<Settings />} />
            <Route path="subscription" element={<SubscriptionManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
