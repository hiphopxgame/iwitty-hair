import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  user?: any;
}

export const Header = ({ user }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-primary-glow p-2 rounded-lg">
              <span className="text-primary-foreground font-bold text-xl">IW</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Inventively Witty Hair</h1>
              <p className="text-xs text-muted-foreground">Professional Braiding</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors hover:text-primary ${isActive('/') ? 'text-primary font-medium' : 'text-foreground'}`}
            >
              Home
            </Link>
            <Link 
              to="/portfolio" 
              className={`transition-colors hover:text-primary ${isActive('/portfolio') ? 'text-primary font-medium' : 'text-foreground'}`}
            >
              Portfolio
            </Link>
            <Link 
              to="/services" 
              className={`transition-colors hover:text-primary ${isActive('/services') ? 'text-primary font-medium' : 'text-foreground'}`}
            >
              Services
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors hover:text-primary ${isActive('/about') ? 'text-primary font-medium' : 'text-foreground'}`}
            >
              About
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/book">
                  <Button variant="booking" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/book">
                  <Button variant="hero" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`transition-colors hover:text-primary ${isActive('/') ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/portfolio" 
                className={`transition-colors hover:text-primary ${isActive('/portfolio') ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link 
                to="/services" 
                className={`transition-colors hover:text-primary ${isActive('/services') ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className={`transition-colors hover:text-primary ${isActive('/about') ? 'text-primary font-medium' : 'text-foreground'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              <div className="pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start mb-2">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/book" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="booking" size="sm" className="w-full justify-start mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start mb-2">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/book" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="hero" size="sm" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};