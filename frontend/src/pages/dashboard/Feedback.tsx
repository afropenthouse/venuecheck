import { useEffect, useState } from "react";
import { Star, MessageSquare, RefreshCw, Calendar, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardEnhancedLoading } from "@/components/ui/EnhancedLoading";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

type Venue = {
  id: string;
  name: string;
  location: string;
  maxGuests: number;
  pricePerDay: number;
  description: string;
  images: string[];
  amenities: string[];
  unavailableDates: string[];
};

type FeedbackItem = {
  id: string;
  rating: number;
  comment?: string;
  guestName: string;
  guestEmail?: string;
  createdAt: string;
  venue: {
    name: string;
    location: string;
  };
};

const Feedback = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [venueFilter, setVenueFilter] = useState<string>("all");

  useEffect(() => {
    loadVenuesAndFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [feedbackData, venueFilter]);

  const loadVenuesAndFeedback = async () => {
    try {
      const venuesData = await api.venues.getAll();
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      
      const feedbackData = await api.feedback.getHostFeedback();
      setFeedbackData(feedbackData);
    } catch (err) {
      toast.error("Failed to load data");
      setVenues([]);
      setFeedbackData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFeedback = () => {
    if (venueFilter === "all") {
      setFilteredFeedback(feedbackData);
    } else {
      setFilteredFeedback(feedbackData.filter(f => f.venue.name === venueFilter));
    }
  };

  const refreshFeedback = async () => {
    toast.loading("Refreshing feedback...");
    await loadVenuesAndFeedback();
    toast.dismiss();
    toast.success("Feedback updated!");
  };

  if (loading) return <DashboardEnhancedLoading />;

  // Calculate statistics
  const totalFeedback = feedbackData.length;
  const averageRating = totalFeedback > 0 
    ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / totalFeedback 
    : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedbackData.filter(f => f.rating === rating).length,
    percentage: totalFeedback > 0 ? (feedbackData.filter(f => f.rating === rating).length / totalFeedback) * 100 : 0
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Feedback</h1>
          <p className="text-sm text-muted-foreground">View and manage guest feedback for all your venues</p>
        </div>
        <Button onClick={refreshFeedback} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFeedback}</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{venues.length}</p>
                <p className="text-xs text-muted-foreground">Venues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {feedbackData.filter(f => f.rating >= 4).length}
                </p>
                <p className="text-xs text-muted-foreground">Positive (4+ stars)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm">{rating}</span>
                </div>
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Venue:</label>
              <Select value={venueFilter} onValueChange={setVenueFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {venues.map(venue => (
                    <SelectItem key={venue.id} value={venue.name}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredFeedback.length} of {totalFeedback} reviews
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
            <p className="text-muted-foreground">
              {venueFilter === "all" 
                ? "No feedback yet. When guests leave reviews, they'll appear here."
                : `No feedback found for ${venueFilter}.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((feedback) => (
            <Card key={feedback.id} className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary flex-shrink-0">
                    {feedback.guestName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{feedback.guestName}</h3>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{feedback.venue.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star 
                          key={j} 
                          className={`h-4 w-4 ${
                            j < feedback.rating 
                              ? "fill-accent text-accent" 
                              : "text-muted-foreground"
                          }`} 
                        />
                      ))}
                    </div>

                    {feedback.comment && (
                      <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(feedback.createdAt), "MMM d, yyyy")}
                      </span>
                      {feedback.venue.location && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {feedback.venue.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
