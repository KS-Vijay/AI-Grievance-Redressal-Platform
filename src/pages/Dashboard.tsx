
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
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasNewResponse, setHasNewResponse] = useState(false);
  
  const handleComplaintSubmit = ({ complaint, category }: { complaint: string; category: string }) => {
    setIsProcessing(true);
    setAiResponse(null);
    
    // Simulate AI processing
    setTimeout(() => {
      // Generate a response based on the complaint and category
      let response = '';
      
      if (category === 'product') {
        response = `Based on your product issue, we recommend the following steps:\n\n1. Document all issues with timestamps and screenshots\n2. Contact customer support with detailed evidence\n3. If unresolved within 48 hours, escalate to a supervisor\n4. Consider mediation through our platform if necessary`;
      } else if (category === 'payment') {
        response = `For your payment dispute, our AI analysis suggests:\n\n1. Compile all payment receipts and communication\n2. Send a formal dispute letter referring to specific transaction IDs\n3. Allow 5 business days for resolution\n4. If unresolved, consider our escrow services for future transactions`;
      } else if (category === 'employee') {
        response = `Regarding your employee concern, we recommend:\n\n1. Review your employee handbook and contract terms\n2. Document specific incidents with dates and witnesses\n3. Request a formal meeting with HR and provide written notice\n4. Consider third-party mediation if initial steps are unsuccessful`;
      } else if (category === 'vendor') {
        response = `For your vendor issue, our recommended approach is:\n\n1. Review contract terms for breach clauses\n2. Send a formal notice specifying the contract violations\n3. Propose a resolution timeline of 14 days\n4. Consider alternative vendors while maintaining documentation for potential claims`;
      } else if (category === 'legal') {
        response = `Based on your legal concern, our AI suggests:\n\n1. Immediately preserve all relevant documents\n2. Consult with a specialized attorney in this domain\n3. Consider requesting a compliance review\n4. Implement revised procedures to prevent similar issues`;
      } else {
        response = `Thank you for your submission. Our analysis suggests:\n\n1. Clearly define the specific issues in writing\n2. Identify desired outcomes and reasonable timeline\n3. Propose multiple resolution options\n4. Be open to compromise while documenting all communication`;
      }
      
      setAiResponse(response);
      setIsProcessing(false);
      setHasNewResponse(true);
    }, 5000);
  };
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <ThreeJSBackground className="opacity-25" />
      <div className="absolute inset-0 backdrop-blur-sm z-0"></div>
      
      <NavBar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
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
              <ComplaintForm onSubmit={handleComplaintSubmit} />
              <ResponseDisplay 
                response={aiResponse}
                isLoading={isProcessing}
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
