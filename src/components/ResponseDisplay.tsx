
import { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import { X, Bell, CheckCircle2, AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ResponseData {
  complaint_id: string;
  category: string;
  complaint: string;
  response: string;
  sentiment: string;
  urgency: string;
  fraud: string;
}

interface ResponseDisplayProps {
  complaintId: string | null; 
  isLoading: boolean;
  hasNewResponse?: boolean;
}

const ResponseDisplay = ({ complaintId, isLoading, hasNewResponse = false }: ResponseDisplayProps) => {
  const [progress, setProgress] = useState(0);
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Progress bar animation
    if (isLoading) {
      setProgress(0);
      
      // Start progress animation (5 seconds = 5000ms, 100% in 50ms steps = 100 steps)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;  // 100 / 50 = 2% per step
        });
      }, 100); // Slightly slower to match backend delay more accurately
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);
  
  // Fetch the response data when processing completes
  useEffect(() => {
    const fetchResponseData = async () => {
      if (!complaintId || isLoading) return;
      
      try {
        const response = await fetch(`http://localhost:8000/get-response/${complaintId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setResponseData(data);
      } catch (error) {
        console.error("Error fetching response:", error);
        setResponseData({
          complaint_id: complaintId,
          category: "Unknown",
          complaint: "Error fetching complaint",
          response: "Failed to process complaint. Please try again.",
          sentiment: "N/A",
          urgency: "N/A",
          fraud: "N/A"
        });
      }
    };
    
    if (complaintId && hasNewResponse) {
      fetchResponseData();
    }
  }, [complaintId, hasNewResponse, isLoading]);
  
  return (
    <GlassmorphicCard className="relative">
      <div className="p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Notifications</h3>
            <Badge variant="outline" className="bg-coral/10 text-coral animate-pulse">
              {isLoading ? 'Processing' : responseData ? 'New' : 'No updates'}
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {!responseData && !isLoading && !complaintId ? (
            <div className="text-center space-y-4 py-6">
              <Bell className="mx-auto h-16 w-16 text-foreground/30 animate-float" />
              <div>
                <p className="text-foreground/70 text-lg font-medium">
                  No new notifications
                </p>
                <p className="text-foreground/50 text-sm mt-1">
                  Submit a complaint to see updates here
                </p>
              </div>
              
              <div className="mt-4">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="w-4 h-4 bg-teal/30 rounded-full absolute top-0 left-6 animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-4 h-4 bg-teal/30 rounded-full absolute top-6 left-0 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-4 h-4 bg-teal/30 rounded-full absolute top-6 right-0 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-4 h-4 bg-teal/30 rounded-full absolute bottom-0 left-6 animate-bounce" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center space-y-4 w-full max-w-md py-6">
              <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                <RotateCw className="h-12 w-12 text-teal animate-spin" />
                <div className="absolute inset-0 border-4 border-teal/30 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-teal rounded-full"
                  style={{ 
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + progress/2}% 0%, ${50 + progress/2}% ${progress}%, ${50 - progress/2}% ${progress}%, ${50 - progress/2}% 0%, 50% 0%)` 
                  }}
                ></div>
              </div>
              
              <Alert>
                <AlertTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-coral" />
                  Processing your submission
                </AlertTitle>
                <AlertDescription>
                  We're analyzing your complaint. This typically takes a few moments.
                </AlertDescription>
              </Alert>
              
              <div className="relative h-2 w-full bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-teal rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-foreground/50">{progress}% complete</p>
            </div>
          ) : (
            <div className="w-full flex flex-col py-4">
              <div className="border border-coral/50 rounded-lg p-4 w-full overflow-auto bg-gradient-to-br from-background to-background/50 shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal" />
                    <span className="text-sm font-medium text-teal">Response Ready</span>
                  </div>
                  <span className="text-xs text-foreground/50">Just now</span>
                </div>
                
                {complaintId && (
                  <div className="mb-3 mt-2">
                    <p className="text-xs text-foreground/70">Complaint ID:</p>
                    <p className="text-sm font-medium bg-background/50 p-2 rounded border border-border/50 mt-1">{complaintId}</p>
                  </div>
                )}
                
                <h4 className="text-base font-medium mt-3 mb-2">Grievance Response</h4>
                <p className="text-foreground text-sm whitespace-pre-line">{responseData?.response}</p>
                <p className="text-foreground text-sm mt-2"><strong>Sentiment:</strong> {responseData?.sentiment}</p>
                <p className="text-foreground text-sm"><strong>Urgency:</strong> {responseData?.urgency}</p>
                <p className="text-foreground text-sm"><strong>Fraud:</strong> {responseData?.fraud}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default ResponseDisplay;
