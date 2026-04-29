import { useEffect, useState } from "react";
import { Check, X, Mail, Phone, Users, Calendar, Clock, MapPin, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

type Booking = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guests: number;
  bookingDate: string;
  inspectionDate: string | null;
  status: string;
  venue: { name: string; location: string };
  createdAt: string;
};

const Inspections = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const loadBookings = async () => {
    try {
      const data = await api.bookings.getAll();
      setBookings(data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  };

  const refreshBookings = async () => {
    toast.loading("Refreshing bookings...");
    await loadBookings();
    toast.dismiss();
    toast.success("Bookings updated!");
  };

  const handleApprove = async (id: string) => {
    try {
      await api.bookings.approve(id);
      toast.success("Approved — guest notified");
      loadBookings();
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.bookings.decline(id);
      toast.success("Request declined");
      loadBookings();
    } catch (err) {
      toast.error("Failed to decline");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "APPROVED": return "bg-green-100 text-green-800";
      case "DECLINED": return "bg-red-100 text-red-800";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Inspection Requests</h1>
          <p className="text-sm text-muted-foreground">Manage all venue inspection booking requests</p>
        </div>
        <Button onClick={refreshBookings} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.length}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === "PENDING").length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === "APPROVED").length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === "DECLINED").length}</p>
                <p className="text-xs text-muted-foreground">Declined</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {bookings.length} requests
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No inspection requests found</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all" 
                ? "No booking requests yet. When guests request inspections, they'll appear here."
                : `No ${statusFilter.toLowerCase()} requests found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-medium text-primary flex-shrink-0">
                        {booking.guestName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">{booking.guestName}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{booking.venue.name}</p>
                        
                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{booking.guestEmail}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{booking.guestPhone}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 flex-shrink-0" />
                            {booking.guests} guests
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{booking.venue.location}</span>
                          </span>
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 mt-2">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                            Booking: {booking.bookingDate ? format(new Date(booking.bookingDate), "MMM d, yyyy h:mm a") : "TBD"}
                          </span>
                          {booking.inspectionDate && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                              Inspection: {format(new Date(booking.inspectionDate), "MMM d, yyyy h:mm a")}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          Requested {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {booking.status === "PENDING" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleDecline(booking.id)}>
                        <X className="h-4 w-4" /> Decline
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary-glow" onClick={() => handleApprove(booking.id)}>
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inspections;
