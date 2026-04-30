import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import PaywallModal from "@/components/PaywallModal";
import { api } from "@/lib/api";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'FREE' | 'ACTIVE'>('FREE');
  const [loadingSubscription, setLoadingSubscription] = useState(() => {
    // Check if we already know the subscription status from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      return parsedUser.subscriptionStatus !== 'ACTIVE'; // Only loading if not already ACTIVE
    }
    return true;
  });

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }
    
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || user.email || "User");
        setUser(user);
      } catch (error) {
        setUserName("User");
      }
    }
  }, [token, navigate]);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Re-check subscription when component mounts or user changes
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, []);

  
  const checkSubscriptionStatus = async () => {
    try {
      console.log('DashboardLayout: Checking subscription for user:', user.id);
      setLoadingSubscription(true);
      const subscriptionData = await api.payments.getSubscription(user.id);
      const subscription = subscriptionData.subscription;
      console.log('Subscription check result:', subscriptionData);
      console.log('Subscription status:', subscription.status);
      setSubscriptionStatus(subscription.status);
      console.log('DashboardLayout: Set subscription status to:', subscription.status);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setSubscriptionStatus('FREE');
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('handlePaymentSuccess called');
    setSubscriptionStatus('ACTIVE');
    console.log('Subscription status set to ACTIVE');
    // Re-check subscription status to ensure it's properly updated
    if (user) {
      setTimeout(() => checkSubscriptionStatus(), 1000);
    }
  };

  if (loadingSubscription) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen w-full bg-secondary/30 ${subscriptionStatus !== 'ACTIVE' ? 'relative' : ''}`}>
        <DashboardSidebar />
        <div className={`flex flex-1 flex-col ${subscriptionStatus !== 'ACTIVE' ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="text-sm font-medium text-foreground">
              Welcome, {userName}
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-6 md:p-8">
            <Outlet />
          </main>
        </div>
        
        {/* Paywall Modal Overlay */}
        {subscriptionStatus !== 'ACTIVE' && user && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <PaywallModal user={user} onSuccess={handlePaymentSuccess} />
          </div>
        )}
        
              </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
