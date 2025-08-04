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
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff, Calendar } from "lucide-react";
import { ProgressIndicator } from "@/components/forms/ProgressIndicator";
import { FileUpload } from "@/components/forms/FileUpload";

const stepTitles = ["Basic Info", "Personal", "License", "Vehicle", "Additional"];

// Form schemas for each step
const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  privacyAccepted: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  languagesSpoken: z.array(z.string()).min(1, "Please select at least one language"),
  drivingExperience: z.string().min(1, "Driving experience is required"),
  motivation: z.string().min(10, "Please tell us why you want to drive with us"),
});

const step3Schema = z.object({
  licenseNumber: z.string().min(5, "License number is required"),
  licenseExpiry: z.string().min(1, "License expiry date is required"),
  backgroundCheckConsent: z.boolean().refine(val => val === true, "Background check consent is required"),
  professionalExperience: z.string(),
});

const step4Schema = z.object({
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleYear: z.number().min(2000, "Vehicle must be 2000 or newer"),
  licensePlate: z.string().min(3, "License plate is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  passengerSeats: z.number().min(1, "Number of passenger seats is required"),
});

const step5Schema = z.object({
  bankAccount: z.string().min(10, "Bank account details are required"),
  availability: z.array(z.string()).min(1, "Please select your availability"),
  specialAccommodations: z.array(z.string()),
  additionalNotes: z.string(),
  marketingConsent: z.boolean(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type Step5Data = z.infer<typeof step5Schema>;

const DriverSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File[]>([]);
  const [licensePhotos, setLicensePhotos] = useState<File[]>([]);
  const [vehicleRegistration, setVehicleRegistration] = useState<File[]>([]);
  const [vehicleInsurance, setVehicleInsurance] = useState<File[]>([]);
  const [vehiclePhotos, setVehiclePhotos] = useState<File[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Form instances for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      termsAccepted: false,
      privacyAccepted: false,
    }
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      languagesSpoken: [],
    }
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      backgroundCheckConsent: false,
    }
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
  });

  const step5Form = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      availability: [],
      specialAccommodations: [],
      marketingConsent: false,
    }
  });

  // Check for existing user session
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const nextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await step1Form.trigger();
        break;
      case 2:
        isValid = await step2Form.trigger();
        break;
      case 3:
        isValid = await step3Form.trigger();
        if (isValid && licensePhotos.length === 0) {
          toast({
            title: "License photos required",
            description: "Please upload photos of your driver's license",
            variant: "destructive",
          });
          isValid = false;
        }
        break;
      case 4:
        isValid = await step4Form.trigger();
        if (isValid && (vehicleRegistration.length === 0 || vehicleInsurance.length === 0)) {
          toast({
            title: "Vehicle documents required",
            description: "Please upload vehicle registration and insurance documents",
            variant: "destructive",
          });
          isValid = false;
        }
        break;
      case 5:
        isValid = await step5Form.trigger();
        break;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const isValid = await step5Form.trigger();
    if (!isValid) return;

    setLoading(true);
    try {
      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();
      const step3Data = step3Form.getValues();
      const step4Data = step4Form.getValues();
      const step5Data = step5Form.getValues();

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            first_name: step1Data.firstName,
            last_name: step1Data.lastName,
            phone: step1Data.phone,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: step1Data.firstName,
          last_name: step1Data.lastName,
          phone: step1Data.phone,
        });

      if (profileError) throw profileError;

      // Assign driver role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'driver'
        });

      if (roleError) throw roleError;

      // Create driver profile
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: authData.user.id,
          vehicle_make: step4Data.vehicleMake,
          vehicle_model: step4Data.vehicleModel,
          vehicle_year: step4Data.vehicleYear,
          vehicle_license_plate: step4Data.licensePlate,
          license_number: step3Data.licenseNumber,
          phone: step1Data.phone,
          is_active: false, // Requires admin approval
        });

      if (driverError) throw driverError;

      toast({
        title: "Application submitted successfully!",
        description: "Your driver application is now under review. Check your email to verify your account.",
      });

      navigate("/auth");
    } catch (error: any) {
      console.error('Driver signup error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const languageOptions = [
    "English", "French", "Spanish", "German", "Italian", "Portuguese", "Arabic", "Other"
  ];

  const availabilityOptions = [
    "Monday-Friday (9AM-5PM)", "Evenings (6PM-11PM)", "Weekends", "Night shifts (11PM-6AM)", "Flexible/Anytime"
  ];

  const accommodationOptions = [
    "Wheelchair accessible", "Child seats available", "Pet-friendly", "Non-smoking only", "Quiet rides"
  ];

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
              Driver Application
            </CardTitle>
            <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={5} 
              stepTitles={stepTitles} 
            />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...step1Form.register("firstName")}
                      placeholder="Enter your first name"
                    />
                    {step1Form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{step1Form.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...step1Form.register("lastName")}
                      placeholder="Enter your last name"
                    />
                    {step1Form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{step1Form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...step1Form.register("email")}
                    placeholder="Enter your email address"
                  />
                  {step1Form.formState.errors.email && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...step1Form.register("phone")}
                      placeholder="+1 (555) 123-4567"
                    />
                    {step1Form.formState.errors.phone && (
                      <p className="text-sm text-destructive">{step1Form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...step1Form.register("dateOfBirth")}
                    />
                    {step1Form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-destructive">{step1Form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>

                <FileUpload
                  label="Profile Photo (Optional)"
                  accept="image/*"
                  onFilesChange={setProfilePhoto}
                  value={profilePhoto}
                  description="Upload a clear photo of yourself"
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
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        {...step1Form.register("confirmPassword")}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {step1Form.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{step1Form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="termsAccepted"
                      checked={step1Form.watch("termsAccepted")}
                      onCheckedChange={(checked) => step1Form.setValue("termsAccepted", checked as boolean)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor="termsAccepted"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the Terms and Conditions *
                      </Label>
                    </div>
                  </div>
                  {step1Form.formState.errors.termsAccepted && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.termsAccepted.message}</p>
                  )}

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacyAccepted"
                      checked={step1Form.watch("privacyAccepted")}
                      onCheckedChange={(checked) => step1Form.setValue("privacyAccepted", checked as boolean)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor="privacyAccepted"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the Privacy Policy *
                      </Label>
                    </div>
                  </div>
                  {step1Form.formState.errors.privacyAccepted && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.privacyAccepted.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Personal Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      {...step2Form.register("address")}
                      placeholder="Street address"
                    />
                    {step2Form.formState.errors.address && (
                      <p className="text-sm text-destructive">{step2Form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...step2Form.register("city")}
                      placeholder="City"
                    />
                    {step2Form.formState.errors.city && (
                      <p className="text-sm text-destructive">{step2Form.formState.errors.city.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    {...step2Form.register("postalCode")}
                    placeholder="Postal code"
                    className="max-w-xs"
                  />
                  {step2Form.formState.errors.postalCode && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.postalCode.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContactName"
                      {...step2Form.register("emergencyContactName")}
                      placeholder="Full name"
                    />
                    {step2Form.formState.errors.emergencyContactName && (
                      <p className="text-sm text-destructive">{step2Form.formState.errors.emergencyContactName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyContactPhone"
                      {...step2Form.register("emergencyContactPhone")}
                      placeholder="Phone number"
                    />
                    {step2Form.formState.errors.emergencyContactPhone && (
                      <p className="text-sm text-destructive">{step2Form.formState.errors.emergencyContactPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {languageOptions.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={language}
                          checked={step2Form.watch("languagesSpoken").includes(language)}
                          onCheckedChange={(checked) => {
                            const currentLanguages = step2Form.getValues("languagesSpoken");
                            if (checked) {
                              step2Form.setValue("languagesSpoken", [...currentLanguages, language]);
                            } else {
                              step2Form.setValue("languagesSpoken", currentLanguages.filter(l => l !== language));
                            }
                          }}
                        />
                        <Label htmlFor={language} className="text-sm">{language}</Label>
                      </div>
                    ))}
                  </div>
                  {step2Form.formState.errors.languagesSpoken && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.languagesSpoken.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drivingExperience">Years of Driving Experience *</Label>
                  <Select value={step2Form.watch("drivingExperience")} onValueChange={(value) => step2Form.setValue("drivingExperience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  {step2Form.formState.errors.drivingExperience && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.drivingExperience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to drive with Pick Me Hop? *</Label>
                  <Textarea
                    id="motivation"
                    {...step2Form.register("motivation")}
                    placeholder="Tell us about your motivation..."
                    rows={4}
                  />
                  {step2Form.formState.errors.motivation && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.motivation.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: License & Documentation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">License & Documentation</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Driver's License Number *</Label>
                    <Input
                      id="licenseNumber"
                      {...step3Form.register("licenseNumber")}
                      placeholder="License number"
                    />
                    {step3Form.formState.errors.licenseNumber && (
                      <p className="text-sm text-destructive">{step3Form.formState.errors.licenseNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiry">License Expiry Date *</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      {...step3Form.register("licenseExpiry")}
                    />
                    {step3Form.formState.errors.licenseExpiry && (
                      <p className="text-sm text-destructive">{step3Form.formState.errors.licenseExpiry.message}</p>
                    )}
                  </div>
                </div>

                <FileUpload
                  label="Driver's License Photos"
                  accept="image/*"
                  multiple={true}
                  onFilesChange={setLicensePhotos}
                  value={licensePhotos}
                  required={true}
                  description="Upload clear photos of both front and back of your driver's license"
                />

                <div className="space-y-2">
                  <Label htmlFor="professionalExperience">Professional Driving Experience</Label>
                  <Textarea
                    id="professionalExperience"
                    {...step3Form.register("professionalExperience")}
                    placeholder="Describe any taxi, rideshare, or commercial driving experience..."
                    rows={3}
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="backgroundCheckConsent"
                    checked={step3Form.watch("backgroundCheckConsent")}
                    onCheckedChange={(checked) => step3Form.setValue("backgroundCheckConsent", checked as boolean)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="backgroundCheckConsent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I consent to a background check *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      This helps us ensure the safety of all passengers and drivers
                    </p>
                  </div>
                </div>
                {step3Form.formState.errors.backgroundCheckConsent && (
                  <p className="text-sm text-destructive">{step3Form.formState.errors.backgroundCheckConsent.message}</p>
                )}
              </div>
            )}

            {/* Step 4: Vehicle Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Vehicle Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Vehicle Make *</Label>
                    <Select value={step4Form.watch("vehicleMake")} onValueChange={(value) => step4Form.setValue("vehicleMake", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toyota">Toyota</SelectItem>
                        <SelectItem value="Honda">Honda</SelectItem>
                        <SelectItem value="Ford">Ford</SelectItem>
                        <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                        <SelectItem value="Nissan">Nissan</SelectItem>
                        <SelectItem value="Hyundai">Hyundai</SelectItem>
                        <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                        <SelectItem value="BMW">BMW</SelectItem>
                        <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                        <SelectItem value="Audi">Audi</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {step4Form.formState.errors.vehicleMake && (
                      <p className="text-sm text-destructive">{step4Form.formState.errors.vehicleMake.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Vehicle Model *</Label>
                    <Input
                      id="vehicleModel"
                      {...step4Form.register("vehicleModel")}
                      placeholder="e.g., Camry, Civic, etc."
                    />
                    {step4Form.formState.errors.vehicleModel && (
                      <p className="text-sm text-destructive">{step4Form.formState.errors.vehicleModel.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleYear">Vehicle Year *</Label>
                    <Input
                      id="vehicleYear"
                      type="number"
                      {...step4Form.register("vehicleYear", { valueAsNumber: true })}
                      placeholder="2020"
                      min={2000}
                      max={new Date().getFullYear() + 1}
                    />
                    {step4Form.formState.errors.vehicleYear && (
                      <p className="text-sm text-destructive">{step4Form.formState.errors.vehicleYear.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">License Plate *</Label>
                    <Input
                      id="licensePlate"
                      {...step4Form.register("licensePlate")}
                      placeholder="ABC-1234"
                    />
                    {step4Form.formState.errors.licensePlate && (
                      <p className="text-sm text-destructive">{step4Form.formState.errors.licensePlate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleColor">Vehicle Color *</Label>
                    <Input
                      id="vehicleColor"
                      {...step4Form.register("vehicleColor")}
                      placeholder="White, Black, etc."
                    />
                    {step4Form.formState.errors.vehicleColor && (
                      <p className="text-sm text-destructive">{step4Form.formState.errors.vehicleColor.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengerSeats">Number of Passenger Seats *</Label>
                  <Select value={step4Form.watch("passengerSeats")?.toString()} onValueChange={(value) => step4Form.setValue("passengerSeats", parseInt(value))}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Select seats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 seat</SelectItem>
                      <SelectItem value="2">2 seats</SelectItem>
                      <SelectItem value="3">3 seats</SelectItem>
                      <SelectItem value="4">4 seats</SelectItem>
                      <SelectItem value="5">5 seats</SelectItem>
                      <SelectItem value="6">6 seats</SelectItem>
                      <SelectItem value="7">7 seats</SelectItem>
                      <SelectItem value="8">8+ seats</SelectItem>
                    </SelectContent>
                  </Select>
                  {step4Form.formState.errors.passengerSeats && (
                    <p className="text-sm text-destructive">{step4Form.formState.errors.passengerSeats.message}</p>
                  )}
                </div>

                <FileUpload
                  label="Vehicle Registration Document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFilesChange={setVehicleRegistration}
                  value={vehicleRegistration}
                  required={true}
                  description="Upload your vehicle registration document"
                />

                <FileUpload
                  label="Vehicle Insurance Document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFilesChange={setVehicleInsurance}
                  value={vehicleInsurance}
                  required={true}
                  description="Upload your current vehicle insurance document"
                />

                <FileUpload
                  label="Vehicle Photos"
                  accept="image/*"
                  multiple={true}
                  onFilesChange={setVehiclePhotos}
                  value={vehiclePhotos}
                  description="Upload photos of your vehicle (exterior front, back, interior)"
                />
              </div>
            )}

            {/* Step 5: Additional Information */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Bank Account Details for Payments *</Label>
                  <Input
                    id="bankAccount"
                    {...step5Form.register("bankAccount")}
                    placeholder="IBAN or Account Number"
                  />
                  {step5Form.formState.errors.bankAccount && (
                    <p className="text-sm text-destructive">{step5Form.formState.errors.bankAccount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Availability Preferences *</Label>
                  <div className="space-y-2">
                    {availabilityOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={step5Form.watch("availability").includes(option)}
                          onCheckedChange={(checked) => {
                            const currentAvailability = step5Form.getValues("availability");
                            if (checked) {
                              step5Form.setValue("availability", [...currentAvailability, option]);
                            } else {
                              step5Form.setValue("availability", currentAvailability.filter(a => a !== option));
                            }
                          }}
                        />
                        <Label htmlFor={option} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                  {step5Form.formState.errors.availability && (
                    <p className="text-sm text-destructive">{step5Form.formState.errors.availability.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Special Accommodations Offered</Label>
                  <div className="space-y-2">
                    {accommodationOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={step5Form.watch("specialAccommodations").includes(option)}
                          onCheckedChange={(checked) => {
                            const currentAccommodations = step5Form.getValues("specialAccommodations");
                            if (checked) {
                              step5Form.setValue("specialAccommodations", [...currentAccommodations, option]);
                            } else {
                              step5Form.setValue("specialAccommodations", currentAccommodations.filter(a => a !== option));
                            }
                          }}
                        />
                        <Label htmlFor={option} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    {...step5Form.register("additionalNotes")}
                    placeholder="Any additional information you'd like to share..."
                    rows={3}
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketingConsent"
                    checked={step5Form.watch("marketingConsent")}
                    onCheckedChange={(checked) => step5Form.setValue("marketingConsent", checked as boolean)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="marketingConsent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I consent to receive marketing communications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      You can unsubscribe at any time
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                {currentStep < 5 ? (
                  <Button onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Application
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverSignup;