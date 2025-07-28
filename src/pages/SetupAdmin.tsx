import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SetupAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin-user', {
        body: {
          email: 'Kandiyams_2000@yahoo.com',
          password: 'iL0v3u!&82'
        }
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Error",
        description: "Failed to setup admin user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Setup Admin User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value="Kandiyams_2000@yahoo.com" disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input value="iL0v3u!&82" disabled type="password" />
          </div>
          <Button 
            onClick={handleSetupUser} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Setting up...' : 'Setup Admin User'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAdmin;