import React, { useState, useEffect } from "react";
import { Building2, CalendarCheck, Inbox, TrendingUp, Activity, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DashboardEnhancedLoading } from "@/components/ui/EnhancedLoading";

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

  if (loading) return <DashboardEnhancedLoading />;

  const statCards = [
    { 
      label: "Total venues", 
      value: stats.venues, 
      icon: Building2, 
      delta: "All venues", 
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      trend: "stable"
    },
    { 
      label: "Upcoming inspections", 
      value: stats.approved, 
      icon: CalendarCheck, 
      delta: "Confirmed", 
      color: "bg-blue-50 text-blue-600 border-blue-100",
      trend: "up"
    },
    { 
      label: "Pending requests", 
      value: stats.pending, 
      icon: Inbox, 
      delta: "Awaiting", 
      color: "bg-amber-50 text-amber-600 border-amber-100",
      trend: "pending"
    },
    { 
      label: "Booking rate", 
      value: stats.venues > 0 ? "100%" : "0%", 
      icon: TrendingUp, 
      delta: "Active", 
      color: "bg-purple-50 text-purple-600 border-purple-100",
      trend: "up"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-warm rounded-3xl p-8 shadow-elegant">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
        </div>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground">
          Your venues at a glance
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
          Monitor your venue performance, track booking requests, and stay on top of your property management.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, index) => (
          <div 
            key={s.label} 
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 hover:border-primary/20"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
                <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{s.delta}</span>
                  {s.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  {s.trend === "pending" && <Clock className="h-3 w-3 text-amber-500" />}
                  {s.trend === "stable" && <CheckCircle className="h-3 w-3 text-blue-500" />}
                </div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${s.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-display text-xl font-semibold">Recent activity</h2>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Latest</span>
          </div>
          {recent.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">Booking activity will appear here</p>
            </div>
          ) : (
            <div className="mt-6 space-y-1">
              {recent.map((r, i) => {
                const statusColor = r.action === "Approved" ? "text-emerald-600 bg-emerald-50" : 
                                  r.action === "Declined" ? "text-red-600 bg-red-50" : 
                                  "text-amber-600 bg-amber-50";
                const statusIcon = r.action === "Approved" ? CheckCircle : 
                                 r.action === "Declined" ? AlertCircle : 
                                 Clock;
                
                return (
                  <div 
                    key={i} 
                    className="group flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:bg-muted/50"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${statusColor}`}>
                        {React.createElement(statusIcon, { className: "h-4 w-4" })}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {r.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.action} · {r.venue}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">{r.when}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="rounded-2xl border border-border bg-gradient-warm p-6 shadow-elegant">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold">Quick insights</h2>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
              <span className="text-sm text-muted-foreground">Active venues</span>
              <span className="font-semibold">{stats.venues}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
              <span className="text-sm text-muted-foreground">Pending review</span>
              <span className="font-semibold text-amber-600">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
              <span className="text-sm text-muted-foreground">Confirmed</span>
              <span className="font-semibold text-emerald-600">{stats.approved}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
