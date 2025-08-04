import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { ProgressIndicator } from "@/components/forms/ProgressIndicator";
import { FileUpload } from "@/components/forms/FileUpload";

const stepTitles = ["Company Info", "Services", "Documents", "Preferences"];

const step1Schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPersonName: z.string().min(2, "Contact person name is required"),
  businessEmail: z.string().email("Please enter a valid business email"),
  businessPhone: z.string().min(10, "Please enter a valid phone number"),
  registrationNumber: z.string().min(3, "Registration number is required"),
  vatNumber: z.string().optional(),
  businessAddress: z.string().min(5, "Business address is required"),
  websiteUrl: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const PartnerSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<File[]>([]);
  const [businessRegistration, setBusinessRegistration] = useState<File[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async () => {
    const isValid = await step1Form.trigger();
    if (!isValid) return;

    setLoading(true);
    try {
      const formData = step1Form.getValues();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.businessEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            first_name: formData.contactPersonName.split(' ')[0],
            last_name: formData.contactPersonName.split(' ').slice(1).join(' '),
            company_name: formData.companyName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create profile
      await supabase.from('profiles').insert({
        id: authData.user.id,
        first_name: formData.contactPersonName.split(' ')[0],
        last_name: formData.contactPersonName.split(' ').slice(1).join(' '),
        phone: formData.businessPhone,
      });

      // Assign partner role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'partner'
      });

      // Create partner profile
      await supabase.from('partners').insert({
        user_id: authData.user.id,
        company_name: formData.companyName,
        partnership_type: 'business',
        is_active: false,
      });

      toast({
        title: "Application submitted successfully!",
        description: "Your partner application is under review. Check your email to verify your account.",
      });

      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/signup")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Role Selection
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              Partner Application
            </CardTitle>
            <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={4} 
              stepTitles={stepTitles} 
            />
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Company Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    {...step1Form.register("companyName")}
                    placeholder="Your company name"
                  />
                  {step1Form.formState.errors.companyName && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                  <Input
                    id="contactPersonName"
                    {...step1Form.register("contactPersonName")}
                    placeholder="Full name"
                  />
                  {step1Form.formState.errors.contactPersonName && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.contactPersonName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    {...step1Form.register("businessEmail")}
                    placeholder="company@example.com"
                  />
                  {step1Form.formState.errors.businessEmail && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.businessEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone *</Label>
                  <Input
                    id="businessPhone"
                    {...step1Form.register("businessPhone")}
                    placeholder="+1 (555) 123-4567"
                  />
                  {step1Form.formState.errors.businessPhone && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.businessPhone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Textarea
                  id="businessAddress"
                  {...step1Form.register("businessAddress")}
                  placeholder="Full business address"
                  rows={3}
                />
                {step1Form.formState.errors.businessAddress && (
                  <p className="text-sm text-destructive">{step1Form.formState.errors.businessAddress.message}</p>
                )}
              </div>

              <FileUpload
                label="Company Logo (Optional)"
                accept="image/*"
                onFilesChange={setCompanyLogo}
                value={companyLogo}
                description="Upload your company logo"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...step1Form.register("password")}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {step1Form.formState.errors.password && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...step1Form.register("confirmPassword")}
                    placeholder="Confirm your password"
                  />
                  {step1Form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <FileUpload
                label="Business Registration Certificate"
                accept=".pdf,.jpg,.jpeg,.png"
                onFilesChange={setBusinessRegistration}
                value={businessRegistration}
                required={true}
                description="Upload your business registration document"
              />
            </div>

            <div className="flex justify-between pt-6">
              <Button onClick={handleSubmit} disabled={loading} className="ml-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerSignup;