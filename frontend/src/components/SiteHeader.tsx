import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-hero shadow-glow" />
          <span className="font-display text-xl font-semibold tracking-tight">Venue Check</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-glow">
              Host a venue
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
