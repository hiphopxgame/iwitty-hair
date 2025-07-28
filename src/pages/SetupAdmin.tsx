import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const SetupAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/functions/v1/setup-admin-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'Kandiyams_2000@yahoo.com',
          password: 'iL0v3u!&82'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
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