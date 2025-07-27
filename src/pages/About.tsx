import { AuthProvider } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Our Artistry
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            With over a decade of experience in traditional and contemporary braiding techniques, 
            we transform hair into beautiful works of art that celebrate culture and individual style.
          </p>
        </section>

        {/* Our Story Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Founded with a passion for preserving and innovating traditional braiding techniques, 
              our studio has become a sanctuary where artistry meets heritage. We specialize in 
              creating protective styles that not only look stunning but also promote healthy hair growth.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Every braid tells a story, and we're honored to be part of your journey. From classic 
              cornrows to intricate Senegalese twists, we bring precision, creativity, and care to 
              every appointment.
            </p>
            <Button onClick={() => navigate('/book')} size="lg">
              Book Your Appointment
            </Button>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80" 
              alt="Professional braiding workspace" 
              className="rounded-lg shadow-lg w-full h-[400px] object-cover"
            />
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Our Achievements</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">500+</h3>
                <p className="text-muted-foreground">Happy Clients</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">10+</h3>
                <p className="text-muted-foreground">Years Experience</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">15+</h3>
                <p className="text-muted-foreground">Braiding Styles</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">4.9</h3>
                <p className="text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Specialties Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Our Specialties</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">Protective Styling</h3>
                <p className="text-muted-foreground mb-4">
                  Expertly crafted protective styles that promote hair health while maintaining 
                  stunning aesthetics for weeks at a time.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Box Braids</Badge>
                  <Badge variant="secondary">Cornrows</Badge>
                  <Badge variant="secondary">Twists</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">Traditional Techniques</h3>
                <p className="text-muted-foreground mb-4">
                  Honoring ancestral braiding methods passed down through generations, 
                  preserving cultural heritage in every style.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">African Braids</Badge>
                  <Badge variant="secondary">Fulani Braids</Badge>
                  <Badge variant="secondary">Ghana Braids</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">Modern Fusion</h3>
                <p className="text-muted-foreground mb-4">
                  Contemporary styles that blend traditional techniques with modern aesthetics 
                  for today's fashion-forward clients.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Ombre Braids</Badge>
                  <Badge variant="secondary">Colored Twists</Badge>
                  <Badge variant="secondary">Creative Patterns</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-card rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Experience Our Artistry?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book your appointment today and let us create a beautiful, protective style 
            that celebrates your unique beauty and heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/book')} size="lg">
              Book Appointment
            </Button>
            <Button onClick={() => navigate('/portfolio')} variant="outline" size="lg">
              View Portfolio
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

const About = () => (
  <AuthProvider>
    <AboutPage />
  </AuthProvider>
);

export default About;