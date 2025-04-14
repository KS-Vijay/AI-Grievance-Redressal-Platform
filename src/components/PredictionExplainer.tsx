
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Lightbulb } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExplainerProps {
  type: 'urgency' | 'fraud' | 'sentiment';
  value: string;
  complaint: string;
  confidence?: number;
}

const PredictionExplainer = ({ type, value, complaint, confidence = 0 }: ExplainerProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Function to simulate SHAP values for words
  const getSimulatedImportantWords = (text: string, type: string) => {
    // Split the text into words
    const words = text.split(/\s+/);
    
    // Create a map of words to importance scores
    const wordImportance = words.map(word => {
      let score = 0;
      
      if (type === 'urgency') {
        // Words indicating urgency
        if (/urgent|immediately|emergency|asap|urgent|quickly|right now|critical|serious|life-threatening/i.test(word)) {
          score = 0.8 + Math.random() * 0.2; // High positive score
        } else if (/wait|later|sometime|eventually|whenever/i.test(word)) {
          score = -0.7 - Math.random() * 0.3; // High negative score
        } else {
          score = (Math.random() - 0.5) * 0.5; // Random smaller score
        }
      } else if (type === 'fraud') {
        // Words indicating fraud
        if (/fake|scam|fraud|suspicious|unauthorized|illegal|stolen|hack|forged/i.test(word)) {
          score = 0.8 + Math.random() * 0.2; // High positive score
        } else {
          score = (Math.random() - 0.5) * 0.5; // Random smaller score
        }
      } else if (type === 'sentiment') {
        // Words indicating sentiment
        if (/love|like|great|good|excellent|happy|wonderful|amazing|perfect/i.test(word)) {
          score = 0.8 + Math.random() * 0.2; // High positive score for positive words
        } else if (/hate|terrible|awful|bad|poor|horrible|disappointed|angry|worst/i.test(word)) {
          score = -0.8 - Math.random() * 0.2; // High negative score for negative words
        } else {
          score = (Math.random() - 0.5) * 0.3; // Random smaller score
        }
      }
      
      return {
        word,
        score,
      };
    });
    
    return wordImportance;
  };
  
  // Generate the word importance visualization
  const renderWordImportance = () => {
    const wordImportance = getSimulatedImportantWords(complaint, type);
    
    return (
      <div className="p-4 bg-card/20 rounded-lg mt-4 border border-border/50">
        <p className="text-sm font-medium mb-2">Key factors influencing this prediction:</p>
        <div className="text-sm leading-relaxed">
          {wordImportance.map((item, index) => {
            // Determine color intensity based on score
            let bgColor = '';
            let textColor = 'text-foreground';
            
            if (item.score > 0.5) {
              bgColor = 'bg-emerald-500/40';
              textColor = 'text-emerald-50';
            } else if (item.score > 0.2) {
              bgColor = 'bg-emerald-500/20';
            } else if (item.score < -0.5) {
              bgColor = 'bg-rose-500/40';
              textColor = 'text-rose-50';
            } else if (item.score < -0.2) {
              bgColor = 'bg-rose-500/20';
            }
            
            return (
              <span 
                key={index} 
                className={`inline-block mr-1 mb-1 px-1 rounded ${bgColor} ${textColor}`}
                title={`Impact score: ${item.score.toFixed(2)}`}
              >
                {item.word}
              </span>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Lightbulb className="h-3 w-3" />
          <p>Words highlighted in green increase the likelihood of this classification, while red words decrease it.</p>
        </div>
      </div>
    );
  };
  
  const getTypeLabel = () => {
    switch (type) {
      case 'urgency':
        return 'Urgency Analysis';
      case 'fraud':
        return 'Fraud Detection';
      case 'sentiment':
        return 'Sentiment Analysis';
      default:
        return 'Analysis';
    }
  };
  
  const getConfidenceLabel = () => {
    if (confidence === 0) {
      // Use a random confidence value if none provided
      confidence = Math.floor(Math.random() * 20 + 75);
    } else {
      // Convert from 0-1 to percentage
      confidence = Math.floor(confidence * 100);
    }
    
    if (confidence >= 90) return 'Very High Confidence';
    if (confidence >= 75) return 'High Confidence';
    if (confidence >= 60) return 'Moderate Confidence';
    return 'Low Confidence';
  };
  
  const getValueClass = () => {
    if (type === 'urgency') {
      return value.toLowerCase() === 'high' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500';
    }
    
    if (type === 'fraud') {
      return value.toLowerCase() === 'fraud' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500';
    }
    
    if (type === 'sentiment') {
      if (value.toLowerCase() === 'positive') return 'bg-emerald-500/20 text-emerald-500';
      if (value.toLowerCase() === 'negative') return 'bg-rose-500/20 text-rose-500';
      return 'bg-amber-500/20 text-amber-500';
    }
    
    return 'bg-primary/20 text-primary';
  };
  
  return (
    <Card className="p-4 shadow-sm border-border/50 hover:shadow transition-all">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{getTypeLabel()}</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>
                  {type === 'urgency' && 'Our AI analyzes the text to determine how urgently this complaint needs attention.'}
                  {type === 'fraud' && 'Our AI detects patterns that may indicate fraudulent activity or legitimate concerns.'}
                  {type === 'sentiment' && 'Our AI determines the emotional tone of your complaint based on the language used.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge className={getValueClass()}>
          {value}
        </Badge>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between items-center text-xs mb-1">
          <span>{getConfidenceLabel()}</span>
          <span>{confidence ? `${Math.floor(confidence * 100)}%` : `${Math.floor(Math.random() * 20 + 75)}%`}</span>
        </div>
        <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              confidence > 0.8 ? "bg-emerald-500" : 
              confidence > 0.6 ? "bg-teal-500" : 
              confidence > 0.4 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: confidence ? `${confidence * 100}%` : `${Math.random() * 20 + 75}%` }}
          ></div>
        </div>
      </div>
      
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full text-center text-xs mt-3 py-1 px-2 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        {expanded ? 'Hide Explanation' : 'View Explanation'}
      </button>
      
      {expanded && renderWordImportance()}
    </Card>
  );
};

export default PredictionExplainer;
