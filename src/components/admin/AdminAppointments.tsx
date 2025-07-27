import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, Mail, Phone, Edit, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  special_requests?: string;
  admin_comments?: string;
  price_quote?: number;
  estimated_duration?: number;
  hair_styles?: {
    name: string;
  };
  braiding_profiles?: {
    first_name: string;
    last_name: string;
    phone?: string;
    user_id: string;
  };
  client_email?: string;
}

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState({
    appointment_date: '',
    appointment_time: '',
    status: '',
    admin_comments: '',
    price_quote: '',
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'secondary' },
    { value: 'confirmed', label: 'Confirmed', color: 'default' },
    { value: 'completed', label: 'Completed', color: 'secondary' },
    { value: 'cancelled', label: 'Cancelled', color: 'destructive' },
  ];

  const fetchAppointments = async () => {
    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          hair_styles (name),
          braiding_profiles (first_name, last_name, phone, user_id)
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      // Get client emails from user data (we'll use a workaround since we can't directly query auth.users)
      const appointmentsWithEmails = await Promise.all(
        (appointmentsData || []).map(async (appointment) => {
          // For now, we'll use the user_id to potentially fetch from a profile or set a placeholder
          // In a real implementation, you might want to store email in braiding_profiles table
          return {
            ...appointment,
            client_email: 'client@example.com' // Placeholder - update this based on your auth setup
          };
        })
      );

      setAppointments(appointmentsWithEmails);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      const updateData: any = {
        appointment_date: editForm.appointment_date,
        appointment_time: editForm.appointment_time,
        status: editForm.status,
        admin_comments: editForm.admin_comments,
        updated_at: new Date().toISOString(),
      };

      if (editForm.price_quote) {
        updateData.price_quote = parseFloat(editForm.price_quote);
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', editingAppointment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditForm({
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      admin_comments: appointment.admin_comments || '',
      price_quote: appointment.price_quote?.toString() || '',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color as any || 'secondary';
  };

  const quickStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return <div className="p-6">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments Management</h2>
        <Button onClick={fetchAppointments} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {appointment.braiding_profiles?.first_name} {appointment.braiding_profiles?.last_name}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {appointment.appointment_time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="appointment_date">Date</Label>
                          <Input
                            id="appointment_date"
                            type="date"
                            value={editForm.appointment_date}
                            onChange={(e) => setEditForm({ ...editForm, appointment_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="appointment_time">Time</Label>
                          <Input
                            id="appointment_time"
                            type="time"
                            value={editForm.appointment_time}
                            onChange={(e) => setEditForm({ ...editForm, appointment_time: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={editForm.status}
                            onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="price_quote">Price Quote ($)</Label>
                          <Input
                            id="price_quote"
                            type="number"
                            step="0.01"
                            value={editForm.price_quote}
                            onChange={(e) => setEditForm({ ...editForm, price_quote: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin_comments">Admin Comments</Label>
                          <Textarea
                            id="admin_comments"
                            value={editForm.admin_comments}
                            onChange={(e) => setEditForm({ ...editForm, admin_comments: e.target.value })}
                            placeholder="Add notes or comments about this appointment..."
                            rows={3}
                          />
                        </div>
                        <Button onClick={updateAppointment} className="w-full">
                          Update Appointment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.client_email || 'Email not available'}</span>
                  </div>
                  {appointment.braiding_profiles?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{appointment.braiding_profiles.phone}</span>
                    </div>
                  )}
                  {appointment.hair_styles?.name && (
                    <div>
                      <span className="text-sm font-medium">Service: </span>
                      <span className="text-sm">{appointment.hair_styles.name}</span>
                    </div>
                  )}
                  {appointment.price_quote && (
                    <div>
                      <span className="text-sm font-medium">Quote: </span>
                      <span className="text-sm">${appointment.price_quote}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {appointment.special_requests && (
                    <div>
                      <span className="text-sm font-medium">Special Requests:</span>
                      <p className="text-sm text-muted-foreground">{appointment.special_requests}</p>
                    </div>
                  )}
                  {appointment.admin_comments && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Admin Comments:</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {appointment.admin_comments}
                      </p>
                    </div>
                  )}
                  
                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {appointment.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => quickStatusUpdate(appointment.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => quickStatusUpdate(appointment.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => quickStatusUpdate(appointment.id, 'cancelled')}
                      >
                        Cancel
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
            <p className="text-muted-foreground">No appointments found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};