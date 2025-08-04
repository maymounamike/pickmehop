import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, FileText, Car, Building, Camera, Upload, Calendar, Phone, Mail, MapPin, CreditCard, Settings, Bell } from "lucide-react";
import { VerificationBadge, type VerificationStatus } from "@/components/forms/VerificationBadge";
import { FileUpload } from "@/components/forms/FileUpload";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  verification_status: VerificationStatus;
  member_since: string;
  role: 'driver' | 'partner' | 'user' | 'admin';
}

interface DriverProfile {
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_license_plate: string;
  license_number: string;
  is_active: boolean;
}

interface PartnerProfile {
  company_name: string;
  partnership_type: string;
  commission_rate: number;
  is_active: boolean;
}

const ProfileDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("personal");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      // Determine verification status (simplified logic)
      let verificationStatus: VerificationStatus = "not_verified";
      if (profileData.first_name && profileData.last_name && profileData.phone) {
        verificationStatus = "pending_verification";
      }

      const userProfile: UserProfile = {
        id: profileData.id,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
        email: session.user.email || '',
        verification_status: verificationStatus,
        member_since: profileData.created_at,
        role: roleData?.role || 'user'
      };

      setProfile(userProfile);

      // Load role-specific profile
      if (roleData?.role === 'driver') {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (driverData) {
          setDriverProfile(driverData);
          if (driverData.is_active) {
            userProfile.verification_status = "verified";
          } else {
            userProfile.verification_status = "under_review";
          }
        }
      } else if (roleData?.role === 'partner') {
        const { data: partnerData } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (partnerData) {
          setPartnerProfile(partnerData);
          if (partnerData.is_active) {
            userProfile.verification_status = "verified";
          } else {
            userProfile.verification_status = "under_review";
          }
        }
      }

      setProfile(userProfile);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          phone: updates.phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateDriverProfile = async (updates: Partial<DriverProfile>) => {
    if (!user || !driverProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setDriverProfile({ ...driverProfile, ...updates });
      toast({
        title: "Vehicle info updated",
        description: "Your vehicle information has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle info",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getVerificationProgress = () => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = profile.role === 'driver' ? 4 : 3;
    
    // Basic info
    if (profile.first_name && profile.last_name && profile.phone) completed++;
    
    // Role-specific checks
    if (profile.role === 'driver' && driverProfile) {
      if (driverProfile.license_number) completed++;
      if (driverProfile.vehicle_make && driverProfile.vehicle_model) completed++;
      if (driverProfile.is_active) completed++;
    } else if (profile.role === 'partner' && partnerProfile) {
      if (partnerProfile.company_name) completed++;
      if (partnerProfile.is_active) completed++;
    }
    
    return Math.round((completed / total) * 100);
  };

  const getRequiredItems = () => {
    if (!profile) return [];
    
    const items = [
      {
        label: "Personal information",
        completed: !!(profile.first_name && profile.last_name && profile.phone),
        required: true
      }
    ];
    
    if (profile.role === 'driver') {
      items.push(
        {
          label: "Driver's license",
          completed: !!(driverProfile?.license_number),
          required: true
        },
        {
          label: "Vehicle information",
          completed: !!(driverProfile?.vehicle_make && driverProfile?.vehicle_model),
          required: true
        },
        {
          label: "Admin approval",
          completed: !!(driverProfile?.is_active),
          required: true
        }
      );
    } else if (profile.role === 'partner') {
      items.push(
        {
          label: "Company information",
          completed: !!(partnerProfile?.company_name),
          required: true
        },
        {
          label: "Admin approval",
          completed: !!(partnerProfile?.is_active),
          required: true
        }
      );
    }
    
    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Profile not found</h2>
          <Button onClick={() => navigate("/auth")}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  {profilePhoto.length > 0 ? (
                    <img 
                      src={URL.createObjectURL(profilePhoto[0])} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary-foreground" />
                  )}
                </div>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => document.getElementById('profile-photo-upload')?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setProfilePhoto(files);
                  }}
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <VerificationBadge status={profile.verification_status} />
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(profile.member_since).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                </div>

                <Button
                  onClick={() => setActiveTab("personal")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Progress</span>
                <span className="text-sm text-muted-foreground">{getVerificationProgress()}%</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getVerificationProgress()}%` }}
                />
              </div>

              <div className="space-y-2">
                {getRequiredItems().map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-success' : 'bg-destructive'}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.completed 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {item.completed ? 'Complete' : 'Required'}
                    </span>
                  </div>
                ))}
              </div>

              {profile.verification_status === 'pending_verification' && (
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                  <p className="text-sm text-secondary-foreground">
                    <Bell className="inline h-4 w-4 mr-1" />
                    Your application is being reviewed. We'll notify you via email once the review is complete.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Sections */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                {profile.role === 'driver' && (
                  <TabsTrigger value="vehicle" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle
                  </TabsTrigger>
                )}
                {profile.role === 'partner' && (
                  <TabsTrigger value="business" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Business
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="personal" className="p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.first_name}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.last_name}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => updateProfile(profile)} 
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Documents</h3>
                  
                  <FileUpload
                    label="Upload Documents"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple={true}
                    onFilesChange={setDocuments}
                    value={documents}
                    description="Upload your license, registration, insurance, and other required documents"
                  />

                  <div className="space-y-4">
                    <h4 className="font-medium">Document Status</h4>
                    <div className="space-y-2">
                      {[
                        { name: "Driver's License", status: "pending" },
                        { name: "Vehicle Registration", status: "approved" },
                        { name: "Insurance Certificate", status: "pending" },
                      ].map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{doc.name}</span>
                          <VerificationBadge 
                            status={doc.status === "approved" ? "verified" : "pending_verification"} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {profile.role === 'driver' && driverProfile && (
                <TabsContent value="vehicle" className="p-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Vehicle Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleMake">Vehicle Make</Label>
                        <Input
                          id="vehicleMake"
                          value={driverProfile.vehicle_make || ''}
                          onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_make: e.target.value })}
                          placeholder="e.g., Toyota"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Vehicle Model</Label>
                        <Input
                          id="vehicleModel"
                          value={driverProfile.vehicle_model || ''}
                          onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_model: e.target.value })}
                          placeholder="e.g., Camry"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleYear">Vehicle Year</Label>
                        <Input
                          id="vehicleYear"
                          type="number"
                          value={driverProfile.vehicle_year || ''}
                          onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_year: parseInt(e.target.value) })}
                          placeholder="2020"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licensePlate">License Plate</Label>
                        <Input
                          id="licensePlate"
                          value={driverProfile.vehicle_license_plate || ''}
                          onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_license_plate: e.target.value })}
                          placeholder="ABC-1234"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Driver's License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={driverProfile.license_number || ''}
                        onChange={(e) => setDriverProfile({ ...driverProfile, license_number: e.target.value })}
                        placeholder="License number"
                      />
                    </div>

                    <Button 
                      onClick={() => updateDriverProfile(driverProfile)} 
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {saving ? "Saving..." : "Save Vehicle Info"}
                    </Button>
                  </div>
                </TabsContent>
              )}

              {profile.role === 'partner' && partnerProfile && (
                <TabsContent value="business" className="p-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Business Information</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={partnerProfile.company_name || ''}
                          placeholder="Your company name"
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partnershipType">Partnership Type</Label>
                        <Input
                          id="partnershipType"
                          value={partnerProfile.partnership_type || ''}
                          placeholder="Business partnership type"
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commissionRate">Commission Rate</Label>
                        <Input
                          id="commissionRate"
                          value={`${partnerProfile.commission_rate || 0}%`}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Business information can only be updated by contacting support. 
                        Please reach out to our team for any changes.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileDashboard;