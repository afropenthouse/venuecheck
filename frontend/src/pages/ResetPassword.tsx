import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // We don't validate the token on the frontend, we'll let the backend handle it
      setTokenValid(true);
    } else {
      setTokenValid(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
      if (err.message?.includes('Invalid or expired')) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden bg-gradient-hero lg:block">
          <div className="flex h-full min-h-screen flex-col justify-between p-10 text-primary-foreground">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="w-full max-w-sm space-y-8 animate-fade-in text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-20 to-red-10 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Invalid Reset Link</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link to="/forgot-password">
                <Button className="w-full h-11 bg-primary hover:bg-primary-glow text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-all duration-300">
                  Request New Reset Link
                </Button>
              </Link>
              <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden bg-gradient-hero lg:block">
          <div className="flex h-full min-h-screen flex-col justify-between p-10 text-primary-foreground">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="w-full max-w-sm space-y-8 animate-fade-in text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-20 to-emerald-10 mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Password Reset!</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link to="/auth">
                <Button className="w-full h-11 bg-primary hover:bg-primary-glow text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-all duration-300">
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-hero lg:block">
        <div className="flex h-full min-h-screen flex-col justify-between p-10 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
          </Link>
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="font-display text-4xl leading-tight text-balance font-semibold">
                Create New Password
              </h2>
              <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-lg">
                Choose a strong password for your account. Make sure it's something you'll remember but hard for others to guess.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-primary-foreground">500+</div>
                <div className="text-xs text-primary-foreground/70 mt-1">Active Venues</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-primary-foreground">2.4k</div>
                <div className="text-xs text-primary-foreground/70 mt-1">Bookings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-primary-foreground">98%</div>
                <div className="text-xs text-primary-foreground/70 mt-1">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-20 to-blue-10 mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground">Create your new password below.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter new password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-11 pr-10" 
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters long</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm new password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="h-11 pr-10" 
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-glow text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-all duration-300" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Resetting...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
