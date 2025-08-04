import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Car, Phone, Mail, Building2, Shield, Chrome, Facebook, Apple } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in and redirect to dashboard
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Redirect to dashboard router which will handle role-based routing
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Account created! Please check your email to verify your account.",
        });
        // Clear form
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced OAuth handlers
  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setOauthLoading('facebook');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setOauthLoading('apple');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOauthLoading(null);
    }
  };

  // Enhanced phone authentication
  const handlePhoneSignIn = async () => {
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setPhoneLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone }
      });

      if (error) throw error;

      setPhoneVerificationSent(true);
      toast({
        title: "Code sent",
        description: "Check your phone for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setPhoneLoading(true);
    try {
      const { error } = await supabase.functions.invoke('verify-phone-code', {
        body: { phone, code: verificationCode }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Phone verified! Redirecting...",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  // Enhanced partner registration
  const handlePartnerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !companyName || !businessType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
            business_type: businessType,
            role: 'partner'
          }
        }
      });

      if (error) throw error;

      // Create partner profile
      if (data.user) {
        const { error: profileError } = await supabase.from('partners').insert({
          user_id: data.user.id,
          company_name: companyName,
          partnership_type: businessType,
          is_active: false // Requires admin approval
        });

        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'partner'
        });

        if (profileError || roleError) {
          console.error('Profile creation error:', profileError || roleError);
        }
      }

      toast({
        title: "Application submitted",
        description: "Your partner application is under review. You'll receive an email once approved.",
      });
      
      // Clear form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setCompanyName("");
      setBusinessType("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in result:', { data, error });

      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Error",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        console.log('Sign in successful:', data);
        
        // Get user role and redirect appropriately
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .order('role', { ascending: true });

        let redirectPath = '/customer'; // Default for regular users
        
        if (roleData && roleData.length > 0) {
          const roles = roleData.map(r => r.role);
          // Prioritize admin > driver > partner > user
          if (roles.includes('admin')) {
            redirectPath = '/admin';
          } else if (roles.includes('driver')) {
            redirectPath = '/driver';
          } else if (roles.includes('partner')) {
            redirectPath = '/partner';
          } else {
            redirectPath = '/customer';
          }
        }

        toast({
          title: "Welcome!",
          description: "Redirecting to your dashboard...",
        });
        
        // Small delay to show the toast before redirecting
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Pick Me Hop Authentication</CardTitle>
          <CardDescription>Choose your role to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="customer" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="driver" className="text-xs">
                <Car className="h-3 w-3 mr-1" />
                Driver
              </TabsTrigger>
              <TabsTrigger value="partner" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                Partner
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </TabsTrigger>
            </TabsList>
            
            {/* Customer Authentication */}
            <TabsContent value="customer" className="space-y-4">
              <div className="text-center mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Customer Portal
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Book rides, manage trips, and track your journey
                </p>
              </div>

              {/* Social Login Options */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGoogleSignIn}
                  disabled={oauthLoading === 'google'}
                >
                  {oauthLoading === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFacebookSignIn}
                  disabled={oauthLoading === 'facebook'}
                >
                  {oauthLoading === 'facebook' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Facebook className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAppleSignIn}
                  disabled={oauthLoading === 'apple'}
                >
                  {oauthLoading === 'apple' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Apple className="h-4 w-4" />}
                </Button>
              </div>

              <Separator className="my-4" />

              {/* Phone Authentication */}
              <div className="space-y-3">
                <Label>Sign in with Phone</Label>
                {!phoneVerificationSent ? (
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handlePhoneSignIn} 
                      disabled={phoneLoading}
                      size="sm"
                    >
                      {phoneLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleVerifyPhone} 
                      disabled={phoneLoading}
                      size="sm"
                    >
                      Verify
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Email/Password */}
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="submit" disabled={loading} variant="outline">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Sign In
                  </Button>
                  <Button type="button" onClick={handleSignUp} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign Up
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Driver Authentication */}
            <TabsContent value="driver" className="space-y-4">
              <div className="text-center mb-4">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Driver Portal - Secure Access
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Enhanced security for professional drivers
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <Label htmlFor="driver-email">Email</Label>
                  <Input
                    id="driver-email"
                    type="email"
                    placeholder="driver@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="driver-password">Password</Label>
                  <Input
                    id="driver-password"
                    type="password"
                    placeholder="Your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="driver-phone">Phone (Required for Security)</Label>
                  <Input
                    id="driver-phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Car className="mr-2 h-4 w-4" />}
                  Driver Sign In
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/driver-signup")}
                >
                  Apply to Become a Driver
                </Button>
              </form>
            </TabsContent>

            {/* Partner Authentication */}
            <TabsContent value="partner" className="space-y-4">
              <div className="text-center mb-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Partner Portal
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  For hotels, travel agencies, and business partners
                </p>
              </div>

              <form onSubmit={handlePartnerSignUp} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="partner-first-name">First Name</Label>
                    <Input
                      id="partner-first-name"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="partner-last-name">Last Name</Label>
                    <Input
                      id="partner-last-name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Your Company Ltd."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="business-type">Business Type</Label>
                  <Input
                    id="business-type"
                    placeholder="Hotel, Travel Agency, etc."
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="partner-email">Business Email</Label>
                  <Input
                    id="partner-email"
                    type="email"
                    placeholder="contact@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="partner-password">Password</Label>
                  <Input
                    id="partner-password"
                    type="password"
                    placeholder="Secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="submit" disabled={loading} variant="outline">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Sign In
                  </Button>
                  <Button type="button" onClick={handlePartnerSignUp} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building2 className="mr-2 h-4 w-4" />}
                    Apply as Partner
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Admin Authentication */}
            <TabsContent value="admin" className="space-y-4">
              <div className="text-center mb-4">
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  Admin Portal - Maximum Security
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Administrative access with 2FA required
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@pickmehop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Your admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                  Admin Sign In (2FA Required)
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Admin access requires two-factor authentication
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;