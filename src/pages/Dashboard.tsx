
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import NavBar from '@/components/NavBar';
import ProfileCard from '@/components/ProfileCard';
import ComplaintForm from '@/components/ComplaintForm';
import ResponseDisplay from '@/components/ResponseDisplay';
import RealTimeAnalytics from '@/components/RealTimeAnalytics';
import ComplaintHistory from '@/components/ComplaintHistory';
import LegalChatBot from '@/components/LegalChatBot';
import ThreeJSBackground from '@/components/ThreeJSBackground';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackgroundPattern from '@/components/BackgroundPattern';

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasNewResponse, setHasNewResponse] = useState(false);
  const [userData, setUserData] = useState<{ username: string; email: string } | null>(null);
  const navigate = useNavigate();
  
  // Check for user authentication
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Please sign in to access the dashboard');
      navigate('/signin');
    } else {
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        localStorage.removeItem('user');
        navigate('/signin');
      }
    }
  }, [navigate]);
  
  // If we have a complaintId, fetch the response data after the processing delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (complaintId && isProcessing) {
      timer = setTimeout(() => {
        setHasNewResponse(true);
        setIsProcessing(false);
      }, 3500); // Shorter delay for better user experience
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [complaintId, isProcessing]);
  
  if (!userData) {
    return null; // Don't render anything until we check auth
  }
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <BackgroundPattern />
      <ThreeJSBackground className="opacity-10" />
      <div className="absolute inset-0 backdrop-blur-sm z-0"></div>
      
      <NavBar isDarkMode={isDarkMode} />
      
      <main className="flex-grow pt-20 pb-12 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-3d">
              <span className="text-primary">AI</span>
              <span className="text-foreground ml-1">Grievance</span>
            </h1>
            <p className="text-foreground/70 text-lg mt-2 max-w-2xl mx-auto">
              Revolutionize Startup Grievances with AI Precision
            </p>
          </div>
          
          <div className="mb-6 flex justify-between items-start">
            <ProfileCard 
              username={userData.username}
              email={userData.email}
              joinDate="April 1, 2025"
              complaintsSubmitted={5}
            />
          </div>
          
          <Tabs defaultValue="submit" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md mx-auto">
              <TabsTrigger value="submit">Submit</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="submit" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-6">
                  <ComplaintForm 
                    onSubmit={() => setHasNewResponse(false)} 
                    setComplaintId={setComplaintId}
                    setIsProcessing={setIsProcessing}
                  />
                  <ResponseDisplay 
                    complaintId={complaintId}
                    isLoading={isProcessing}
                    hasNewResponse={hasNewResponse}
                  />
                </div>
                
                <div className="lg:col-span-7">
                  <div className="h-full">
                    <RealTimeAnalytics />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <ComplaintHistory />
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="space-y-6">
                <RealTimeAnalytics />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <LegalChatBot />
    </div>
  );
};

export default Dashboard;
