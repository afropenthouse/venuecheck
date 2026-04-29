import { useEffect, useState } from "react";
import { Building2, CalendarCheck, Inbox, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Stats = { venues: number; pending: number; approved: number };
type Recent = { name: string; venue: string; action: string; when: string }[];

const Overview = () => {
  const [stats, setStats] = useState<Stats>({ venues: 0, pending: 0, approved: 0 });
  const [recent, setRecent] = useState<Recent>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [venues, bookings] = await Promise.all([
        api.venues.getAll(),
        api.bookings.getAll()
      ]);
      
      const venuesArray = Array.isArray(venues) ? venues : [];
      const bookingsArray = Array.isArray(bookings) ? bookings : [];
      
      setStats({
        venues: venuesArray.length,
        pending: bookingsArray.filter((b: any) => b.status === "PENDING").length,
        approved: bookingsArray.filter((b: any) => b.status === "APPROVED").length
      });

      setRecent(
        bookingsArray.slice(0, 4).map((b: any) => ({
          name: b.guestName,
          venue: b.venue?.name || "Unknown",
          action: b.status === "APPROVED" ? "Approved" : b.status === "DECLINED" ? "Declined" : "Pending",
          when: new Date(b.createdAt).toLocaleDateString()
        }))
      );
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const statCards = [
    { label: "Total venues", value: stats.venues, icon: Building2, delta: "All venues" },
    { label: "Upcoming inspections", value: stats.approved, icon: CalendarCheck, delta: "Confirmed" },
    { label: "Pending requests", value: stats.pending, icon: Inbox, delta: "Awaiting" },
    { label: "Booking rate", value: stats.venues > 0 ? "100%" : "0%", icon: TrendingUp, delta: "Active" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-4xl font-semibold">Your venues at a glance</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent activity</h2>
            <span className="text-xs text-muted-foreground">Latest</span>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.action} · {r.venue}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.when}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
