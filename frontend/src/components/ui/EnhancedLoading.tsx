import { useState, useEffect } from "react";

export const EnhancedLoadingSpinner = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen p-8" : "min-h-[400px] p-8"}`}>
      <div className="flex flex-col items-center gap-4">
        {/* Main spinner with gradient */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute top-1 left-1 w-10 h-10 rounded-full border-2 border-transparent border-t-primary/30 animate-spin" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full border border-transparent border-t-primary/20 animate-spin" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Loading text with animated dots */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Loading</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full bg-primary transition-all duration-300 ${
                  i <= dots ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FullPageEnhancedLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="flex flex-col items-center gap-6">
        {/* Multi-layer spinner without square box */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-14 h-14 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute top-1 left-1 w-12 h-12 rounded-full border-2 border-transparent border-t-primary/40 animate-spin" style={{ animationDelay: '0.15s' }}></div>
          <div className="absolute top-2 left-2 w-10 h-10 rounded-full border border-transparent border-t-primary/30 animate-spin" style={{ animationDelay: '0.3s' }}></div>
        </div>
        
        {/* Loading message */}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground animate-fade-in">Preparing your experience</p>
          <p className="text-xs text-muted-foreground mt-1">This will only take a moment</p>
        </div>
      </div>
    </div>
  );
};

// Dashboard loading that preserves sidebar
export const DashboardEnhancedLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="flex flex-col items-center gap-4">
        {/* Multi-layer spinner */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-3 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute top-1 left-1 w-10 h-10 rounded-full border-2 border-transparent border-t-primary/40 animate-spin" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full border border-transparent border-t-primary/30 animate-spin" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-sm text-muted-foreground">Loading content</p>
      </div>
    </div>
  );
};

export const InlineEnhancedLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="flex flex-col items-center gap-4">
        {/* Compact spinner */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-3 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-10 h-10 rounded-full border-3 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute top-1 left-1 w-8 h-8 rounded-full border-2 border-transparent border-t-primary/30 animate-spin" style={{ animationDelay: '0.1s' }}></div>
        </div>
        
        <p className="text-sm text-muted-foreground">Loading content</p>
      </div>
    </div>
  );
};

// Skeleton loading components
export const CardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
    </div>
  </div>
);

export const ListSkeleton = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-xl">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 p-4 border border-border rounded-lg">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
    ))}
  </div>
);
