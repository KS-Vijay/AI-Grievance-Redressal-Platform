
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import AuthForm from '@/components/AuthForm';
import HeroSection from '@/components/HeroSection';

const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateEmail = (email: string) => {
    // Basic validation: valid format and not matching test email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return false;
    
    // Reject known test emails
    if (email === '123@gmail.com') return false;
    
    // Check for common domain extensions
    const validDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'aol.com', 'protonmail.com'];
    const domain = email.split('@')[1];
    
    // Either it must match a known domain or contain a valid TLD with at least 2 characters
    return validDomains.includes(domain) || /\.[a-z]{2,}$/i.test(domain);
  };
  
  const handleSubmit = async (data: { username: string; email: string; password: string }) => {
    if (!validateEmail(data.email)) {
      toast.error('Please provide a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to register');
      }
      
      toast.success('Registration successful! Please sign in.');
      navigate('/signin');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      
      <div className="flex-grow flex items-center justify-center p-6 relative z-10">
        <AuthForm 
          type="signup"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          additionalFields={[
            {
              id: "username",
              label: "Username",
              type: "text",
              placeholder: "Enter your username",
              required: true,
            },
          ]}
          footerText={
            <span>
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </span>
          }
        />
      </div>
    </div>
  );
};

export default SignUp;
