const venue1 = "/venue-1.jpg";
const venue2 = "/venue-2.jpg";
const venue3 = "/venue-3.jpg";

export type Venue = {
  id: string;
  slug: string;
  name: string;
  location: string;
  maxGuests: number;
  pricePerDay: number;
  description: string;
  images: string[];
  amenities: string[];
  unavailableDates: string[]; // ISO yyyy-MM-dd
};

const today = new Date();
const iso = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const venues: Venue[] = [
  {
    id: "v1",
    slug: "skyline-rooftop",
    name: "Skyline Rooftop",
    location: "Brooklyn, New York",
    maxGuests: 80,
    pricePerDay: 2400,
    description:
      "A breezy rooftop terrace with panoramic skyline views, string lights, and curated lounge seating. Perfect for golden-hour cocktails and intimate receptions.",
    images: [venue1, venue3, venue2],
    amenities: ["Open bar", "Sound system", "City view", "Heaters"],
    unavailableDates: [iso(2), iso(3), iso(8), iso(15), iso(16)],
  },
  {
    id: "v2",
    slug: "heritage-barn",
    name: "Heritage Barn",
    location: "Hudson Valley, NY",
    maxGuests: 160,
    pricePerDay: 3800,
    description:
      "Hand-hewn wooden beams, Edison bulbs, and 8,000 sqft of rustic-modern beauty. A storybook setting for weddings and celebrations.",
    images: [venue2, venue1, venue3],
    amenities: ["Bridal suite", "Catering kitchen", "Parking", "Gardens"],
    unavailableDates: [iso(5), iso(6), iso(7), iso(20)],
  },
  {
    id: "v3",
    slug: "north-loft",
    name: "North Light Loft",
    location: "SoHo, New York",
    maxGuests: 50,
    pricePerDay: 1800,
    description:
      "A bright, minimalist gallery loft flooded with natural light. Ideal for product launches, pop-ups, and editorial dinners.",
    images: [venue3, venue1, venue2],
    amenities: ["Skylights", "WiFi", "Lounge", "AV setup"],
    unavailableDates: [iso(1), iso(11), iso(12), iso(25)],
  },
];

export const getVenueBySlug = (slug: string) => venues.find((v) => v.slug === slug);
