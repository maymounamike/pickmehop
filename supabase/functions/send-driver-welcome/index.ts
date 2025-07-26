import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DriverWelcomeEmailRequest {
  email: string;
  temporaryPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, temporaryPassword }: DriverWelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Driver Portal <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the Driver Portal - Complete Your Profile",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to Our Driver Network!</h1>
          
          <p>Hi there!</p>
          
          <p>Your driver account has been created by our admin team. To get started, please complete your profile setup.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">Important: Complete Your Profile</h3>
            <p style="margin-bottom: 0; color: #92400e;">Please log in and complete the following information:</p>
            <ul style="color: #92400e;">
              <li>First and Last Name</li>
              <li>Phone Number</li>
              <li>Vehicle Make and Model</li>
              <li>Vehicle Year and License Plate</li>
              <li>Driver License Number</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get("SITE_URL") || "http://localhost:3000"}/auth" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login to Complete Profile
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <h3 style="color: #374151;">Next Steps:</h3>
            <ol style="color: #6b7280;">
              <li>Click the login button above</li>
              <li>Sign in with your email and temporary password</li>
              <li>Complete your profile information</li>
              <li>Wait for admin approval to start receiving ride assignments</li>
            </ol>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The Driver Management Team
          </p>
        </div>
      `,
    });

    console.log("Driver welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-driver-welcome function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);