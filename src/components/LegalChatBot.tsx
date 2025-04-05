
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassmorphicCard from './GlassmorphicCard';
import { MessageSquare, Send } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const LegalChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: 'Ask me about startup legal FAQs!', 
      timestamp: new Date() 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('incorporation') || lowerInput.includes('company')) {
        response = "For incorporation, you can choose between LLC, C-Corp, or S-Corp. For tech startups seeking VC funding, C-Corp is often recommended, especially Delaware C-Corps due to favorable business laws.";
      } else if (lowerInput.includes('intellectual property') || lowerInput.includes('ip')) {
        response = "Protect your IP through patents (inventions), trademarks (brand), copyrights (creative works), and trade secrets. Always use written agreements with proper IP assignment clauses.";
      } else if (lowerInput.includes('funding') || lowerInput.includes('investor')) {
        response = "Common startup funding options include bootstrapping, friends & family, angel investors, venture capital, convertible notes, and SAFE agreements. Each has different implications for control and valuation.";
      } else {
        response = "I'm an AI assistant focused on startup legal matters. Try asking about incorporation, intellectual property protection, funding agreements, or employee contracts.";
      }
      
      const botMessage: Message = {
        sender: 'bot',
        text: response,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <GlassmorphicCard className="w-[340px] h-[400px] bg-background/90 dark:bg-sidebar/90 animate-fade-in">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold">Legal Assistant</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleChat}
                className="h-8 w-8 p-0 rounded-full"
              >
                &times;
              </Button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    message.sender === 'user' 
                      ? 'ml-auto max-w-[80%]' 
                      : 'mr-auto max-w-[80%]'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-teal text-white rounded-tr-none'
                        : 'bg-coral/10 text-foreground rounded-tl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                  <p className="text-xs text-foreground/50 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center text-foreground/70 mb-3">
                  <div className="flex space-x-1 p-2">
                    <div className="w-2 h-2 bg-coral/70 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-coral/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-coral/70 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-border p-4">
              <div className="flex">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1 mr-2 bg-background/50"
                />
                <Button
                  onClick={handleSend}
                  className="bg-coral hover:bg-coral/90 transition-transform hover:-translate-y-1"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      ) : (
        <Button
          onClick={toggleChat}
          className="rounded-full h-14 w-14 bg-teal hover:bg-teal/90 shadow-lg transition-transform hover:-translate-y-1"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default LegalChatBot;
