import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserCheck, Loader2, Crown, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus: string;
  subscriptionEndDate?: string;
  manuallyActivated?: boolean;
  activatedBy?: string;
}

const AdminManualActivation = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // For now, we'll need to create an endpoint to get all users
      // This is a placeholder - you'll need to implement this endpoint
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        // Fallback: show a message that admin endpoint is needed
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManualActivation = async () => {
    if (!selectedUser) return;

    setActivating(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.payments.manualActivate(
        selectedUser.id,
        selectedMonths,
        currentUser.id
      );

      if (response.success) {
        toast.success(`Subscription activated for ${selectedUser.email}`);
        setSelectedUser(null);
        fetchUsers(); // Refresh users list
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate subscription');
    } finally {
      setActivating(false);
    }
  };

  const getStatusBadge = (status: string, manuallyActivated?: boolean) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Free</Badge>
            {manuallyActivated && (
              <Badge variant="outline" className="text-xs">Manual</Badge>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Manual Subscription Activation
          </CardTitle>
          <CardDescription>
            Manually activate subscriptions for users who have paid through other means
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No users found or admin endpoint not implemented. Please create the admin endpoint to fetch users.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name || 'No name'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.subscriptionStatus, user.manuallyActivated)}
                        </TableCell>
                        <TableCell>
                          {user.subscriptionEndDate ? (
                            new Date(user.subscriptionEndDate).toLocaleDateString()
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            disabled={user.subscriptionStatus === 'ACTIVE'}
                          >
                            {user.subscriptionStatus === 'ACTIVE' ? 'Active' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Activate Subscription for {selectedUser.email}
            </CardTitle>
            <CardDescription>
              Choose the subscription duration for this user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subscription Duration</Label>
              <Select value={selectedMonths.toString()} onValueChange={(value) => setSelectedMonths(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Months - ¥180,000</SelectItem>
                  <SelectItem value="7">7 Months - ¥210,000</SelectItem>
                  <SelectItem value="8">8 Months - ¥240,000</SelectItem>
                  <SelectItem value="9">9 Months - ¥270,000 (5% discount)</SelectItem>
                  <SelectItem value="10">10 Months - ¥300,000</SelectItem>
                  <SelectItem value="11">11 Months - ¥330,000</SelectItem>
                  <SelectItem value="12">12 Months - ¥360,000 (10% discount)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will manually activate the subscription for {selectedMonths} months. 
                The user will have immediate access to all premium features.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={handleManualActivation} disabled={activating}>
                {activating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate Subscription'
                )}
              </Button>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminManualActivation;
