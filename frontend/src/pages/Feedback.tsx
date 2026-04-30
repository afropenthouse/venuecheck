import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Star, Send, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { FullPageEnhancedLoading } from "@/components/ui/EnhancedLoading";
import { SiteHeader } from "@/components/SiteHeader";

type Venue = {
  id: string;
  name: string;
  location: string;
  maxGuests: number;
  pricePerDay: number;
  description: string;
  images: string[];
  amenities: string[];
};

const Feedback = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const [searchParams] = useSearchParams();
  const isFeedbackMode = searchParams.get('feedback') === '1';
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (venueId) {
      loadVenue();
    }
  }, [venueId]);

  const loadVenue = async () => {
    try {
      const data = await api.venues.getById(venueId!);
      setVenue(data);
    } catch (error) {
      console.error('Failed to load venue:', error);
      toast.error('Venue not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!venue) return;
    
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setSubmitting(true);
    
    try {
      await api.feedback.submit(venue.id, {
        rating,
        comment: comment.trim() || undefined,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || undefined
      });
      
      toast.success('Thank you for your feedback! Your review has been submitted.');
      
      // Reset form
      setRating(0);
      setGuestName('');
      setGuestEmail('');
      setComment('');
      
      // Redirect to venue page after 2 seconds
      setTimeout(() => {
        window.location.href = `/venue/${venueId}`;
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <FullPageEnhancedLoading />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Venue Not Found</h2>
          <p className="text-muted-foreground">This venue doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Always show feedback form - no intermediate step needed

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>Share Your Feedback</CardTitle>
            <CardDescription>
              Help us improve by sharing your experience at {venue.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <Label className="text-base font-medium mb-3 block">Rating *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transition-all duration-200 transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredStar || rating)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              {/* Guest Name */}
              <div>
                <Label htmlFor="guestName">Your Name *</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Guest Email */}
              <div>
                <Label htmlFor="guestEmail">Email (optional)</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="comment">Tell us more about your experience (optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like? What could be improved?"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;
