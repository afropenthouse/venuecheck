import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Subscription {
  status: string;
  startDate: string;
  endDate: string;
  duration: number;
  paymentMethod: string;
}

const SubscriptionManagement = ({ userId }: { userId: string }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await api.payments.getSubscription(userId);
      setSubscription(response.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'FREE':
        return <Badge className="bg-gray-100 text-gray-800">Free</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'EXPIRED':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'FREE':
        return <Clock className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleRenewSubscription = () => {
    // This would open the paywall modal for renewal
    toast.info('Renewal feature coming soon!');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No subscription found</p>
          <Button className="mt-4" onClick={handleRenewSubscription}>
            Subscribe Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(subscription.status)}
            Subscription Status
          </CardTitle>
          <CardDescription>
            Current subscription details and information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            {getStatusBadge(subscription.status)}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="text-sm font-medium">{subscription.duration} months</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm font-medium capitalize">{subscription.paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Started</span>
              <span className="text-sm font-medium">{formatDate(subscription.startDate)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expires</span>
              <span className="text-sm font-medium">{formatDate(subscription.endDate)}</span>
            </div>

            {subscription.status === 'ACTIVE' && subscription.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Days Remaining</span>
                <span className="text-sm font-medium text-green-600">
                  {getDaysRemaining(subscription.endDate)} days
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            {subscription.status !== 'ACTIVE' && (
              <Button className="flex-1" onClick={handleRenewSubscription}>
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe Now
              </Button>
            )}
            <Button variant="outline" onClick={fetchSubscription}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Benefits</CardTitle>
          <CardDescription>
            What's included with your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Unlimited venue listings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Advanced analytics dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Priority customer support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Custom venue branding</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
