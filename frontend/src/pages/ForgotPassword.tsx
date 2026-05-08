import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSubmitted(true);
      toast.success("If an account exists, you'll receive a password reset link.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

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
                Reset Your Password
              </h2>
              <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-lg">
                Don't worry, it happens to the best of us. We'll send you a link to reset your password and get you back to managing your venues.
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
          {!submitted ? (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-20 to-blue-10 mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">Enter your email address and we'll send you a link to reset your password.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input 
                      type="email" 
                      placeholder="you@venue.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="h-11" 
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-glow text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-all duration-300" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
              
              <div className="text-center">
                <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-20 to-emerald-10 mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">Check your email</h1>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to<br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  The link will expire in 10 minutes for security purposes.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSubmitted(false)}
                  className="w-full h-11"
                >
                  Try Again
                </Button>
                <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
