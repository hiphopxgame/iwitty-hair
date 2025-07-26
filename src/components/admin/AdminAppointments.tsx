import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          hair_styles (name),
          braiding_profiles (first_name, last_name, phone)
        `)
        .order('created_at', { ascending: false });

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: string, updates: any) => {
    try {
      await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);
      
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="flex justify-center py-8">Loading appointments...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Appointment Management</h2>
      
      <div className="space-y-4">
        {appointments.map((apt: any) => (
          <Card key={apt.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {apt.braiding_profiles?.first_name} {apt.braiding_profiles?.last_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {apt.hair_styles?.name || 'Style TBD'}
                  </p>
                </div>
                <Badge className={getStatusColor(apt.status)}>
                  {apt.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Date:</strong> {new Date(apt.appointment_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {apt.appointment_time}</p>
                  <p><strong>Phone:</strong> {apt.braiding_profiles?.phone}</p>
                  {apt.special_requests && (
                    <p><strong>Special Requests:</strong> {apt.special_requests}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price Quote ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={apt.price_quote}
                      onBlur={(e) => {
                        if (e.target.value && parseFloat(e.target.value) !== apt.price_quote) {
                          updateAppointment(apt.id, { 
                            price_quote: parseFloat(e.target.value),
                            status: apt.status === 'pending' ? 'quoted' : apt.status
                          });
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {apt.status === 'pending' && (
                      <Button 
                        size="sm"
                        onClick={() => updateAppointment(apt.id, { status: 'quoted' })}
                      >
                        Send Quote
                      </Button>
                    )}
                    {apt.status === 'quoted' && (
                      <Button 
                        size="sm"
                        onClick={() => updateAppointment(apt.id, { status: 'confirmed' })}
                      >
                        Confirm
                      </Button>
                    )}
                    {apt.status === 'confirmed' && (
                      <Button 
                        size="sm"
                        onClick={() => updateAppointment(apt.id, { status: 'completed' })}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {appointments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No appointments yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};