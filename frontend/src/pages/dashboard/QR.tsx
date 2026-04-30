import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { DashboardEnhancedLoading } from "@/components/ui/EnhancedLoading";

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


const QR: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    if (venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);


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


  const selectedVenue = venues.find(v => v.id === selectedVenueId);
  const qrUrl = selectedVenue ? `${window.location.origin}/feedback/${selectedVenue.id}` : '';

  const downloadQRCode = () => {
    const svg = document.getElementById("venue-qr-code");
    if (!svg) {
      toast.error("QR code not found");
      return;
    }

    try {
      // Get SVG data with proper namespace
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create image from SVG
      const img = new Image();
      img.onload = () => {
        // Create canvas with proper dimensions
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        
        if (ctx) {
          // Fill white background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, size, size);
          
          // Draw the QR code centered and scaled
          const qrSize = 300; // Original QR size from component
          const scale = size / qrSize;
          const offset = (size - qrSize * scale) / 2;
          ctx.drawImage(img, offset, offset, qrSize * scale, qrSize * scale);
          
          // Convert to PNG and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const downloadLink = document.createElement("a");
              const fileName = `feedback-qr-${selectedVenue?.name?.replace(/[^a-z0-9]/gi, '_') || 'venue'}.png`;
              downloadLink.download = fileName;
              downloadLink.href = url;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(url);
              toast.success("QR code downloaded successfully!");
            } else {
              toast.error("Failed to generate QR code image");
            }
            URL.revokeObjectURL(svgUrl);
          }, "image/png", 1.0);
        }
      };
      
      img.onerror = () => {
        toast.error("Failed to load QR code for download");
        URL.revokeObjectURL(svgUrl);
      };
      
      img.src = svgUrl;
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download QR code");
    }
  };

  const copyLink = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      toast.success("Feedback link copied to clipboard!");
    }
  };

  if (loading) return <DashboardEnhancedLoading />;

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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">QR Code for Feedback & Complaints</h2>
          <p className="text-gray-600">Place this QR code at your venue to collect guest feedback & reviews</p>
        </div>
        <div className="w-full lg:w-80 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Select venue</span>
          <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
            <SelectTrigger className="flex-1">
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
          <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center space-y-6">
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100">
              <QRCodeSVG
                id="venue-qr-code"
                value={qrUrl}
                size={Math.min(300, window.innerWidth < 640 ? 200 : window.innerWidth < 1024 ? 250 : 300)}
                level={"H"}
                includeMargin={true}
              />
            </div>
            
            <div className="text-center space-y-2 w-full max-w-md">
              <h3 className="text-lg sm:text-xl font-semibold">{selectedVenue.name}</h3>
              <p className="text-gray-500 text-xs sm:text-sm break-all px-2">{qrUrl}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-md">
              <Button onClick={downloadQRCode} className="bg-primary hover:bg-primary-glow flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
              <Button variant="outline" onClick={copyLink} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="ghost" onClick={() => window.open(qrUrl, '_blank')} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QR;
