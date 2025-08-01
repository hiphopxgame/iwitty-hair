import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User, Phone, MapPin, Calendar } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First get profiles
      const { data: profiles } = await supabase
        .from('iwitty_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Then get appointments for each profile separately
      const usersWithAppointments = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: appointments } = await supabase
            .from('iwitty_appointments')
            .select(`
              id,
              status,
              appointment_date,
              appointment_time,
              special_requests,
              price_quote,
              iwitty_hair_styles (name)
            `)
            .eq('client_id', profile.user_id);

          return {
            ...profile,
            appointments: appointments || []
          };
        })
      );

      // Filter to only show clients who have at least one appointment
      const clientsWithAppointments = usersWithAppointments.filter(user => 
        user.appointments && user.appointments.length > 0
      );

      setUsers(clientsWithAppointments);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentStats = (appointments: any[]) => {
    const total = appointments.length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const upcoming = appointments.filter(apt => 
      apt.status === 'confirmed' && new Date(apt.appointment_date) >= new Date()
    ).length;
    
    return { total, completed, upcoming };
  };

  if (loading) return <div>Loading clients...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Client Management</h2>
      
      <div className="grid gap-4">
        {users.map((user: any) => {
          const stats = getAppointmentStats(user.appointments || []);
          
          return (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-subtle rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{stats.total} appointments</Badge>
                    {stats.upcoming > 0 && (
                      <Badge>{stats.upcoming} upcoming</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {(user.city || user.state) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{[user.city, user.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {user.hair_type && (
                      <p className="text-sm"><strong>Hair Type:</strong> {user.hair_type}</p>
                    )}
                    {user.allergies && (
                      <p className="text-sm"><strong>Allergies:</strong> {user.allergies}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{stats.completed} completed appointments</span>
                    </div>
                    <p className="text-sm">
                      <strong>Preferred Contact:</strong> {user.preferred_contact}
                    </p>
                  </div>
                </div>
                
                {user.appointments && user.appointments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Recent Appointments</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {user.appointments.slice(0, 3).map((appointment: any) => (
                        <div key={appointment.id} className="text-sm p-2 bg-muted/30 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p><strong>{appointment.iwitty_hair_styles?.name || 'Service'}</strong></p>
                              <p>{new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}</p>
                              {appointment.special_requests && (
                                <p className="text-xs text-muted-foreground mt-1">{appointment.special_requests}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant={appointment.status === 'completed' ? 'default' : 'outline'}>
                                {appointment.status}
                              </Badge>
                              {appointment.price_quote && (
                                <p className="text-xs mt-1">${appointment.price_quote}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {users.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No clients with appointments found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clients appear here after they book their first appointment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};