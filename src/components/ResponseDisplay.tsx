
import { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import { X, Bell, CheckCircle2, AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ResponseDisplayProps {
  response: string | null;
  isLoading: boolean;
}

const ResponseDisplay = ({ response, isLoading }: ResponseDisplayProps) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);
  
  return (
    <GlassmorphicCard className="h-full relative">
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Notifications</h3>
            <Badge variant="outline" className="bg-coral/10 text-coral animate-pulse">
              {isLoading ? 'Processing' : response ? 'New' : 'No updates'}
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {!response && !isLoading ? (
            <div className="text-center space-y-4">
              <Bell className="mx-auto h-12 w-12 text-foreground/30 animate-float" />
              <div>
                <p className="text-foreground/70 text-lg font-medium">
                  No new notifications
                </p>
                <p className="text-foreground/50 text-sm mt-1">
                  Submit a complaint to see updates here
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center space-y-4 w-full max-w-md">
              <div className="relative mx-auto h-16 w-16 flex items-center justify-center">
                <RotateCw className="h-10 w-10 text-teal animate-spin" />
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
            <div className="w-full h-full flex flex-col">
              <div className="border border-coral/50 rounded-lg p-4 w-full h-full overflow-auto bg-gradient-to-br from-background to-background/50 shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal" />
                    <span className="text-sm font-medium text-teal">Response Ready</span>
                  </div>
                  <span className="text-xs text-foreground/50">Just now</span>
                </div>
                <h4 className="text-sm font-medium mt-2 mb-1">Grievance Response</h4>
                <p className="text-foreground text-sm whitespace-pre-line">{response}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default ResponseDisplay;
