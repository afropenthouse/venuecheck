import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, QrCode, Share2, Search, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VenueCard } from "@/components/VenueCard";
import { api } from "@/lib/api";
const heroImage = "/venue-hero.jpg";

type Venue = { id: string; name: string; location: string; maxGuests: number; pricePerDay: number; description: string; images: string[]; amenities: string[]; unavailableDates: string[] };

const Index = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await api.venues.getPublic();
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load venues");
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid gap-12 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Bookings, inspections, all in one flow
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.05] text-balance sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Find a venue <em className="italic text-primary-glow">worth</em> remembering.
            </h1>
            <p className="mt-5 max-w-lg text-base sm:text-lg text-muted-foreground text-balance">
              Venue Check lets hosts manage availability and lets guests check open dates and book inspections — beautifully, in seconds.
            </p>

            <div className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft">
              <Search className="ml-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by city or venue name…"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button size="sm" className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary-glow">
                Search
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
              <div><span className="font-display text-2xl font-semibold text-foreground">2.4k+</span><div>Venues hosted</div></div>
              <div className="h-8 w-px bg-border" />
              <div><span className="font-display text-2xl font-semibold text-foreground">98%</span><div>On-time inspections</div></div>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-accent opacity-20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-elegant">
              <img
                src={heroImage}
                alt="Sunlit elegant event venue with arched windows"
                width={1600}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-elegant md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Inspection confirmed</p>
                  <p className="text-xs text-muted-foreground">Sat, 3:00 PM · Skyline Rooftop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* How it works */}
      <section id="how" className="bg-secondary/40 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">How it works</p>
            <h2 className="mt-2 font-display text-4xl font-semibold md:text-5xl text-balance">
              From shareable link to confirmed inspection.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Share2, title: "Share a link", body: "Hosts publish a venue and share a beautiful public page with one tap." },
              { icon: CalendarCheck, title: "Check availability", body: "Guests pick from open dates in a fluid calendar — never double-booked." },
              { icon: QrCode, title: "Inspect & feedback", body: "Schedule on-site inspections and collect post-event ratings via QR." },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-7 shadow-soft transition-smooth hover:shadow-elegant">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-glow">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 md:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-4xl font-semibold text-primary-foreground md:text-5xl text-balance">
                Ready to host your space?
              </h2>
              <p className="mt-3 text-primary-foreground/80">Set up your first venue in minutes. No credit card required.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/auth">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {venues[0] && (
                <Link to={`/venue/${venues[0].id}`}>
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    See a sample venue
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
