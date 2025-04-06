
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ThreeJSBackground from '@/components/ThreeJSBackground';
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Profile = () => {
  const { isDarkMode } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: 'Demo User',
    email: 'demo@example.com',
    company: 'Tech Startup Inc.',
    role: 'Founder & CEO',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Ave, Tech Valley, CA',
    bio: 'Tech entrepreneur focused on AI solutions for small businesses.'
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Profile updated successfully");
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <ThreeJSBackground className="opacity-25" />
      <div className="absolute inset-0 backdrop-blur-sm z-0"></div>
      
      <NavBar isDarkMode={isDarkMode} />
      
      <main className="flex-grow pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-3d">
              <span className="text-gradient-teal">User</span>
              <span className="text-foreground ml-1">Profile</span>
            </h1>
            <p className="text-foreground/70 mt-2">Manage your personal information</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Your public profile image</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarFallback className="bg-teal/20 text-teal text-4xl">
                    DU
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline">Upload Photo</Button>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-2">
                <div className="bg-background/20 p-3 rounded-md">
                  <h4 className="font-medium text-sm mb-1">Account Status</h4>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-teal"></div>
                    <span className="text-xs">Active</span>
                  </div>
                </div>
                <div className="bg-background/20 p-3 rounded-md">
                  <h4 className="font-medium text-sm mb-1">Member Since</h4>
                  <span className="text-xs">April 1, 2025</span>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm border-border">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company" 
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        id="role" 
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline">Cancel</Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
