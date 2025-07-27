import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';

interface AppointmentDetails {
  id: string;
  appointment_date: string;
  appointment_time: string;
  style_name: string;
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  client_email: string;
  special_requests: string;
  estimated_duration: number;
}

const AppointmentConfirmationPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const appointmentId = searchParams.get('id');

  useEffect(() => {
    if (!appointmentId) {
      navigate('/');
      return;
    }

    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          special_requests,
          estimated_duration,
          hair_styles (name),
          braiding_profiles (first_name, last_name, phone)
        `)
        .eq('id', appointmentId)
        .single();

      if (appointmentError) throw appointmentError;

      if (appointmentData) {
        setAppointment({
          id: appointmentData.id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          style_name: appointmentData.hair_styles?.name || 'Custom Style',
          client_first_name: appointmentData.braiding_profiles?.first_name || '',
          client_last_name: appointmentData.braiding_profiles?.last_name || '',
          client_phone: appointmentData.braiding_profiles?.phone || '',
          client_email: user?.email || '',
          special_requests: appointmentData.special_requests || '',
          estimated_duration: appointmentData.estimated_duration || 3,
        });
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p>Loading appointment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p>Appointment not found.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 to-accent/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Appointment Confirmed!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Thank you for booking with us. We've received your appointment request and will contact you soon.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-muted-foreground">{formatDate(appointment.appointment_date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Time</p>
                    <p className="text-muted-foreground">{formatTime(appointment.appointment_time)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{appointment.style_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Estimated Duration: {appointment.estimated_duration} hours
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Name</p>
                    <p className="text-muted-foreground">
                      {appointment.client_first_name} {appointment.client_last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">{appointment.client_phone}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">{appointment.client_email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          {appointment.special_requests && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Special Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{appointment.special_requests}</p>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Confirmation</h3>
                    <p className="text-muted-foreground">
                      You'll receive an email confirmation with all appointment details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Price Quote & Confirmation Call</h3>
                    <p className="text-muted-foreground">
                      We'll call you within 24 hours with a personalized price quote and to confirm your appointment time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Final Confirmation</h3>
                    <p className="text-muted-foreground">
                      Once everything is confirmed, you'll receive a final email with complete appointment details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Button onClick={() => navigate('/dashboard')} variant="hero" size="lg">
              Go to Dashboard
            </Button>
            <div>
              <Button onClick={() => navigate('/')} variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppointmentConfirmation = () => {
  return (
    <AuthProvider>
      <AppointmentConfirmationPage />
    </AuthProvider>
  );
};

export default AppointmentConfirmation;