import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Clock, DollarSign, Calendar } from 'lucide-react';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await supabase
        .from('hair_styles')
        .select('*')
        .order('name');

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <p>Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our range of professional braiding services, each crafted with care and expertise.
          </p>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No services available at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <Card key={service.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {service.description && (
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    {service.base_price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">${service.base_price}</span>
                      </div>
                    )}
                    {service.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration_hours}h</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-full" onClick={() => navigate('/book')}>
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10 mt-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Book Your Service?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Schedule your appointment today and let us create a beautiful braided style that's uniquely you.
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate('/book')}>
              <Calendar className="w-5 h-5 mr-2" />
              Book Your Appointment
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Services;