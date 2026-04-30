import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Edit2, Trash2, MapPin, Users, Plus, Share2, Upload, X, Calendar, Star, Image as ImageIcon, Settings, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar as DateCalendar } from "@/components/ui/calendar";

type Venue = {
  id: string; name: string; location: string; maxGuests: number;
  pricePerDay: number; description: string; images: string[]; amenities: string[];
  unavailableDates: string[];
};

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"create" | "edit">("create");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [newVenue, setNewVenue] = useState({ name: "", location: "", maxGuests: 50, pricePerDay: 500, description: "", images: [] as string[], unavailableDates: [] as string[] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await api.venues.getAll();
      setVenues(data);
    } catch (err) {
      toast.error("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const share = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/venue/${id}`);
    toast.success("Share link copied");
  };

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/venue/${id}`);
    toast.success("Link copied to clipboard!");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Photo size must be less than 5MB");
      // Clear the file input
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const { url } = await api.upload.image(base64);
        if (isEdit && editingVenue) {
          // Replace existing photo with new one (only one photo allowed)
          setEditingVenue({ ...editingVenue, images: [url] });
        } else {
          // Replace existing photo with new one (only one photo allowed)
          setNewVenue({ ...newVenue, images: [url] });
        }
        toast.success("Photo uploaded successfully!");
      } catch (err) {
        toast.error("Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (url: string, isEdit = false) => {
    if (isEdit && editingVenue) {
      setEditingVenue({ ...editingVenue, images: editingVenue.images.filter((img) => img !== url) });
    } else {
      setNewVenue({ ...newVenue, images: newVenue.images.filter((img) => img !== url) });
    }
  };

  const openDatePicker = (mode: "create" | "edit") => {
    setDatePickerMode(mode);
    setSelectedDates([]);
    setShowDatePicker(true);
  };

  const addUnavailableDates = () => {
    const newDates = selectedDates.map(date => format(date, "yyyy-MM-dd"));
    if (datePickerMode === "edit" && editingVenue) {
      const existingDates = editingVenue.unavailableDates;
      const uniqueDates = newDates.filter(date => !existingDates.includes(date));
      setEditingVenue({ ...editingVenue, unavailableDates: [...existingDates, ...uniqueDates] });
      toast.success(`${uniqueDates.length} date${uniqueDates.length > 1 ? 's' : ''} blocked successfully`);
    } else {
      const existingDates = newVenue.unavailableDates;
      const uniqueDates = newDates.filter(date => !existingDates.includes(date));
      setNewVenue({ ...newVenue, unavailableDates: [...existingDates, ...uniqueDates] });
      toast.success(`${uniqueDates.length} date${uniqueDates.length > 1 ? 's' : ''} blocked successfully`);
    }
    setSelectedDates([]);
    setShowDatePicker(false); // Auto-close the date picker after blocking dates
  };

  const removeUnavailableDate = (dateStr: string, isEdit = false) => {
    if (isEdit && editingVenue) {
      setEditingVenue({ ...editingVenue, unavailableDates: editingVenue.unavailableDates.filter((d) => d !== dateStr) });
      toast.success("Date unblocked successfully");
    } else {
      setNewVenue({ ...newVenue, unavailableDates: newVenue.unavailableDates.filter((d) => d !== dateStr) });
      toast.success("Date unblocked successfully");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.venues.create(newVenue);
      toast.success("Venue created!");
      setShowCreate(false);
      setNewVenue({ name: "", location: "", maxGuests: 50, pricePerDay: 500, description: "", images: [], unavailableDates: [] });
      loadVenues();
    } catch (err) {
      toast.error("Failed to create venue");
    }
  };

  const handleEdit = async () => {
    if (!editingVenue) return;
    try {
      await api.venues.update(editingVenue.id, {
        name: editingVenue.name,
        location: editingVenue.location,
        maxGuests: editingVenue.maxGuests,
        pricePerDay: editingVenue.pricePerDay,
        description: editingVenue.description,
        images: editingVenue.images,
        unavailableDates: editingVenue.unavailableDates
      });
      toast.success("Venue updated!");
      setEditingVenue(null);
      loadVenues();
    } catch (err) {
      toast.error("Failed to update venue");
    }
  };

  const handleDelete = (id: string) => {
    const venue = venues.find(v => v.id === id);
    if (venue) {
      setDeletingVenue(venue);
      setDeleteConfirmText("");
    }
  };

  const confirmDelete = async () => {
    if (!deletingVenue) return;
    
    try {
      await api.venues.delete(deletingVenue.id);
      setVenues(venues.filter(v => v.id !== deletingVenue.id));
      toast.success("Venue deleted successfully");
      setDeletingVenue(null);
      setDeleteConfirmText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete venue");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-fade-in">Loading your venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-warm rounded-3xl p-8 shadow-elegant">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <p className="text-sm font-medium text-muted-foreground">Venue Management</p>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Your Venues
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Manage your spaces, control availability, set pricing, and showcase your properties to potential guests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowCreate(true)} className="gap-2 bg-primary hover:bg-primary-glow shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <Plus className="h-4 w-4" /> 
              <span>New venue</span>
            </Button>
          </div>
        </div>
      </div>

      {venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">No venues yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Start by creating your first venue to begin managing your properties and accepting bookings.
          </p>
          <Button onClick={() => setShowCreate(true)} className="gap-2 bg-primary hover:bg-primary-glow">
            <Plus className="h-4 w-4" /> Create your first venue
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {venues.map((v, index) => (
            <div 
              key={v.id} 
              className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:shadow-elegant hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="lg:w-40 h-24 lg:h-auto overflow-hidden bg-muted">
                  {v.images?.[0] ? (
                    <img 
                      src={v.images[0]} 
                      alt={v.name} 
                      loading="lazy" 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="flex-1 p-3 lg:p-4">
                  <div className="flex flex-col h-full justify-between gap-2">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-2">
                          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                            {v.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span className="font-medium">{v.location}</span>
                            </span>
                            <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded">
                              <Users className="h-3 w-3 text-blue-500" />
                              <span className="font-medium">{v.maxGuests} guests</span>
                            </span>
                            <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              <span className="font-medium text-amber-700">₦{v.pricePerDay.toLocaleString()}/day</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {v.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2 rounded">
                          {v.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1.5">
                        {v.unavailableDates?.length > 0 && (
                          <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {v.unavailableDates.length} date{v.unavailableDates.length > 1 ? 's' : ''} blocked
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                      <Link to={`/venue/${v.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-1 hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs py-1.5">
                          <MapPin className="h-3 w-3" />
                          View details
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyLink(v.id)}
                        className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs py-1.5 px-3"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy link
                      </Button>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingVenue(v)}
                          className="hover:bg-blue-50 hover:text-blue-600 border-blue-100 transition-all duration-300 h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(v.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 transition-all duration-300 h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl shadow-elegant w-[95vw] sm:w-full">
          <DialogHeader className="space-y-3 pb-6 border-b border-border">
            <DialogTitle className="font-display text-xl sm:text-2xl font-semibold">Create New Venue</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Add a new venue to your portfolio and start accepting bookings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 sm:space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Venue Name <span className="text-destructive">*</span></Label>
                <Input 
                  value={newVenue.name} 
                  onChange={(e) => setNewVenue({...newVenue, name: e.target.value})} 
                  placeholder="Enter venue name"
                  className="rounded-xl text-sm"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location <span className="text-destructive">*</span></Label>
                <Input 
                  value={newVenue.location} 
                  onChange={(e) => setNewVenue({...newVenue, location: e.target.value})} 
                  placeholder="City, State"
                  className="rounded-xl text-sm"
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Guests <span className="text-destructive">*</span></Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10000"
                  value={newVenue.maxGuests === 50 ? "" : newVenue.maxGuests.toString()} 
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = parseInt(value);
                    setNewVenue({...newVenue, maxGuests: num > 0 ? num : 50});
                  }} 
                  placeholder="e.g., 50"
                  className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">Maximum number of guests allowed</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Price/Day (₦) <span className="text-destructive">*</span></Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="10000000"
                  value={newVenue.pricePerDay === 500 ? "" : newVenue.pricePerDay.toString()} 
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = parseInt(value);
                    setNewVenue({...newVenue, pricePerDay: num >= 0 ? num : 500});
                  }} 
                  placeholder="e.g., 5000"
                  className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">Daily rental price in Naira</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea 
                value={newVenue.description} 
                onChange={(e) => setNewVenue({...newVenue, description: e.target.value})} 
                placeholder="Describe your venue..."
                className="rounded-xl text-sm resize-none"
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Venue Photo <span className="text-destructive">*</span></Label>
              <div className="space-y-3">
                {newVenue.images[0] ? (
                  <div className="relative w-full h-32 sm:h-48 rounded-xl overflow-hidden border border-border shadow-soft">
                    <img src={newVenue.images[0]} alt="Venue" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(newVenue.images[0])} 
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/70 hover:bg-black text-white rounded-full p-1.5 sm:p-2 transition-colors shadow-lg"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 sm:h-48 rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 flex flex-col items-center justify-center cursor-pointer hover:bg-destructive/10 transition-colors">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-destructive mb-2" />
                    <span className="text-xs sm:text-sm text-destructive font-medium">Venue photo is required</span>
                    <span className="text-xs text-muted-foreground mt-1 hidden sm:block">JPG, PNG, GIF up to 5MB</span>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/*" 
                      className="sr-only" 
                      onChange={(e) => handleImageUpload(e)} 
                      required
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {newVenue.images.length === 1 ? "1 photo uploaded" : "No photo uploaded - required"}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Unavailable Dates</Label>
              <p className="text-xs text-muted-foreground">Select dates when the venue is not available for booking</p>
              <div className="flex flex-wrap gap-2">
                {newVenue.unavailableDates.map((d, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                    {new Date(d).toLocaleDateString()}
                    <button 
                      type="button" 
                      onClick={() => removeUnavailableDate(d)} 
                      className="hover:text-amber-900 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {newVenue.unavailableDates.length === 0 && <span className="text-xs text-muted-foreground">No blocked dates</span>}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => openDatePicker("create")}
                className="gap-2 rounded-xl"
              >
                <Calendar className="h-4 w-4" /> Block dates
              </Button>
            </div>

            <DialogFooter className="pt-4 sm:pt-6 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreate(false)}
                className="rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-glow rounded-xl text-sm"
              >
                Create Venue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingVenue} onOpenChange={(o) => !o && setEditingVenue(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl shadow-elegant w-[95vw] sm:w-full">
          <DialogHeader className="space-y-3 pb-6 border-b border-border">
            <DialogTitle className="font-display text-xl sm:text-2xl font-semibold">Edit Venue</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update venue details, pricing, and availability
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Venue Name <span className="text-destructive">*</span></Label>
                <Input 
                  value={editingVenue?.name || ""} 
                  onChange={(e) => setEditingVenue({...editingVenue!, name: e.target.value})} 
                  className="rounded-xl text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location <span className="text-destructive">*</span></Label>
                <Input 
                  value={editingVenue?.location || ""} 
                  onChange={(e) => setEditingVenue({...editingVenue!, location: e.target.value})} 
                  className="rounded-xl text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Guests <span className="text-destructive">*</span></Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10000"
                  value={editingVenue?.maxGuests === 50 ? "" : editingVenue?.maxGuests?.toString() || ""} 
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = parseInt(value);
                    setEditingVenue({...editingVenue!, maxGuests: num > 0 ? num : 50});
                  }} 
                  placeholder="e.g., 50"
                  className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">Maximum number of guests allowed</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Price/Day (₦) <span className="text-destructive">*</span></Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="10000000"
                  value={editingVenue?.pricePerDay === 500 ? "" : editingVenue?.pricePerDay?.toString() || ""} 
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = parseInt(value);
                    setEditingVenue({...editingVenue!, pricePerDay: num >= 0 ? num : 500});
                  }} 
                  placeholder="e.g., 5000"
                  className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">Daily rental price in Naira</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea 
                value={editingVenue?.description || ""} 
                onChange={(e) => setEditingVenue({...editingVenue!, description: e.target.value})} 
                placeholder="Describe your venue..."
                className="rounded-xl text-sm resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Venue Photo <span className="text-destructive">*</span></Label>
              <div className="space-y-3">
                {editingVenue?.images[0] ? (
                  <div className="relative w-full h-32 sm:h-48 rounded-xl overflow-hidden border border-border shadow-soft">
                    <img src={editingVenue.images[0]} alt="Venue" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(editingVenue.images[0], true)} 
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/70 hover:bg-black text-white rounded-full p-1.5 sm:p-2 transition-colors shadow-lg"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 sm:h-48 rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 flex flex-col items-center justify-center cursor-pointer hover:bg-destructive/10 transition-colors">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-destructive mb-2" />
                    <span className="text-xs sm:text-sm text-destructive font-medium">Venue photo is required</span>
                    <span className="text-xs text-muted-foreground mt-1 hidden sm:block">JPG, PNG, GIF up to 5MB</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="sr-only" 
                      onChange={(e) => handleImageUpload(e, true)} 
                      required
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {editingVenue?.images.length === 1 ? "1 photo uploaded" : "No photo uploaded - required"}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Unavailable Dates</Label>
              <p className="text-xs text-muted-foreground">Select dates when the venue is not available for booking</p>
              <div className="flex flex-wrap gap-2">
                {editingVenue?.unavailableDates.map((d, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                    {new Date(d).toLocaleDateString()}
                    <button 
                      type="button" 
                      onClick={() => removeUnavailableDate(d, true)} 
                      className="hover:text-amber-900 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {editingVenue?.unavailableDates.length === 0 && <span className="text-xs text-muted-foreground">No blocked dates</span>}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => openDatePicker("edit")}
                className="gap-2 rounded-xl"
              >
                <Calendar className="h-4 w-4" /> Block dates
              </Button>
            </div>

            <DialogFooter className="pt-4 sm:pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setEditingVenue(null)}
                className="rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEdit} 
                className="bg-primary hover:bg-primary-glow rounded-xl text-sm"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="max-w-lg p-4 sm:p-6 rounded-2xl shadow-elegant w-[95vw] sm:w-full">
          <DialogHeader className="space-y-3 pb-4 sm:pb-6 border-b border-border">
            <DialogTitle className="font-display text-lg sm:text-xl font-semibold">Block Dates</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Click dates to select multiple dates for blocking
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4 sm:py-6">
            <DateCalendar
              mode="multiple"
              selected={selectedDates}
              onSelect={setSelectedDates}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-xl border text-xs sm:text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-4 border-t border-border">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {selectedDates.length > 0 ? (
                <span className="font-medium text-primary">{selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected</span>
              ) : (
                <span>No dates selected</span>
              )}
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDatePicker(false)}
                className="rounded-xl text-xs sm:text-sm flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                onClick={addUnavailableDates} 
                disabled={selectedDates.length === 0} 
                className="bg-primary hover:bg-primary-glow rounded-xl text-xs sm:text-sm flex-1 sm:flex-none"
                size="sm"
              >
                Block {selectedDates.length > 0 ? `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''}` : 'dates'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingVenue} onOpenChange={(o) => !o && setDeletingVenue(null)}>
        <DialogContent className="max-w-md p-4 sm:p-6 rounded-2xl shadow-elegant w-[95vw] sm:w-full">
          <DialogHeader className="space-y-3 pb-4 sm:pb-6 border-b border-border">
            <DialogTitle className="font-display text-lg sm:text-xl font-semibold text-destructive">Delete Venue</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete "{deletingVenue?.name}" and all its data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type "delete" to confirm</Label>
              <Input 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type delete here..."
                className="rounded-xl text-sm"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="pt-4 sm:pt-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeletingVenue(null);
                setDeleteConfirmText("");
              }}
              className="rounded-xl text-sm"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteConfirmText !== "delete"}
              className="rounded-xl text-sm"
            >
              Delete Venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Venues;
