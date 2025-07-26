import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Car, Phone, Mail, Upload, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Driver {
  id: string;
  user_id: string;
  license_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_license_plate: string;
  phone: string;
  is_active: boolean;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

const DriverProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<Profile>>({});
  const [editingDriver, setEditingDriver] = useState<Partial<Driver>>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadDriverProfile();
  }, []);

  const loadDriverProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user is a driver
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (!roleData || roleData.role !== 'driver') {
        navigate('/');
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);
      setEditingProfile(profileData || {});

      // Load driver data
      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setDriver(driverData);
      setEditingDriver(driverData || {});

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      // Update profile
      if (editingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            ...editingProfile
          });

        if (profileError) throw profileError;
      }

      // Update driver data
      if (editingDriver && driver) {
        const { error: driverError } = await supabase
          .from('drivers')
          .update(editingDriver)
          .eq('id', driver.id);

        if (driverError) throw driverError;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      setEditing(false);
      loadDriverProfile();

    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile.",
        variant: "destructive",
      });
    }
  };

  const getVerificationStatus = () => {
    if (!profile?.first_name || !profile?.last_name || !driver?.vehicle_make) {
      return { status: 'incomplete', label: 'Profile Incomplete', variant: 'destructive' as const };
    }
    if (!driver?.is_active) {
      return { status: 'pending', label: 'Pending Approval', variant: 'secondary' as const };
    }
    return { status: 'verified', label: 'Verified', variant: 'default' as const };
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const verification = getVerificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Profile</h1>
            <p className="text-gray-600">Manage your profile and vehicle information</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={saveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {profile?.first_name} {profile?.last_name} 
                  </h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <Badge variant={verification.variant}>
                {verification.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editing ? editingProfile.first_name || '' : profile?.first_name || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, first_name: e.target.value})}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editing ? editingProfile.last_name || '' : profile?.last_name || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, last_name: e.target.value})}
                    disabled={!editing}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editing ? editingProfile.phone || '' : profile?.phone || ''}
                  onChange={(e) => setEditingProfile({...editingProfile, phone: e.target.value})}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleMake">Make</Label>
                  <Input
                    id="vehicleMake"
                    value={editing ? editingDriver.vehicle_make || '' : driver?.vehicle_make || ''}
                    onChange={(e) => setEditingDriver({...editingDriver, vehicle_make: e.target.value})}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleModel">Model</Label>
                  <Input
                    id="vehicleModel"
                    value={editing ? editingDriver.vehicle_model || '' : driver?.vehicle_model || ''}
                    onChange={(e) => setEditingDriver({...editingDriver, vehicle_model: e.target.value})}
                    disabled={!editing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleYear">Year</Label>
                  <Input
                    id="vehicleYear"
                    type="number"
                    value={editing ? editingDriver.vehicle_year || '' : driver?.vehicle_year || ''}
                    onChange={(e) => setEditingDriver({...editingDriver, vehicle_year: parseInt(e.target.value)})}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    value={editing ? editingDriver.vehicle_license_plate || '' : driver?.vehicle_license_plate || ''}
                    onChange={(e) => setEditingDriver({...editingDriver, vehicle_license_plate: e.target.value})}
                    disabled={!editing}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="licenseNumber">Driver License Number</Label>
                <Input
                  id="licenseNumber"
                  value={editing ? editingDriver.license_number || '' : driver?.license_number || ''}
                  onChange={(e) => setEditingDriver({...editingDriver, license_number: e.target.value})}
                  disabled={!editing}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;