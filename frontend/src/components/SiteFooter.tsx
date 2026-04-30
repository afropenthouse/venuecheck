export const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-hero" />
            <span className="font-display text-lg font-semibold">Venuecheck</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            The graceful way to host, share, and book inspection-ready venues.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-10 text-sm">
          <div>
            <p className="mb-3 font-medium">Product</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>For hosts</li>
              <li>For guests</li>
              <li>QR feedback</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-medium">Company</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-medium">Legal</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <p className="container text-xs text-muted-foreground">© {new Date().getFullYear()} Venuecheck. Crafted with care.</p>
      </div>
    </footer>
  );
};
