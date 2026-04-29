import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";

type Venue = { id: string; name: string; location: string; maxGuests: number; pricePerDay: number; images: string[] };

export const VenueCard = ({ venue, index = 0 }: { venue: Venue; index?: number }) => {
  return (
    <Link
      to={`/venue/${venue.id}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="overflow-hidden rounded-2xl bg-card shadow-soft transition-smooth group-hover:shadow-elegant">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={venue.images?.[0] || "https://via.placeholder.com/400x300"}
            alt={venue.name}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl font-semibold leading-tight">{venue.name}</h3>
            <span className="shrink-0 text-sm font-medium text-primary">₦{venue.pricePerDay.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{venue.location}</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Up to {venue.maxGuests}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
