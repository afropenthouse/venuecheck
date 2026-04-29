import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";

type User = { name: string; email: string; brand: string };
type Settings = { notificationNewBooking: boolean; notificationInspection: boolean; notificationFeedback: boolean; notificationWeekly: boolean };

const Settings = () => {
  const [user, setUser] = useState<User>({ name: "", email: "", brand: "" });
  const [settings, setSettings] = useState<Settings>({ notificationNewBooking: true, notificationInspection: true, notificationFeedback: true, notificationWeekly: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      if (data.user) setUser(data.user);
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.settings.update({ name: user.name, brand: user.brand });
      toast.success("Profile saved!");
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await api.settings.updateNotifications(settings);
      toast.success("Notifications saved!");
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Account preferences and notifications.</p>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Name</Label><Input value={user.name || ""} onChange={(e) => setUser({...user, name: e.target.value})} /></div>
          <div><Label>Email</Label><Input value={user.email || ""} disabled /></div>
          <div className="sm:col-span-2"><Label>Brand</Label><Input value={user.brand || ""} onChange={(e) => setUser({...user, brand: e.target.value})} /></div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary-glow">Save changes</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Notifications</h2>
        <ul className="mt-3 divide-y divide-border text-sm">
          {[
            { key: "notificationNewBooking", label: "New booking" },
            { key: "notificationInspection", label: "New inspection request" },
            { key: "notificationFeedback", label: "Feedback received" },
            { key: "notificationWeekly", label: "Weekly summary" }
          ].map((n) => (
            <li key={n.key} className="flex items-center justify-between py-3">
              <span>{n.label}</span>
              <input 
                type="checkbox" 
                checked={settings[n.key as keyof Settings]} 
                onChange={(e) => setSettings({...settings, [n.key]: e.target.checked})}
                className="h-4 w-4 accent-[hsl(var(--primary))]" 
              />
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSaveNotifications} className="bg-primary hover:bg-primary-glow">Save notifications</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
