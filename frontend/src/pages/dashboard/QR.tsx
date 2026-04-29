import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Copy, ExternalLink, RefreshCw, Star } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Venue {
  id: string;
  name: string;
  location: string;
  maxGuests: number;
  pricePerDay: number;
  description: string;
  images: string[];
  amenities: string[];
  unavailableDates: string[];
}

interface FeedbackItem {
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
}

const QR: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    if (venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  useEffect(() => {
    if (selectedVenueId) {
      loadFeedback();
    }
  }, [selectedVenueId]);

  const loadVenues = async () => {
    try {
      const data = await api.venues.getAll();
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load venues");
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async () => {
    if (!selectedVenueId) return;
    
    try {
      const data = await api.feedback.getHostFeedback();
      const venueFeedback = data.filter((f: any) => f.venueId === selectedVenueId);
      setFeedbackData(venueFeedback);
    } catch (err) {
      console.error("Failed to load feedback");
      setFeedbackData([]);
    }
  };

  const refreshFeedback = async () => {
    toast.loading("Refreshing feedback...");
    await loadFeedback();
    toast.dismiss();
    toast.success("Feedback updated!");
  };

  const selectedVenue = venues.find(v => v.id === selectedVenueId);
  const qrUrl = selectedVenue ? `${window.location.origin}/feedback/${selectedVenue.id}` : '';

  const downloadQRCode = () => {
    const svg = document.getElementById("venue-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `feedback-qr-${selectedVenue?.name || 'venue'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR code downloaded!");
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyLink = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      toast.success("Feedback link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No venues found. Create a venue to generate a QR code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QR Code for Feedback & Complaints</h2>
          <p className="text-gray-600">Place this QR code at your venue to collect guest feedback & reviews</p>
        </div>
        <div className="w-full md:w-64 flex flex-row items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Select venue</span>
          <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
            <SelectTrigger>
              <SelectValue placeholder="Select venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map(venue => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedVenue && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <QRCodeSVG
                id="venue-qr-code"
                value={qrUrl}
                size={300}
                level={"H"}
                includeMargin={true}
              />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">{selectedVenue.name}</h3>
              <p className="text-gray-500 text-sm break-all">{qrUrl}</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={downloadQRCode} className="bg-primary hover:bg-primary-glow">
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
              <Button variant="outline" onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="ghost" onClick={() => window.open(qrUrl, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Feedback Section */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Recent Feedback {selectedVenue && `- ${selectedVenue.name}`}
            </h3>
            <Button onClick={refreshFeedback} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
          
          {feedbackData.length === 0 ? (
            <div className="text-center py-8">
              <Star className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No feedback yet. Share the QR code to start collecting reviews!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {feedbackData.map((feedback) => (
                <div key={feedback.id} className="p-4 rounded-xl bg-secondary/30">
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
                    <p className="text-sm mb-2">{feedback.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {feedback.guestName} · {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QR;
