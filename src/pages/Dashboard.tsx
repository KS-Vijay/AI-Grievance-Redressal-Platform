import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import NavBar from '@/components/NavBar';
import ProfileCard from '@/components/ProfileCard';
import ComplaintForm from '@/components/ComplaintForm';
import ResponseDisplay from '@/components/ResponseDisplay';
import AnalyticsDisplay from '@/components/AnalyticsDisplay';
import LegalChatBot from '@/components/LegalChatBot';
import ThreeJSBackground from '@/components/ThreeJSBackground';

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [hasNewResponse, setHasNewResponse] = useState(false);
  
  const handleComplaintSubmit = ({ complaint, category }: { complaint: string; category: string }) => {
    // This function is kept for backward compatibility
    // The actual API call is now in ComplaintForm.tsx
    setAiResponse(null);
    
    // We'll fetch the response data after we know the backend is done processing
    setTimeout(async () => {
      if (complaintId) {
        try {
          const response = await fetch(`http://localhost:8000/get-response/${complaintId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch response');
          }
          
          const data = await response.json();
          setAiResponse(data.response);
        } catch (error) {
          console.error('Error fetching response:', error);
        } finally {
          setIsProcessing(false);
          setHasNewResponse(true);
        }
      }
    }, 5000); // Match the backend delay
  };
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <ThreeJSBackground className="opacity-25" />
      <div className="absolute inset-0 backdrop-blur-sm z-0"></div>
      
      <NavBar isDarkMode={isDarkMode} />
      
      <main className="flex-grow pt-20 pb-12 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-3d">
              <span className="text-gradient-teal">AI</span>
              <span className="text-foreground ml-1">Grievance</span>
            </h1>
            <p className="text-foreground/70 text-lg mt-2 max-w-2xl mx-auto">
              Revolutionize Startup Grievances with AI Precision
            </p>
          </div>
          
          <div className="mb-6 flex justify-between items-start">
            <ProfileCard 
              username="DemoUser"
              email="demo@example.com"
              joinDate="April 1, 2025"
              complaintsSubmitted={5}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <ComplaintForm 
                onSubmit={handleComplaintSubmit} 
                setComplaintId={setComplaintId}
                setIsProcessing={setIsProcessing}
              />
              <ResponseDisplay 
                complaintId={complaintId}
                isLoading={isProcessing}
                complaintId={complaintId}
              />
            </div>
            
            <div className="lg:col-span-7">
              <div className="h-full">
                <AnalyticsDisplay 
                  resolvedPercentage={80}
                  urgentCases={12}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <LegalChatBot />
    </div>
  );
};

export default Dashboard;