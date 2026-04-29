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
import DashboardLayout from "./pages/dashboard/DashboardLayout.tsx";
import Overview from "./pages/dashboard/Overview.tsx";
import Venues from "./pages/dashboard/Venues.tsx";
import Inspections from "./pages/dashboard/Inspections.tsx";
import QR from "./pages/dashboard/QR.tsx";
import DashboardFeedback from "./pages/dashboard/Feedback.tsx";
import Settings from "./pages/dashboard/Settings.tsx";

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
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="venues" element={<Venues />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="qr" element={<QR />} />
            <Route path="feedback" element={<DashboardFeedback />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
