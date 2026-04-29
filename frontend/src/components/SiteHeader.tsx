import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-hero shadow-glow" />
          <span className="font-display text-xl font-semibold tracking-tight">Venue Flow</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Discover</Link>
          <a href="#how" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
          <Link to="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">For hosts</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-glow">
              Host a venue
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
