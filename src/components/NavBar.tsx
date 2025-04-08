
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ to, children, className = '' }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-300 
      ${isActive 
        ? 'text-teal before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-teal' 
        : 'text-foreground/80 hover:text-foreground'} ${className}`}
    >
      {children}
    </Link>
  );
};

const Logo = () => (
  <Link to="/" className="flex items-center">
    <div className="font-extrabold text-xl text-3d transform transition-transform duration-300 hover:scale-105">
      <span className="text-gradient-teal">AI</span>
      <span className="text-foreground ml-1">Grievance</span>
    </div>
  </Link>
);

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ username: string } | null>(null);
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full ml-2 hover:bg-background/20">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-teal/20 text-teal">
              {userData?.username ? userData.username.substring(0, 2).toUpperCase() : 'DU'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer w-full flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer w-full flex items-center">
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface NavBarProps {
  isDarkMode: boolean;
}

const NavBar = ({ isDarkMode }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('user'); // Check if user is logged in
  const isDashboard = location.pathname === '/dashboard';
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {!isLoggedIn ? (
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/signin">Sign In</NavLink>
                <NavLink to="/signup">Sign Up</NavLink>
              </>
            ) : (
              // Only show dashboard link when not on dashboard page
              !isDashboard && <NavLink to="/dashboard">Dashboard</NavLink>
            )}
            
            {isLoggedIn && <ProfileMenu />}
          </nav>
          
          {/* Mobile Navigation Toggle */}
          <div className="flex items-center md:hidden">
            {isLoggedIn && <ProfileMenu />}
            
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="rounded-full">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <div className="py-2 px-4 space-y-1">
            {!isLoggedIn ? (
              <>
                <NavLink to="/" className="block py-2">Home</NavLink>
                <NavLink to="/signin" className="block py-2">Sign In</NavLink>
                <NavLink to="/signup" className="block py-2">Sign Up</NavLink>
              </>
            ) : (
              !isDashboard && <NavLink to="/dashboard" className="block py-2">Dashboard</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
