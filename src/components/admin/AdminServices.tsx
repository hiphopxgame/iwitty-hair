import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    base_price: '',
    duration_hours: ''
  });

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

  const saveService = async () => {
    try {
      const serviceData = {
        ...newService,
        base_price: parseFloat(newService.base_price) || null,
        duration_hours: parseInt(newService.duration_hours) || null
      };

      if (editingService) {
        await supabase
          .from('hair_styles')
          .update(serviceData)
          .eq('id', editingService.id);
      } else {
        await supabase
          .from('hair_styles')
          .insert([serviceData]);
      }
      
      setNewService({
        name: '',
        description: '',
        base_price: '',
        duration_hours: ''
      });
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const deleteService = async (id: string) => {
    try {
      await supabase
        .from('hair_styles')
        .delete()
        .eq('id', id);
      
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  if (loading) return <div>Loading services...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <Button onClick={() => setEditingService({})}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {(editingService !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingService?.id ? 'Edit' : 'Add'} Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Service Name"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
              />
              <Input
                placeholder="Base Price ($)"
                type="number"
                step="0.01"
                value={newService.base_price}
                onChange={(e) => setNewService({...newService, base_price: e.target.value})}
              />
              <Input
                placeholder="Duration (hours)"
                type="number"
                value={newService.duration_hours}
                onChange={(e) => setNewService({...newService, duration_hours: e.target.value})}
              />
            </div>
            <Textarea
              placeholder="Service Description"
              value={newService.description}
              onChange={(e) => setNewService({...newService, description: e.target.value})}
            />
            <div className="flex gap-2">
              <Button onClick={saveService}>Save</Button>
              <Button variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service: any) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>${service.base_price}</span>
                    <span>{service.duration_hours}h</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingService(service);
                      setNewService({
                        name: service.name,
                        description: service.description || '',
                        base_price: service.base_price?.toString() || '',
                        duration_hours: service.duration_hours?.toString() || ''
                      });
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteService(service.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {service.description && (
              <CardContent>
                <p className="text-sm">{service.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};