
import { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { RefreshCcw, TrendingUp, AlertCircle, CheckCircle2, Shield, Clock8 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsSummary {
  totalComplaints: number;
  resolvedPercentage: number;
  urgentCases: number;
  fraudCases: number;
  avgResponseTime: number;
  categoryCounts: Record<string, number>;
  sentimentCounts: Record<string, number>;
  monthlyComplaints: Array<{name: string, count: number}>;
}

const defaultColors = ['#2DD4BF', '#F472B6', '#38BDF8', '#FB923C', '#10B981', '#A78BFA'];

const RealTimeAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use calculated analytics from complaints if API fails
      fetchAndCalculateAnalytics();
    } finally {
      setLoading(false);
    }
  };

  const fetchAndCalculateAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/complaints');
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();
      const complaints = data.complaints || [];
      
      // Calculate analytics from complaints
      const categoryCounts: Record<string, number> = {};
      const sentimentCounts: Record<string, number> = {};
      let urgentCount = 0;
      let fraudCount = 0;
      
      complaints.forEach((complaint: any) => {
        // Category counts
        if (categoryCounts[complaint.category]) {
          categoryCounts[complaint.category]++;
        } else {
          categoryCounts[complaint.category] = 1;
        }
        
        // Sentiment counts
        if (sentimentCounts[complaint.sentiment]) {
          sentimentCounts[complaint.sentiment]++;
        } else {
          sentimentCounts[complaint.sentiment] = 1;
        }
        
        // Count urgent and fraud cases
        if (complaint.urgency?.toLowerCase() === 'high') urgentCount++;
        if (complaint.fraud?.toLowerCase() === 'fraud') fraudCount++;
      });
      
      // Create monthly data
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyComplaints = [];
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now);
        month.setMonth(now.getMonth() - i);
        const monthName = monthNames[month.getMonth()];
        
        // Count complaints for this month
        const monthlyCount = complaints.filter((c: any) => {
          const complaintDate = new Date(c.timestamp * 1000);
          return complaintDate.getMonth() === month.getMonth() && 
                 complaintDate.getFullYear() === month.getFullYear();
        }).length;
        
        monthlyComplaints.push({
          name: monthName,
          count: monthlyCount
        });
      }
      
      setAnalytics({
        totalComplaints: complaints.length,
        resolvedPercentage: 100, // All complaints are considered resolved
        urgentCases: urgentCount,
        fraudCases: fraudCount,
        avgResponseTime: 2.4, // Average response time in hours (default)
        categoryCounts,
        sentimentCounts,
        monthlyComplaints
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const prepareChartData = (data: Record<string, number>) => {
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  if (loading && !analytics) {
    return (
      <GlassmorphicCard className="w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Real-Time Analytics</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </GlassmorphicCard>
    );
  }

  if (!analytics) {
    return (
      <GlassmorphicCard className="w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Real-Time Analytics</h3>
        </div>
        <div className="text-center py-12">
          <p className="text-foreground/70">Unable to load analytics data.</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </GlassmorphicCard>
    );
  }

  const categoryData = prepareChartData(analytics.categoryCounts);
  const sentimentData = prepareChartData(analytics.sentimentCounts);

  return (
    <GlassmorphicCard className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">Real-Time Analytics</h3>
          </div>
          <Button onClick={fetchAnalytics} size="sm" variant="outline" className="hover:bg-primary/10">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card/30 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <p className="text-sm font-medium">Total Complaints</p>
            </div>
            <p className="text-2xl font-bold">{analytics.totalComplaints}</p>
            <div className="mt-2 h-1 w-full bg-background/50 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-card/30 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <p className="text-sm font-medium">Urgent Cases</p>
            </div>
            <p className="text-2xl font-bold">{analytics.urgentCases}</p>
            <div className="mt-2 h-1 w-full bg-background/50 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(analytics.urgentCases / analytics.totalComplaints) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-card/30 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-medium">Fraud Cases</p>
            </div>
            <p className="text-2xl font-bold">{analytics.fraudCases}</p>
            <div className="mt-2 h-1 w-full bg-background/50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(analytics.fraudCases / analytics.totalComplaints) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-card/30 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock8 className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-medium">Avg Response Time</p>
            </div>
            <p className="text-2xl font-bold">{analytics.avgResponseTime.toFixed(1)} hrs</p>
            <div className="mt-2 h-1 w-full bg-background/50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/20 p-4 rounded-lg border border-border/50">
            <h4 className="text-base font-medium mb-4">Monthly Complaints</h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyComplaints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(30, 42, 68, 0.8)',
                      borderColor: '#2DD4BF',
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Bar dataKey="count" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-card/20 p-4 rounded-lg border border-border/50">
              <h4 className="text-base font-medium mb-4">Categories</h4>
              <div className="h-[200px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Count']}
                        contentStyle={{
                          backgroundColor: 'rgba(30, 42, 68, 0.8)',
                          borderColor: '#2DD4BF',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-foreground/50">No category data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card/20 p-4 rounded-lg border border-border/50">
              <h4 className="text-base font-medium mb-4">Sentiment Analysis</h4>
              <div className="h-[200px]">
                {sentimentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sentimentData.map((entry, index) => {
                          const color = entry.name.toLowerCase() === 'positive' 
                            ? '#10B981' 
                            : entry.name.toLowerCase() === 'negative'
                              ? '#EF4444'
                              : '#F59E0B';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Count']}
                        contentStyle={{
                          backgroundColor: 'rgba(30, 42, 68, 0.8)',
                          borderColor: '#2DD4BF',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-foreground/50">No sentiment data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default RealTimeAnalytics;
