import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface PaywallModalProps {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  onSuccess?: () => void;
}

const PaywallModal = ({ user, onSuccess }: PaywallModalProps) => {
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const MONTHLY_PRICE = 30000; // 30k Naira
  const MIN_MONTHS = 6;
  const MAX_MONTHS = 12;

  const totalPrice = MONTHLY_PRICE * selectedMonths;

  useEffect(() => {
    fetchSubscription();
  }, [user.id]);

  // Also re-fetch when component mounts or when subscription changes
  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoadingSubscription(true);
      const data = await api.payments.getSubscription(user.id);
      console.log('PaywallModal subscription data:', data);
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await api.payments.initialize(
        selectedMonths,
        user.email,
        `${window.location.origin}/payment/verify`
      );

      if (response.success) {
        // Redirect to Paystack payment page
        window.location.href = response.authorization_url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  if (loadingSubscription) {
    return (
      <Dialog open={true}>
        <DialogContent className="max-w-2xl w-full">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If subscription is active, don't render anything
  if (subscription && subscription.status === 'ACTIVE') {
    console.log('PaywallModal: Subscription is ACTIVE, not rendering modal');
    return null;
  }
  
  console.log('PaywallModal: Rendering modal, subscription status:', subscription?.status);

  
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary text-center">Choose Your Subscription</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Unlock premium features and grow your venue business
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { months: 6, badge: "Popular" },
              { months: 9, badge: "Value" },
              { months: 12, badge: "Best Value" }
            ].map((option) => (
              <Card
                key={option.months}
                className={`cursor-pointer transition-all ${
                  selectedMonths === option.months
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedMonths(option.months)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{option.months} Months</span>
                    {option.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {option.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      <span>₦{(MONTHLY_PRICE * option.months).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₦{MONTHLY_PRICE.toLocaleString()}/month
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Selected Duration</span>
                <span className="text-sm">{selectedMonths} months</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Minimum subscription is 6 months. Your subscription will be active immediately after payment.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-12 text-base"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Secure payment processing</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Subscription Countdown Component
const SubscriptionCountdown = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const isExpiringSoon = timeLeft.days <= 7;

  return (
    <Alert className={isExpiringSoon ? "border-amber-200 bg-amber-50" : ""}>
      <AlertCircle className={`h-4 w-4 ${isExpiringSoon ? "text-amber-600" : ""}`} />
      <AlertDescription className={isExpiringSoon ? "text-amber-800" : ""}>
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {isExpiringSoon ? "Subscription expiring soon!" : "Time remaining"}
          </span>
          <div className="flex gap-2 text-sm">
            {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
            {timeLeft.hours > 0 && <span>{timeLeft.hours}h</span>}
            {timeLeft.minutes > 0 && <span>{timeLeft.minutes}m</span>}
            {timeLeft.seconds > 0 && <span>{timeLeft.seconds}s</span>}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PaywallModal;
