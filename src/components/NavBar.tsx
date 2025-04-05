
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon } from 'lucide-react';

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

interface NavBarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const NavBar = ({ isDarkMode, toggleDarkMode }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/signin">Sign In</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="ml-2 rounded-full"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </nav>
          
          {/* Mobile Navigation Toggle */}
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="mr-1 rounded-full"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
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
            <NavLink to="/" className="block py-2">Home</NavLink>
            <NavLink to="/signin" className="block py-2">Sign In</NavLink>
            <NavLink to="/signup" className="block py-2">Sign Up</NavLink>
            <NavLink to="/dashboard" className="block py-2">Dashboard</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
