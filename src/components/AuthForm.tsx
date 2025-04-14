import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import GlassmorphicCard from './GlassmorphicCard';

interface AuthFormProps {
  formType: 'signin' | 'signup';
  onSubmit?: (data: { username: string; email: string; password: string }) => void;
  isSubmitting?: boolean;
  additionalFields?: Array<{
    id: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
  }>;
  footerText?: React.ReactNode;
}

const AuthForm = ({ 
  formType, 
  onSubmit,
  isSubmitting = false,
  additionalFields = [],
  footerText 
}: AuthFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit({ username, email, password });
    } else {
      // Default fallback logic if no onSubmit is provided
      setIsLoading(true);
      
      try {
        if (formType === 'signin') {
          // Login logic
          const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          const data = await response.json();
          
          if (data.status === 'success') {
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Welcome back!');
            navigate('/dashboard');
          } else {
            toast.error(data.message || 'Login failed');
          }
        } else {
          // Registration logic
          const response = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            toast.success('Account created successfully!');
            navigate('/signin');
          } else {
            toast.error(data.detail || 'Registration failed');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Need to keep this state for backward compatibility
  const [isLoading, setIsLoading] = useState(false);
  const isButtonLoading = isSubmitting || isLoading;
  
  return (
    <GlassmorphicCard className="w-full max-w-md mx-auto">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-3d">
          {formType === 'signin' ? 'Sign In' : 'Sign Up'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {(formType === 'signup' || additionalFields.some(field => field.id === 'username')) && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input 
                id="username"
                type="text"
                placeholder="Enter your username"
                required
                className="bg-background/50 focus:ring-2 focus:ring-teal transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input 
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              className="bg-background/50 focus:ring-2 focus:ring-teal transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              
              {formType === 'signin' && (
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-coral hover:underline transition-colors pulse-underline"
                >
                  Forgot Password?
                </Link>
              )}
            </div>
            <Input 
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              className="bg-background/50 focus:ring-2 focus:ring-teal transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full py-5 bg-teal hover:bg-teal/90 mt-6 transition-all transform hover:-translate-y-1 hover:glow-teal"
            disabled={isButtonLoading}
          >
            {isButtonLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : formType === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          {footerText ? footerText : (
            formType === 'signin' ? (
              <p className="text-foreground/70">
                Don't have an account?{' '}
                <Link to="/signup" className="text-coral hover:text-coral/80 font-medium transition-colors">
                  Sign Up
                </Link>
              </p>
            ) : (
              <p className="text-foreground/70">
                Already have an account?{' '}
                <Link to="/signin" className="text-coral hover:text-coral/80 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            )
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default AuthForm;
