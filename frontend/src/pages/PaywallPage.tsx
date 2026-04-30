import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PaywallModal from "@/components/PaywallModal";
import { Loader2 } from "lucide-react";

const PaywallPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/auth');
    }
    setLoading(false);
  }, [navigate]);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <PaywallModal user={user} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default PaywallPage;
