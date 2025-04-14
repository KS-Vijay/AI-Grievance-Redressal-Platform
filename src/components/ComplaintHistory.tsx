
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassmorphicCard from './GlassmorphicCard';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSearch, RefreshCcw, Info, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Complaint {
  complaint_id: string;
  category: string;
  complaint: string;
  response: string;
  sentiment: string;
  urgency: string;
  fraud: string;
  timestamp: number;
}

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/complaints');
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'negative':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    return urgency.toLowerCase() === 'high' 
      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  };

  const getFraudColor = (fraud: string) => {
    return fraud.toLowerCase() === 'fraud' 
      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const viewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  return (
    <GlassmorphicCard className="w-full overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">Complaint History</h3>
          </div>
          <Button onClick={fetchComplaints} size="sm" variant="outline" className="hover:bg-primary/10">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-foreground/70">No complaints have been submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A list of your submitted complaints</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Fraud</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.complaint_id}>
                    <TableCell className="font-medium">{complaint.complaint_id}</TableCell>
                    <TableCell>{complaint.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getSentimentColor(complaint.sentiment)}`}>
                        {complaint.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getUrgencyColor(complaint.urgency)}`}>
                        {complaint.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getFraudColor(complaint.fraud)}`}>
                        {complaint.fraud}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(complaint.timestamp)}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => viewDetails(complaint)}
                              className="hover:bg-primary/10"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {selectedComplaint && (
          <div className="mt-6 border rounded-lg p-4 bg-card/50">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-medium">Complaint Details</h4>
              <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground/70">Complaint ID:</p>
                <p className="text-sm">{selectedComplaint.complaint_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/70">Category:</p>
                <p className="text-sm">{selectedComplaint.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/70">Date:</p>
                <p className="text-sm">{formatDate(selectedComplaint.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/70">Complaint:</p>
                <p className="text-sm bg-background/50 p-2 rounded">{selectedComplaint.complaint}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/70">Response:</p>
                <p className="text-sm bg-background/50 p-2 rounded">{selectedComplaint.response}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <p className="text-xs font-medium text-foreground/70">Sentiment:</p>
                  <Badge variant="outline" className={`${getSentimentColor(selectedComplaint.sentiment)}`}>
                    {selectedComplaint.sentiment}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/70">Urgency:</p>
                  <Badge variant="outline" className={`${getUrgencyColor(selectedComplaint.urgency)}`}>
                    {selectedComplaint.urgency}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/70">Fraud:</p>
                  <Badge variant="outline" className={`${getFraudColor(selectedComplaint.fraud)}`}>
                    {selectedComplaint.fraud}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};

export default ComplaintHistory;
