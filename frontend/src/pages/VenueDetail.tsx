import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, MapPin, Users, Share2, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "browse" | "booking" | "inspection" | "done";
type Venue = { id: string; name: string; location: string; maxGuests: number; pricePerDay: number; description: string; images: string[]; amenities: string[]; unavailableDates: string[] };

const VenueDetail = () => {
  const { id = "" } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>();
  const [openDialog, setOpenDialog] = useState(false);
  const [step, setStep] = useState<Step>("browse");
  const [form, setForm] = useState({ email: "", phone: "", guests: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [inspectionDate, setInspectionDate] = useState<Date | undefined>();

  useEffect(() => {
    loadVenue();
  }, [id]);

  const loadVenue = async () => {
    try {
      const data = await api.venues.getById(id);
      console.log("Loaded venue:", data);
      setVenue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unavailable = useMemo(() => (venue && venue.unavailableDates ? venue.unavailableDates.map((d) => new Date(d)) : []), [venue]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-32 text-center">Loading...</div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-32 text-center">
          <h1 className="font-display text-4xl">Venue not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary underline">Back home</Link>
        </div>
      </div>
    );
  }

  const isBlocked = (d: Date) =>
    unavailable.some((u) => u.toDateString() === d.toDateString()) || d < new Date(new Date().setHours(0, 0, 0, 0));

  const handleCheck = () => {
    if (!date) {
      toast.error("Please choose a date first.");
      return;
    }
    setStep("booking");
    setOpenDialog(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      setStep("inspection");
      setSubmitting(false);
    } catch (err: any) {
      console.error("Booking error:", err);
      setSubmitting(false);
      toast.error(err.message || "Failed to submit booking");
    }
  };

  const handleConfirmInspectionFinal = async () => {
    setSubmitting(true);
    const guests = Number(form.guests);
    const timeInput = (document.getElementById("inspectionTime") as HTMLInputElement)?.value || "10:00";
    
    let combinedInspectionDate = null;
    if (inspectionDate) {
      const [hours, minutes] = timeInput.split(":").map(Number);
      const combined = new Date(inspectionDate);
      combined.setHours(hours, minutes, 0, 0);
      combinedInspectionDate = combined.toISOString();
    }
    
    try {
      console.log("Creating booking with inspection:", { venueId: venue.id, guestEmail: form.email, guestPhone: form.phone, guestName: form.name, guests, bookingDate: date?.toISOString(), inspectionDate: combinedInspectionDate });
      const result = await api.bookings.create({
        venueId: venue.id,
        guestEmail: form.email,
        guestPhone: form.phone,
        guestName: form.name,
        guests,
        bookingDate: date?.toISOString(),
        inspectionDate: combinedInspectionDate
      });
      console.log("Booking result:", result);
      setSubmitting(false);
      setStep("done");
    } catch (err: any) {
      console.error("Booking error:", err);
      setSubmitting(false);
      toast.error(err.message || "Failed to submit booking");
    }
  };

  const handleConfirmInspection = () => {
    if (!inspectionDate) return toast.error("Pick an inspection date.");
    setStep("done");
    toast.success("Confirmation sent to your email.");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {step === "browse" && (
        <div className="container py-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      )}

      {/* Side-by-side hero + booking */}
      <section className="container pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          {/* Left: image + meta */}
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-2xl bg-muted shadow-elegant">
              <img
                src={venue.images?.[0] || "https://via.placeholder.com/800x600"}
                alt={venue.name}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl md:text-4xl text-balance">{venue.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{venue.location}</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />Up to {venue.maxGuests}</span>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-xl font-semibold sm:text-2xl">₦{venue.pricePerDay.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/day</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 text-muted-foreground hover:text-foreground w-full sm:w-auto">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </div>

          {/* Right: booking panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Check availability</h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Instant check</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Pick a date — we'll confirm in seconds.</p>

            <div className="mt-5 rounded-xl border border-border p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={isBlocked}
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40" /> Greyed dates are unavailable
            </div>

            <Button onClick={handleCheck} size="lg" className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary-glow">
              Check availability
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Booking dialog */}
      <Dialog open={openDialog} onOpenChange={(o) => { setOpenDialog(o); if (!o) { setStep("browse"); setInspectionDate(undefined); } }}>
        <DialogContent className="max-w-md">
          {step === "booking" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Date is available</DialogTitle>
                <DialogDescription>
                  {date && format(date, "EEEE, MMMM d, yyyy")} · {venue.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="guests">Guests (max {venue.maxGuests})</Label>
                  <Input id="guests" type="number" min={1} max={venue.maxGuests} required value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
                </div>
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary-glow" disabled={submitting}>
                    {submitting ? "Submitting..." : "Yes, proceed"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {step === "inspection" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Schedule Inspection</DialogTitle>
                <DialogDescription>
                  Now pick a date and time for your on-site inspection.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-2">
                  <Calendar
                    mode="single"
                    selected={inspectionDate}
                    onSelect={setInspectionDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3"
                  />
                </div>
                <div>
                  <Label>Inspection Time</Label>
                  <Input type="time" className="mt-1" defaultValue="10:00" id="inspectionTime" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleConfirmInspectionFinal()}>Skip</Button>
                  <Button onClick={() => handleConfirmInspectionFinal()} disabled={!inspectionDate} className="bg-primary hover:bg-primary-glow">
                    Confirm Inspection
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}

          {step === "done" && (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold">Inspection Scheduled!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {inspectionDate && <span>{format(inspectionDate, "EEEE, MMMM d, yyyy")}</span>}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                We've sent a confirmation to {form.email}.
              </p>
              <Button onClick={() => setOpenDialog(false)} className="mt-6 w-full bg-primary hover:bg-primary-glow">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenueDetail;
