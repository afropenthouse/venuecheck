import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'verify'>('auth');
  const [form, setForm] = useState({ email: "", password: "", name: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        if (form.password !== form.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await api.auth.register(form.email, form.password, form.name);
        setRegisteredEmail(form.email);
        toast.success("Account created! Check your email for verification code.");
        setStep('verify');
      } else {
        const { token, user } = await api.auth.login(form.email, form.password);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.verifyEmail(registeredEmail, verificationCode);
      toast.success("Email verified! You can now sign in.");
      setStep('auth');
      setIsRegister(false);
      setForm({ email: registeredEmail, password: "", name: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      await api.auth.resendVerification(registeredEmail);
      toast.success("Verification code resent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-hero lg:block">
        <div className="flex h-full min-h-screen flex-col justify-between p-10 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent" />
            <span className="font-display text-xl font-semibold">Venue Check</span>
          </Link>
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="font-display text-4xl leading-tight text-balance font-semibold">
                Manage Your Venues with Ease
              </h2>
              <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-lg">
                List your spaces, set availability, and connect with guests looking for the perfect venue. Start hosting in minutes.
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
          {step === 'auth' ? (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-hero shadow-glow"></div>
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">{isRegister ? "Create account" : "Welcome back"}</h1>
                <p className="text-sm text-muted-foreground">{isRegister ? "Start hosting your venues and connecting with guests." : "Sign in to manage your venues and bookings."}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {isRegister && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Name</Label>
                      <Input placeholder="Your full name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="h-11" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input type="email" placeholder="you@venue.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                        value={form.password} 
                        onChange={(e) => setForm({...form, password: e.target.value})} 
                        className="h-11 pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {isRegister && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirm your password" 
                          value={form.confirmPassword} 
                          onChange={(e) => setForm({...form, confirmPassword: e.target.value})} 
                          className="h-11 pr-10" 
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
                  )}
                </div>
                
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-glow text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-all duration-300" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    isRegister ? "Create account" : "Sign in"
                  )}
                </Button>
              </form>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isRegister ? "Already have an account?" : "New to Venue Check?"}{" "}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setStep('auth');
                      setForm({ email: "", password: "", name: "", confirmPassword: "" });
                      setVerificationCode("");
                    }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {isRegister ? "Sign in" : "Create an account"}
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-20 to-emerald-10 mb-4">
                  <Mail className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">Verify your email</h1>
                <p className="text-sm text-muted-foreground">
                  We've sent a verification code to<br />
                  <span className="font-medium text-foreground">{registeredEmail}</span>
                </p>
              </div>
              
              <form onSubmit={handleVerification} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Verification Code</Label>
                    <Input 
                      type="text" 
                      placeholder="Enter 6-digit code" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="h-11 text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Check your inbox and enter the code above
                  </p>
                </div>
                
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-glow text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-all duration-300" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
                
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <button 
                    type="button"
                    onClick={resendCode}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    Resend code
                  </button>
                </div>
              </form>
              
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => {
                    setStep('auth');
                    setForm({ email: "", password: "", name: "", confirmPassword: "" });
                    setVerificationCode("");
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  ← Back to sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
