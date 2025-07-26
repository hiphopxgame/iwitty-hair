import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Star, Award, Clock, MapPin, Phone } from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import heroImage from '@/assets/hero-braiding.jpg';
import portfolioImage from '@/assets/portfolio-showcase.jpg';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/80"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Inventively Witty Hair
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
              Professional braiding artistry that celebrates your unique beauty. From classic box braids to intricate tribal patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/book">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="elegant" size="lg" className="w-full sm:w-auto">
                  View Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 lg:py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Signature Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From protective styles to creative artistic expressions, we specialize in braiding techniques that honor tradition while embracing innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Box Braids",
                description: "Classic protective style with square-shaped parts",
                price: "Starting at $180",
                duration: "4 hours",
                popular: true
              },
              {
                title: "Goddess Braids",
                description: "Larger, flowing braids with a bohemian feel",
                price: "Starting at $150",
                duration: "3 hours"
              },
              {
                title: "Knotless Braids",
                description: "Gentle braiding technique without tight knots",
                price: "Starting at $200",
                duration: "5 hours",
                popular: true
              },
              {
                title: "Cornrows",
                description: "Traditional straight-back braided style",
                price: "Starting at $80",
                duration: "2 hours"
              },
              {
                title: "Tribal Braids",
                description: "Thick, statement braids with intricate patterns",
                price: "Starting at $200",
                duration: "5 hours"
              },
              {
                title: "Passion Twists",
                description: "Bohemian twisted style with textured hair",
                price: "Starting at $170",
                duration: "4 hours"
              }
            ].map((service, index) => (
              <Card key={index} className="relative hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
                {service.popular && (
                  <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration}
                    </span>
                    <span className="text-primary font-semibold">{service.price}</span>
                  </div>
                  <Link to="/book">
                    <Button variant="outline" className="w-full">
                      Book This Style
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Artistry in Every Braid
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Explore our portfolio of stunning braided hairstyles. Each creation is a unique work of art, 
                carefully crafted to enhance your natural beauty and express your personal style.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">Satisfied Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Braiding Styles</div>
                </div>
              </div>
              <Link to="/portfolio">
                <Button variant="booking" size="lg">
                  View Full Portfolio
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src={portfolioImage} 
                alt="Hair braiding portfolio showcase" 
                className="rounded-lg shadow-elegant w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">5.0 Rating</span>
                </div>
                <p className="text-sm text-muted-foreground">Based on 150+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Visit Our Studio</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Located in the heart of Portland, our studio provides a comfortable and elegant environment 
                where you can relax while we create your perfect braided style.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>1234 Hair Street, Portland, OR 97201</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>(503) 555-HAIR</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Mon-Sat: 9AM-7PM | Sun: 10AM-5PM</span>
                </div>
              </div>
            </div>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Ready to Book?</h3>
              <p className="text-muted-foreground mb-6">
                Schedule your appointment today and let us create a beautiful braided style that's uniquely you.
              </p>
              <Link to="/book">
                <Button variant="hero" size="lg" className="w-full">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Appointment
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Inventively Witty Hair</h3>
          <p className="text-background/80 mb-6">Professional braiding artistry in Portland, Oregon</p>
          <div className="flex justify-center space-x-6">
            <Link to="/portfolio" className="hover:text-primary transition-colors">Portfolio</Link>
            <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
            <Link to="/book" className="hover:text-primary transition-colors">Book Now</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          </div>
          <div className="mt-8 pt-8 border-t border-background/20 text-background/60">
            <p>&copy; 2024 Inventively Witty Hair. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
};

export default Index;
