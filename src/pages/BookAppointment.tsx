import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, User, Phone, MapPin, MessageSquare } from 'lucide-react';

interface HairStyle {
  id: string;
  name: string;
  description: string;
  base_price: number;
  duration_hours: number;
}

const BookAppointmentPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [styles, setStyles] = useState<HairStyle[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<HairStyle | null>(null);

  useEffect(() => {
    fetchHairStyles();
  }, []);

  const fetchHairStyles = async () => {
    try {
      const { data, error } = await supabase
        .from('hair_styles')
        .select('*')
        .eq('project_id', 'iwitty-hair')
        .order('name');

      if (error) throw error;
      if (data) setStyles(data);
    } catch (error) {
      console.error('Error fetching hair styles:', error);
      toast({
        title: "Error",
        description: "Failed to load hair styles",
        variant: "destructive",
      });
    }
  };

  const handleStyleChange = (styleId: string) => {
    const style = styles.find(s => s.id === styleId);
    setSelectedStyle(style || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book an appointment",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      // First ensure user profile exists and update contact info
      const { error: profileError } = await supabase
        .from('braiding_profiles')
        .upsert({
          user_id: user.id,
          first_name: formData.get('firstName') as string,
          last_name: formData.get('lastName') as string,
          phone: formData.get('phone') as string,
          project_id: 'iwitty-hair',
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Continue anyway, as profile might already exist
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          style_id: selectedStyle?.id || null,
          appointment_date: formData.get('date') as string,
          appointment_time: formData.get('time') as string,
          special_requests: formData.get('requests') as string || null,
          estimated_duration: selectedStyle?.duration_hours || 3,
        })
        .select();

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-appointment-confirmation', {
          body: {
            appointmentId: data[0].id,
            clientName: `${formData.get('firstName')} ${formData.get('lastName')}`,
            clientEmail: user.email,
            clientPhone: formData.get('phone') as string,
            styleName: selectedStyle?.name || 'Custom Style',
            appointmentDate: formData.get('date') as string,
            appointmentTime: formData.get('time') as string,
            specialRequests: formData.get('requests') as string || null,
            estimatedDuration: selectedStyle?.duration_hours || 3,
          },
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Continue anyway - appointment was created successfully
      }

      toast({
        title: "Appointment requested!",
        description: "Check your email for confirmation details.",
      });

      navigate(`/appointment-confirmation?id=${data[0].id}`);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 to-accent/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Book Your Appointment
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your look? Schedule your braiding session with our professional stylists.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Style Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Choose Your Style
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="style">Hair Style</Label>
                    <Select onValueChange={handleStyleChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a braiding style" />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStyle && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">{selectedStyle.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{selectedStyle.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-primary" />
                          <span>Starting at ${selectedStyle.base_price}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-primary" />
                          <span>{selectedStyle.duration_hours} hours</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="date">Preferred Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Preferred Time</Label>
                    <Select name="time" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                          <SelectItem key={time} value={time}>
                            {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Studio Hours:</strong><br />
                      Monday - Saturday: 9:00 AM - 7:00 PM<br />
                      Sunday: 10:00 AM - 5:00 PM
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="Enter your phone number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Special Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="requests">Additional Information</Label>
                  <Textarea
                    id="requests"
                    name="requests"
                    placeholder="Tell us about any specific requirements, hair length, texture, or special requests..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Submit Request</h3>
                    <p className="text-sm text-muted-foreground">Fill out the form and submit your appointment request</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Get Quote</h3>
                    <p className="text-sm text-muted-foreground">We'll contact you with a personalized price quote</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Confirmation</h3>
                    <p className="text-sm text-muted-foreground">Receive email confirmation with all appointment details</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              {!user ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">You need to sign in to book an appointment</p>
                  <Button variant="hero" size="lg" onClick={() => navigate('/auth')}>
                    Sign In to Book
                  </Button>
                </div>
              ) : (
                <Button type="submit" variant="hero" size="lg" disabled={loading || !selectedStyle}>
                  {loading ? "Submitting Request..." : "Request Appointment"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BookAppointment = () => {
  return (
    <AuthProvider>
      <BookAppointmentPage />
    </AuthProvider>
  );
};

export default BookAppointment;