import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FixPortfolioImages } from './FixPortfolioImages';

export const AdminPortfolio = () => {
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [hairStyles, setHairStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    image_url: '',
    style_id: '',
    client_name: '',
    completion_date: '',
    description: '',
    is_featured: false
  });
  const [newStyleName, setNewStyleName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, stylesRes] = await Promise.all([
        supabase
          .from('iwitty_portfolio_images')
          .select(`
            *,
            iwitty_hair_styles (name)
          `)
          .order('display_order'),
        supabase
          .from('iwitty_hair_styles')
          .select('*')
          .order('name')
      ]);

      setPortfolioImages(portfolioRes.data || []);
      setHairStyles(stylesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      setNewItem({ ...newItem, image_url: publicUrl });
      toast({ title: "Image uploaded successfully!" });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Error uploading image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const createNewStyle = async () => {
    if (!newStyleName.trim()) return null;
    
    try {
      const { data, error } = await supabase
        .from('iwitty_hair_styles')
        .insert([{ name: newStyleName.trim() }])
        .select()
        .single();
      
      if (error) throw error;
      
      setNewStyleName('');
      fetchData();
      return data.id;
    } catch (error) {
      console.error('Error creating style:', error);
      toast({ title: "Error creating style", variant: "destructive" });
      return null;
    }
  };

  const saveItem = async () => {
    try {
      let styleId = newItem.style_id;
      
      // Create new style if needed
      if (newStyleName.trim() && !styleId) {
        styleId = await createNewStyle();
        if (!styleId) return;
      }
      
      const itemData = { ...newItem, style_id: styleId };
      
      if (editingItem) {
        await supabase
          .from('iwitty_portfolio_images')
          .update(itemData)
          .eq('id', editingItem.id);
      } else {
        await supabase
          .from('iwitty_portfolio_images')
          .insert([itemData]);
      }
      
      setNewItem({
        title: '',
        image_url: '',
        style_id: '',
        client_name: '',
        completion_date: '',
        description: '',
        is_featured: false
      });
      setNewStyleName('');
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({ title: "Error saving item", variant: "destructive" });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await supabase
        .from('iwitty_portfolio_images')
        .delete()
        .eq('id', id);
      
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) return <div className="flex justify-center py-8">Loading portfolio...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolio Management</h2>
        <Button onClick={() => setEditingItem({})}>
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      <FixPortfolioImages />

      {(editingItem !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem?.id ? 'Edit' : 'Add'} Portfolio Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Image</label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    disabled={uploading}
                  />
                  {uploading && <Upload className="w-4 h-4 animate-spin" />}
                </div>
                {newItem.image_url && (
                  <img src={newItem.image_url} alt="Preview" className="w-20 h-20 object-cover rounded" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hair Style</label>
                <Select 
                  value={newItem.style_id} 
                  onValueChange={(value) => setNewItem({...newItem, style_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Hair Style" />
                  </SelectTrigger>
                  <SelectContent>
                    {hairStyles.map((style: any) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Or create new style..."
                    value={newStyleName}
                    onChange={(e) => setNewStyleName(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      const styleId = await createNewStyle();
                      if (styleId) setNewItem({...newItem, style_id: styleId});
                    }}
                    disabled={!newStyleName.trim()}
                  >
                    Create
                  </Button>
                </div>
              </div>
              
              <Input
                placeholder="Client Name (optional)"
                value={newItem.client_name}
                onChange={(e) => setNewItem({...newItem, client_name: e.target.value})}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Completion Date (optional)</label>
                <Input
                  type="date"
                  value={newItem.completion_date}
                  onChange={(e) => setNewItem({...newItem, completion_date: e.target.value})}
                />
              </div>
            </div>
            <Textarea
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            />
            <div className="flex gap-2">
              <Button onClick={saveItem}>Save</Button>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolioImages.map((item: any) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <img 
                src={item.image_url} 
                alt={item.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.iwitty_hair_styles?.name}</p>
              {item.client_name && (
                <p className="text-sm">Client: {item.client_name}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setEditingItem(item);
                    setNewItem(item);
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {portfolioImages.length === 0 && !editingItem && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No portfolio images yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};