import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, DollarSign, User, Settings, Image, Users, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAppointments } from '@/components/admin/AdminAppointments';
import { AdminPortfolio } from '@/components/admin/AdminPortfolio';
import { AdminServices } from '@/components/admin/AdminServices';
import { AdminUsers } from '@/components/admin/AdminUsers';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === 'tyronenorris@gmail.com';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      fetchAppointments();
    }
  }, [user, navigate, isAdmin]);

  const fetchAppointments = async () => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          hair_styles (name)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your hair braiding business</p>
          </div>

          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <AdminAppointments />
            </TabsContent>

            <TabsContent value="portfolio">
              <AdminPortfolio />
            </TabsContent>

            <TabsContent value="services">
              <AdminServices />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">Manage your appointments and profile</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading appointments...</p>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No appointments yet</p>
                    <Button variant="hero" onClick={() => navigate('/book')}>
                      Book Your First Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt: any) => (
                      <div key={apt.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{apt.hair_styles?.name || 'Style TBD'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(apt.appointment_date).toLocaleDateString()} at {apt.appointment_time}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        {apt.price_quote && (
                          <p className="text-primary font-semibold mt-2">${apt.price_quote}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="hero" className="w-full" onClick={() => navigate('/book')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/portfolio')}>
                  View Portfolio
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <AuthProvider>
      <DashboardPage />
    </AuthProvider>
  );
};

export default Dashboard;