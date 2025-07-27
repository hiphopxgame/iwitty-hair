import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Filter, Search, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PortfolioImage {
  id: string;
  title: string;
  image_url: string;
  client_name?: string;
  completion_date?: string;
  description?: string;
  is_featured: boolean;
  style_name?: string;
}

interface HairStyle {
  id: string;
  name: string;
}

const PortfolioPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [styles, setStyles] = useState<HairStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      // Fetch hair styles
      const { data: stylesData } = await supabase
        .from('hair_styles')
        .select('id, name')
        .order('name');

      if (stylesData) {
        setStyles(stylesData);
      }

      // Fetch portfolio images with style names
      const { data: imagesData } = await supabase
        .from('portfolio_images')
        .select(`
          *,
          hair_styles (
            name
          )
        `)
        .order('is_featured', { ascending: false })
        .order('completion_date', { ascending: false });

      if (imagesData) {
        const formattedImages = imagesData.map(img => ({
          ...img,
          style_name: img.hair_styles?.name || 'Other'
        }));
        setImages(formattedImages);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.style_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStyle = selectedStyle === 'all' || image.style_name === selectedStyle;
    
    const imageYear = image.completion_date ? new Date(image.completion_date).getFullYear().toString() : null;
    const matchesYear = selectedYear === 'all' || imageYear === selectedYear;
    
    return matchesSearch && matchesStyle && matchesYear;
  });

  const availableYears = [...new Set(
    images
      .filter(img => img.completion_date)
      .map(img => new Date(img.completion_date!).getFullYear())
      .sort((a, b) => b - a)
  )];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-64 rounded-lg"></div>
                <div className="mt-4 space-y-2">
                  <div className="bg-muted h-4 rounded w-3/4"></div>
                  <div className="bg-muted h-3 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 to-accent/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Portfolio
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our collection of stunning braided hairstyles. Each creation showcases our commitment to artistry, 
            tradition, and innovation in hair braiding.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Filter by:</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search styles, clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Style Filter */}
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Styles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  {styles.map(style => (
                    <SelectItem key={style.id} value={style.name}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Filter */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                No images found matching your filters.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStyle('all');
                  setSelectedYear('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-muted-foreground">
                  Showing {filteredImages.length} of {images.length} styles
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <Card key={image.id} className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative overflow-hidden">
                      <img 
                        src={image.image_url} 
                        alt={image.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      {image.is_featured && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{image.title}</h3>
                      {image.style_name && (
                        <p className="text-primary text-sm font-medium mb-1">{image.style_name}</p>
                      )}
                      {image.client_name && (
                        <p className="text-muted-foreground text-sm mb-1">Client: {image.client_name}</p>
                      )}
                      {image.completion_date && (
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(image.completion_date).toLocaleDateString()}
                        </div>
                      )}
                      {image.description && (
                        <p className="text-muted-foreground text-sm mt-2">{image.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready for Your Own Stunning Style?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book your appointment today and let us create a beautiful braided style that's uniquely you.
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate('/book-appointment')}>
            <Calendar className="w-5 h-5 mr-2" />
            Book Your Appointment
          </Button>
        </div>
      </section>
    </div>
  );
};

const Portfolio = () => {
  return (
    <AuthProvider>
      <PortfolioPage />
    </AuthProvider>
  );
};

export default Portfolio;