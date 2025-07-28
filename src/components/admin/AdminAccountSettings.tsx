import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Save, X } from 'lucide-react';

interface AdminAccountSettingsProps {
  currentAdmin: {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
  };
  onUpdate: () => void;
}

const AdminAccountSettings = ({ currentAdmin, onUpdate }: AdminAccountSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentAdmin.full_name || '',
    email: currentAdmin.email || '',
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.full_name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update email if changed
      if (formData.email !== currentAdmin.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (emailError) {
          throw emailError;
        }
      }

      // Update password if provided
      if (formData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password
        });
        
        if (passwordError) {
          throw passwordError;
        }
      }

      // Update user metadata for full name
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name
        }
      });

      if (metadataError) {
        throw metadataError;
      }

      // Update admin accounts table if it exists
      try {
        const { error: adminError } = await supabase
          .from('admin_accounts')
          .update({
            email: formData.email,
            full_name: formData.full_name,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentAdmin.id);

        // Don't throw error if admin_accounts table doesn't exist
        if (adminError && !adminError.message.includes('relation "admin_accounts" does not exist')) {
          console.warn('Could not update admin_accounts table:', adminError);
        }
      } catch (adminTableError) {
        console.warn('Admin accounts table update failed:', adminTableError);
      }

      toast({
        title: "Success",
        description: "Account details updated successfully",
      });

      setIsOpen(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      onUpdate();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update account details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Edit Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Admin Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">New Password (optional)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your new password"
              disabled={!formData.password}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleUpdateProfile} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAccountSettings;