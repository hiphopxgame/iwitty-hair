import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, Check, AlertCircle } from 'lucide-react';

export const FixPortfolioImages = () => {
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);

  const fixPortfolioImages = async () => {
    setFixing(true);
    
    try {
      // Get all portfolio images with /src/assets/ URLs
      const { data: images } = await supabase
        .from('portfolio_images')
        .select('id, title, image_url')
        .like('image_url', '/src/assets/%');

      if (!images || images.length === 0) {
        toast({ title: "No images need fixing" });
        setFixed(true);
        return;
      }

      const imageMapping = {
        '/src/assets/box-braids-young.jpg': 'box-braids-young.jpg',
        '/src/assets/cornrows-mature.jpg': 'cornrows-mature.jpg', 
        '/src/assets/senegalese-twists.jpg': 'senegalese-twists.jpg',
        '/src/assets/french-braids.jpg': 'french-braids.jpg'
      };

      for (const image of images) {
        const newFileName = imageMapping[image.image_url];
        if (newFileName) {
          // Generate a proper Supabase storage URL
          const { data: { publicUrl } } = supabase.storage
            .from('portfolio')
            .getPublicUrl(newFileName);

          // Update the database record
          await supabase
            .from('portfolio_images')
            .update({ image_url: publicUrl })
            .eq('id', image.id);

          console.log(`Fixed ${image.title}: ${image.image_url} -> ${publicUrl}`);
        }
      }

      toast({ title: "Portfolio images fixed successfully!" });
      setFixed(true);
    } catch (error) {
      console.error('Error fixing images:', error);
      toast({ 
        title: "Error fixing images", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setFixing(false);
    }
  };

  if (fixed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center p-4">
          <Check className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">Portfolio images have been fixed!</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          Fix Portfolio Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700">
          Your portfolio images are using development paths that won't work in production. 
          Click below to fix them by updating the URLs to use Supabase storage.
        </p>
        <p className="text-sm text-orange-600">
          <strong>Note:</strong> Make sure you've uploaded the actual image files to your Supabase storage 
          portfolio bucket first, or use the admin interface to re-upload them.
        </p>
        <Button 
          onClick={fixPortfolioImages}
          disabled={fixing}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {fixing ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Fixing Images...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Fix Portfolio Images
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};