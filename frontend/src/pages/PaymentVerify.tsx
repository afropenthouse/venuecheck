import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'retry'>('loading');
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState<any>(null);

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      verifyPayment();
    } else {
      setStatus('error');
      setMessage('No payment reference found');
    }
  }, [reference]);

  const verifyPayment = async () => {
    try {
      setStatus('loading');
      setMessage('Verifying your payment...');

      const response = await api.payments.verify(reference!);
      
      if (response.success) {
        setStatus('success');
        setMessage('Payment successful! Your subscription has been activated.');
        setSubscription(response.subscription);
        
        // Update user data in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...user,
          subscriptionStatus: 'ACTIVE'
        }));
        
        toast.success('Subscription activated successfully!');
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      setStatus('retry');
      setMessage(error.message || 'Payment verification failed');
    }
  };

  const handleRetry = () => {
    if (reference) {
      verifyPayment();
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Verifying Payment</h3>
              <p className="text-muted-foreground mt-1">{message}</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
              <p className="text-muted-foreground mt-1">{message}</p>
            </div>
            
            {subscription && (
              <div className="bg-green-50 p-4 rounded-lg text-left">
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium capitalize">{subscription.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{subscription.duration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>₦{subscription.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleGoToDashboard} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        );

      case 'error':
      case 'retry':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">
                {status === 'retry' ? 'Payment Verification Failed' : 'Payment Error'}
              </h3>
              <p className="text-muted-foreground mt-1">{message}</p>
            </div>

            <Alert>
              <AlertDescription>
                If you completed the payment but it's not showing, please wait a few minutes and try again.
                If the issue persists, contact support with your payment reference: {reference}
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              {status === 'retry' && (
                <Button onClick={handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Verification
                </Button>
              )}
              <Button variant="outline" onClick={handleGoHome}>
                Go to Homepage
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Payment Verification</CardTitle>
        </CardHeader>
        
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentVerify;
