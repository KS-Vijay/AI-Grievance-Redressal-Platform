import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import GlassmorphicCard from './GlassmorphicCard';

interface ComplaintFormProps {
  setComplaintId: (id: string | null) => void;
}

const ComplaintForm = ({ setComplaintId }: ComplaintFormProps) => {
  const [complaint, setComplaint] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!complaint || !category) {
      toast.error('Please fill all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Attempting fetch to http://localhost:8000/submit-complaint", { text: complaint, category });
      const response = await fetch("http://127.0.0.1:8000/submit-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: complaint, category })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setComplaintId(data.complaint_id);  // Call the prop function
      setComplaint('');
      setCategory('');
      toast.success('Complaint submitted successfully');
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error('Failed to submit complaint. Please try again.');
      setComplaintId(null);  // Reset on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassmorphicCard>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">Submit Complaint</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="complaint" className="block text-sm font-medium">
              What's your issue?
            </label>
            <Textarea
              id="complaint"
              placeholder="Describe your grievance here..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              className="h-32 resize-none bg-background/50 focus:ring-2 focus:ring-teal transition-all"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="bg-background/50 focus:ring-2 focus:ring-teal transition-all">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product/Service Issues</SelectItem>
                <SelectItem value="payment">Payment Disputes</SelectItem>
                <SelectItem value="employee">Employee Concerns</SelectItem>
                <SelectItem value="vendor">Vendor Problems</SelectItem>
                <SelectItem value="legal">Legal/Compliance Issues</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-teal hover:bg-teal/90 transition-all transform hover:-translate-y-1 hover:glow-teal"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : 'Submit'}
          </Button>
        </form>
      </div>
    </GlassmorphicCard>
  );
};

export default ComplaintForm;