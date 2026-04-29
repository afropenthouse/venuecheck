import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", brand: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await api.auth.register(form.email, form.password, form.name, form.brand);
        toast.success("Account created! Please sign in.");
        setIsRegister(false);
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

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-hero lg:block">
        <div className="flex h-full flex-col justify-between p-10 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent" />
            <span className="font-display text-xl font-semibold">Venue Flow</span>
          </Link>
          <div>
            <p className="font-display text-4xl leading-tight text-balance">
              "We doubled our inspections in a month. Guests love the calendar."
            </p>
            <p className="mt-3 text-sm text-primary-foreground/70">— Mira, Heritage Barn</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-semibold">{isRegister ? "Create account" : "Welcome back"}</h1>
            <p className="text-sm text-muted-foreground">{isRegister ? "Start hosting your venues." : "Sign in to your host dashboard."}</p>
          </div>
          <Button type="button" variant="outline" className="w-full">Continue with Google</Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {isRegister && (
              <>
                <div><Label>Name</Label><Input placeholder="Your name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
                <div><Label>Brand</Label><Input placeholder="Brand name" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} /></div>
              </>
            )}
            <div><Label>Email</Label><Input type="email" placeholder="you@venue.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
            <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} /></div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary-glow" disabled={loading}>
            {loading ? "Loading..." : isRegister ? "Create account" : "Sign in"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <span className="text-primary cursor-pointer" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Sign in" : "Create an account"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
