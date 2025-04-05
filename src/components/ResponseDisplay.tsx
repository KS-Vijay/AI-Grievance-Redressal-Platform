
import { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';

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
    <GlassmorphicCard className="h-[300px]">
      <div className="p-6 h-full flex flex-col">
        <h3 className="text-xl font-bold mb-4">Response</h3>
        
        <div className="flex-1 flex items-center justify-center">
          {!response && !isLoading ? (
            <p className="text-foreground/70 text-center">
              Submit a complaint to see your response.
            </p>
          ) : isLoading ? (
            <div className="text-center">
              <p className="text-foreground/70 mb-4">Processing...</p>
              
              <div className="relative h-2 w-64 bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-teal rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <p className="text-xs mt-2 text-foreground/50">{progress}%</p>
            </div>
          ) : (
            <div className="border border-coral/50 rounded-lg p-4 w-full h-full overflow-auto bg-gradient-to-br from-background to-background/50">
              <p className="text-foreground">{response}</p>
            </div>
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default ResponseDisplay;
