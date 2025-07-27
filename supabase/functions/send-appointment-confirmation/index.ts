import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { formatInTimeZone } from "npm:date-fns-tz@3.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppointmentEmailRequest {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  styleName: string;
  appointmentDate: string;
  appointmentTime: string;
  specialRequests?: string;
  estimatedDuration: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      appointmentId,
      clientName,
      clientEmail,
      clientPhone,
      styleName,
      appointmentDate,
      appointmentTime,
      specialRequests,
      estimatedDuration,
    }: AppointmentEmailRequest = await req.json();

    // Format date and time for display in Eastern Time
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    
    const formattedDate = formatInTimeZone(
      appointmentDateTime,
      'America/New_York',
      'EEEE, MMMM do, yyyy'
    );

    const formattedTime = formatInTimeZone(
      appointmentDateTime,
      'America/New_York',
      'h:mm a zzz'
    );

    const emailResponse = await resend.emails.send({
      from: "Braiding Studio <onboarding@resend.dev>",
      to: [clientEmail],
      subject: "Appointment Request Confirmed - We'll Contact You Soon!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Appointment Request Received!</h1>
            <p style="color: #666; font-size: 16px;">Thank you for choosing our braiding studio</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Appointment Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Appointment ID:</td>
                <td style="padding: 8px 0; color: #666;">${appointmentId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Client Name:</td>
                <td style="padding: 8px 0; color: #666;">${clientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td>
                <td style="padding: 8px 0; color: #666;">${clientPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
                <td style="padding: 8px 0; color: #666;">${clientEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Style:</td>
                <td style="padding: 8px 0; color: #666;">${styleName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Requested Date:</td>
                <td style="padding: 8px 0; color: #666;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Requested Time:</td>
                <td style="padding: 8px 0; color: #666;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Estimated Duration:</td>
                <td style="padding: 8px 0; color: #666;">${estimatedDuration} hours</td>
              </tr>
              ${specialRequests ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Special Requests:</td>
                <td style="padding: 8px 0; color: #666;">${specialRequests}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1976d2; margin-top: 0;">What Happens Next?</h3>
            <ol style="color: #333; line-height: 1.6;">
              <li><strong>Quote & Confirmation Call:</strong> We'll call you within 24 hours to provide a personalized price quote based on your hair type and desired style.</li>
              <li><strong>Time Confirmation:</strong> During our call, we'll confirm the exact appointment time that works best for both of us.</li>
              <li><strong>Final Confirmation:</strong> Once everything is confirmed, you'll receive another email with the final appointment details and any preparation instructions.</li>
            </ol>
          </div>

          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #e65100;"><strong>Please Note:</strong> Your appointment is currently <strong>pending confirmation</strong>. The final price and exact time will be confirmed during our phone call.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin-bottom: 5px;">Questions? Contact us:</p>
            <p style="color: #333; font-weight: bold;">📞 Phone: (503) 555-0123</p>
            <p style="color: #333; font-weight: bold;">📧 Email: info@braidingstudio.com</p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Thank you for choosing our professional braiding services!</p>
          </div>
        </div>
      `,
    });

    console.log("Appointment confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-confirmation function:", error);
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