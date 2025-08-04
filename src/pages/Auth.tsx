import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Car, User, Briefcase, Mail, Lock, Eye, EyeOff, Chrome, Facebook } from "lucide-react";

type AuthFlow = 'signin' | 'signup' | 'role-selection' | 'complete-profile';
type UserRole = 'user' | 'driver' | 'partner';

const Auth = () => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Flow state
  const [currentFlow, setCurrentFlow] = useState<AuthFlow>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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
        // Get user role and redirect appropriately
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .order('role', { ascending: true });

        let redirectPath = '/customer';
        
        if (roleData && roleData.length > 0) {
          const roles = roleData.map(r => r.role);
          if (roles.includes('admin')) {
            redirectPath = '/admin';
          } else if (roles.includes('driver')) {
            redirectPath = '/driver';
          } else if (roles.includes('partner')) {
            redirectPath = '/partner';
          }
        }

        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });
        
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
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

  const handleEmailSignUp = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select how you'll use Pick Me Hop",
        variant: "destructive",
      });
      return;
    }

    if (!email || !password || !firstName || !lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedRole === 'partner' && (!companyName || !businessType)) {
      toast({
        title: "Error",
        description: "Please fill in company information",
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
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName,
            ...(selectedRole === 'partner' && {
              company_name: companyName,
              business_type: businessType,
            })
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
        return;
      }

      // Set user role
      if (data.user) {
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: selectedRole
        });

        // Create role-specific profile
        if (selectedRole === 'partner') {
          await supabase.from('partners').insert({
            user_id: data.user.id,
            company_name: companyName,
            partnership_type: businessType,
            is_active: false
          });
        }

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }
      }

      toast({
        title: "Account created!",
        description: selectedRole === 'partner' 
          ? "Your partner application is under review. Check your email to verify your account."
          : "Please check your email to verify your account.",
      });
      
      // Reset form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setCompanyName("");
      setBusinessType("");
      setCurrentFlow('signin');
      setSelectedRole(null);
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

  const handleSocialSignUp = async (provider: 'google' | 'facebook') => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select how you'll use Pick Me Hop first",
        variant: "destructive",
      });
      return;
    }

    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            role: selectedRole
          }
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

  const roleCards = [
    {
      id: 'user' as UserRole,
      title: 'Customer',
      description: 'Book rides',
      icon: User,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      selectedColor: 'bg-blue-100 border-blue-500'
    },
    {
      id: 'driver' as UserRole,
      title: 'Driver',
      description: 'Drive & earn',
      icon: Car,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      selectedColor: 'bg-green-100 border-green-500'
    },
    {
      id: 'partner' as UserRole,
      title: 'Partner',
      description: 'Business account',
      icon: Briefcase,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      selectedColor: 'bg-purple-100 border-purple-500'
    }
  ];

  if (currentFlow === 'signin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">Welcome to Pick Me Hop</CardTitle>
            <p className="text-muted-foreground text-sm">Sign in to your account</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>

            <div className="text-center">
              <Button variant="link" className="text-sm text-muted-foreground p-0">
                Forgot password?
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-11" 
                onClick={handleGoogleSignIn}
                disabled={oauthLoading === 'google'}
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4 text-blue-600" />
                )}
                Continue with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-11" 
                onClick={handleFacebookSignIn}
                disabled={oauthLoading === 'facebook'}
              >
                {oauthLoading === 'facebook' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Facebook className="mr-2 h-4 w-4 text-blue-700" />
                )}
                Continue with Facebook
              </Button>
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Button 
                variant="link" 
                className="text-sm p-0 h-auto font-medium"
                onClick={() => setCurrentFlow('signup')}
              >
                Sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentFlow === 'signup') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentFlow('signin')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
        
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">Create Your Account</CardTitle>
            <p className="text-muted-foreground text-sm">Choose how you'd like to get started</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-11" 
                onClick={handleGoogleSignIn}
                disabled={oauthLoading === 'google'}
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4 text-blue-600" />
                )}
                Sign up with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-11" 
                onClick={handleFacebookSignIn}
                disabled={oauthLoading === 'facebook'}
              >
                {oauthLoading === 'facebook' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Facebook className="mr-2 h-4 w-4 text-blue-700" />
                )}
                Sign up with Facebook
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <Button 
              variant="default" 
              className="w-full h-11" 
              onClick={() => setCurrentFlow('role-selection')}
            >
              <Mail className="mr-2 h-4 w-4" />
              Sign up with Email
            </Button>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Already have an account? </span>
              <Button 
                variant="link" 
                className="text-sm p-0 h-auto font-medium"
                onClick={() => setCurrentFlow('signin')}
              >
                Sign in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentFlow === 'role-selection') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentFlow('signup')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">How will you use Pick Me Hop?</CardTitle>
            <p className="text-muted-foreground text-sm">Select your account type to continue</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              {roleCards.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected ? role.selectedColor : role.color
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-6 w-6" />
                      <div>
                        <div className="font-medium">{role.title}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedRole && (
              <Button 
                className="w-full h-11" 
                onClick={() => setCurrentFlow('complete-profile')}
              >
                Continue
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentFlow === 'complete-profile') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentFlow('role-selection')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">Complete Your Profile</CardTitle>
            <p className="text-muted-foreground text-sm">
              {selectedRole === 'partner' ? 'Business information required' : 'Just a few more details'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleEmailSignUp(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {selectedRole === 'partner' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Your Company Ltd."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-sm font-medium">Business Type</Label>
                    <Input
                      id="businessType"
                      placeholder="Hotel, Travel Agency, etc."
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default Auth;