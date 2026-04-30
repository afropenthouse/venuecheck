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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

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
        <Card className="shadow-soft hover:shadow-elegant transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-soft">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
                <p className="text-xs text-muted-foreground font-medium">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft hover:shadow-elegant transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center shadow-soft">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{bookings.filter(b => b.status === "PENDING").length}</p>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft hover:shadow-elegant transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-soft">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{bookings.filter(b => b.status === "APPROVED").length}</p>
                <p className="text-xs text-muted-foreground font-medium">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft hover:shadow-elegant transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shadow-soft">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{bookings.filter(b => b.status === "DECLINED").length}</p>
                <p className="text-xs text-muted-foreground font-medium">Declined</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 sm:w-40">
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
            </div>
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredBookings.length}</span> of <span className="font-medium">{bookings.length}</span> requests
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No inspection requests found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {statusFilter === "all" 
                ? "No booking requests yet. When guests request inspections, they'll appear here."
                : `No ${statusFilter.toLowerCase()} requests found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className={`shadow-soft hover:shadow-elegant transition-all duration-300 ${booking.status === "PENDING" ? "ring-2 ring-yellow-200 ring-opacity-50" : ""}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full font-medium flex-shrink-0 shadow-soft ${
                        booking.status === "PENDING" 
                          ? "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 animate-pulse" 
                          : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                      }`}>
                        {booking.guestName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-foreground truncate">{booking.guestName}</h3>
                            <Badge className={`${getStatusColor(booking.status)} text-xs font-medium px-3 py-1 ${
                              booking.status === "PENDING" ? "animate-pulse shadow-sm" : ""
                            }`}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 font-medium">{booking.venue.name}</p>
                        
                        <div className="space-y-3">
                          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                            <span className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Mail className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="truncate">{booking.guestEmail}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                <Phone className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="truncate">{booking.guestPhone}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                                <Users className="h-4 w-4 text-purple-600" />
                              </div>
                              <span>{booking.guests} guests</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-4 w-4 text-orange-600" />
                              </div>
                              <span className="truncate">{booking.venue.location}</span>
                            </span>
                          </div>

                          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                            <span className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-4 w-4 text-indigo-600" />
                              </div>
                              <span>Booking: {booking.bookingDate ? format(new Date(booking.bookingDate), "MMM d, yyyy h:mm a") : "TBD"}</span>
                            </span>
                            {booking.inspectionDate && (
                              <span className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                                  <Clock className="h-4 w-4 text-pink-600" />
                                </div>
                                <span>Inspection: {format(new Date(booking.inspectionDate), "MMM d, yyyy h:mm a")}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                            <Calendar className="h-3 w-3" />
                            Requested {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {booking.status === "PENDING" && (
                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 lg:ml-4 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="default" 
                        onClick={() => handleDecline(booking.id)}
                        className="w-full sm:w-auto hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors border-2 bg-white shadow-sm"
                      >
                        <X className="h-4 w-4" /> 
                        <span className="ml-2">Decline</span>
                      </Button>
                      <Button 
                        size="default" 
                        className="w-full sm:w-auto bg-primary hover:bg-primary-glow shadow-soft hover:shadow-elegant transition-all font-medium" 
                        onClick={() => handleApprove(booking.id)}
                      >
                        <Check className="h-4 w-4" /> 
                        <span className="ml-2">Approve</span>
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
