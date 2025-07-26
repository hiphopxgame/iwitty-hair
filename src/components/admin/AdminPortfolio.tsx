import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2 } from 'lucide-react';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, stylesRes] = await Promise.all([
        supabase
          .from('portfolio_images')
          .select(`
            *,
            hair_styles (name)
          `)
          .order('display_order'),
        supabase
          .from('hair_styles')
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

  const saveItem = async () => {
    try {
      if (editingItem) {
        await supabase
          .from('portfolio_images')
          .update(newItem)
          .eq('id', editingItem.id);
      } else {
        await supabase
          .from('portfolio_images')
          .insert([newItem]);
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
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', id);
      
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) return <div>Loading portfolio...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portfolio Management</h2>
        <Button onClick={() => setEditingItem({})}>
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

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
              <Input
                placeholder="Image URL"
                value={newItem.image_url}
                onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
              />
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
              <Input
                placeholder="Client Name (optional)"
                value={newItem.client_name}
                onChange={(e) => setNewItem({...newItem, client_name: e.target.value})}
              />
              <Input
                type="date"
                placeholder="Completion Date"
                value={newItem.completion_date}
                onChange={(e) => setNewItem({...newItem, completion_date: e.target.value})}
              />
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
              <p className="text-sm text-muted-foreground">{item.hair_styles?.name}</p>
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
    </div>
  );
};