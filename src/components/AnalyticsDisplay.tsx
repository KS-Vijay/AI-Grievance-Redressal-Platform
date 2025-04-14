
import { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { RefreshCcw, TrendingUp, AlertCircle, CheckCircle2, Shield, Clock8 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsDisplayProps {
  resolvedPercentage?: number;
  urgentCases?: number;
}

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

const AnalyticsDisplay = ({ resolvedPercentage = 80, urgentCases = 12 }: AnalyticsDisplayProps) => {
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
      // Use dummy data if API fails
      setAnalytics({
        totalComplaints: 24,
        resolvedPercentage: resolvedPercentage,
        urgentCases: urgentCases,
        fraudCases: 5,
        avgResponseTime: 2.4,
        categoryCounts: {
          "product": 35,
          "payment": 25,
          "employee": 18,
          "vendor": 12,
          "legal": 10
        },
        sentimentCounts: {
          "positive": 30,
          "negative": 45,
          "neutral": 25
        },
        monthlyComplaints: [
          { name: 'Jan', count: 12 },
          { name: 'Feb', count: 19 },
          { name: 'Mar', count: 15 },
          { name: 'Apr', count: 22 },
          { name: 'May', count: 18 },
          { name: 'Jun', count: 8 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const prepareChartData = (data: Record<string, number> = {}) => {
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#555" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    );
  };

  if (loading && !analytics) {
    return (
      <GlassmorphicCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Analytics Dashboard</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </GlassmorphicCard>
    );
  }

  // Use the fetched analytics or fallback to props
  const totalComplaints = analytics?.totalComplaints || 24;
  const actualResolvedPercentage = analytics?.resolvedPercentage || resolvedPercentage;
  const actualUrgentCases = analytics?.urgentCases || urgentCases;
  const fraudCases = analytics?.fraudCases || 5;
  const avgResponseTime = analytics?.avgResponseTime || 2.4;
  
  const categoryData = analytics ? prepareChartData(analytics.categoryCounts) : [];
  const sentimentData = analytics ? prepareChartData(analytics.sentimentCounts) : [];
  const monthlyData = analytics?.monthlyComplaints || [];

  return (
    <GlassmorphicCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Analytics Dashboard</h3>
        </div>
        <Button onClick={fetchAnalytics} size="sm" variant="outline" className="hover:bg-primary/10">
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-card/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">Total Complaints</p>
                </div>
                <p className="text-2xl font-bold">{totalComplaints}</p>
                <div className="mt-2 h-1 w-full bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="bg-card/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium">Urgent Cases</p>
                </div>
                <p className="text-2xl font-bold">{actualUrgentCases}</p>
                <div className="mt-2 h-1 w-full bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(actualUrgentCases / totalComplaints) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-medium mb-4">Monthly Complaints</h4>
            <div className="h-[240px] w-full bg-background/10 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(0,0,0,0.6)" fontSize={12} tickMargin={10} />
                  <YAxis stroke="rgba(0,0,0,0.6)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderColor: '#2DD4BF',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }} 
                  />
                  <Bar dataKey="count" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-card/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <p className="text-sm font-medium">Fraud Cases</p>
                </div>
                <p className="text-2xl font-bold">{fraudCases}</p>
                <div className="mt-2 h-1 w-full bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(fraudCases / totalComplaints) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-card/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock8 className="w-4 h-4 text-blue-500" />
                  <p className="text-sm font-medium">Avg Response Time</p>
                </div>
                <p className="text-2xl font-bold">{avgResponseTime.toFixed(1)} hrs</p>
                <div className="mt-2 h-1 w-full bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-medium mb-4">Categories</h4>
            <div className="h-[240px] bg-background/10 rounded-lg p-4">
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
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Count']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#2DD4BF',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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

            <h4 className="text-lg font-medium mb-4 mt-6">Sentiment Analysis</h4>
            <div className="h-[240px] bg-background/10 rounded-lg p-4">
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
                      labelLine={false}
                      label={renderCustomizedLabel}
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
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#2DD4BF',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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
    </GlassmorphicCard>
  );
};

export default AnalyticsDisplay;
