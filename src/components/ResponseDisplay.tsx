
import { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <GlassmorphicCard className="h-[300px] relative">
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Notifications</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {!response && !isLoading ? (
            <p className="text-foreground/70 text-center">
              No new notifications at the moment.
            </p>
          ) : isLoading ? (
            <div className="text-center">
              <p className="text-foreground/70 mb-4">Processing your submission...</p>
              
              <div className="relative h-2 w-64 bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-teal rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <p className="text-xs mt-2 text-foreground/50">{progress}%</p>
            </div>
          ) : (
            <div className="border border-coral/50 rounded-lg p-4 w-full h-full overflow-auto bg-gradient-to-br from-background to-background/50 shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-coral">New Response</span>
                <span className="text-xs text-foreground/50">Just now</span>
              </div>
              <h4 className="text-sm font-medium mt-2 mb-1">Grievance Response</h4>
              <p className="text-foreground text-sm">{response}</p>
            </div>
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default ResponseDisplay;
