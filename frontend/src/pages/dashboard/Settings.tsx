import { useState, useEffect } from "react";
import { Save, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardEnhancedLoading } from "@/components/ui/EnhancedLoading";
import AdminManualActivation from "@/components/AdminManualActivation";
import { api } from "@/lib/api";
import { toast } from "sonner";

type User = { name: string; email: string };

const Settings = () => {
  const [user, setUser] = useState<User>({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadSettings();
    checkAdminStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      if (data.user) setUser(data.user);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = () => {
    // Simple admin check - you can enhance this with proper role-based access
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Check if email matches admin pattern or has admin flag
      setIsAdmin(parsedUser.email?.includes('admin') || parsedUser.role === 'admin');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.settings.update({ name: user.name });
      toast.success("Profile saved!");
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  if (loading) return <DashboardEnhancedLoading />;

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and platform settings.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-400">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  value={user.name || ""} 
                  onChange={(e) => setUser({...user, name: e.target.value})} 
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  value={user.email || ""} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary-glow">
                <Save className="w-4 h-4 mr-2" />
                Save changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <AdminManualActivation />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
