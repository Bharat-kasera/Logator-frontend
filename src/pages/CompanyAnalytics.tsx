import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCompany } from "../contexts/CompanyContext";
import CompanySidePanel from "../components/CompanySidePanel";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../utils/api";

interface AnalyticsSummary {
  total_visitors: number;
  today_visitors: number;
  week_visitors: number;
  month_visitors: number;
  total_establishments: number;
  total_gates: number;
  total_departments: number;
  pending_requests: number;
  avg_visit_duration: number;
}

interface DailyTrend {
  date: string;
  visitors: number;
}

interface TopEstablishment {
  name: string;
  visitor_count: number;
}

interface CheckInStatus {
  status: string;
  count: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  trends: {
    daily_visitors: DailyTrend[];
    top_establishments: TopEstablishment[];
    checkin_status: CheckInStatus[];
  };
  company_info: {
    name: string;
    created_at: string;
  };
}

const CompanyAnalytics: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { selectedCompany } = useCompany();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("month");

  useEffect(() => {
    fetchAnalytics();
  }, [companyId]);

  const fetchAnalytics = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError("");
      
      const response = await api.get(`/companies/${companyId}/analytics`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'checked_in':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'checked_out':
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <CompanySidePanel companyName={selectedCompany?.name} />
        <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
          <LoadingSpinner size="lg" color="green" message="Loading analytics..." fullScreen={false} />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <CompanySidePanel companyName={selectedCompany?.name} />
        <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { summary, trends, company_info } = analyticsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
      <CompanySidePanel companyName={selectedCompany?.name} />
      
      <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Analytics</h1>
          <p className="text-green-600">View your company's performance metrics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_visitors.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{summary.today_visitors}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{summary.week_visitors}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{summary.month_visitors}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summary.total_establishments}</p>
              <p className="text-sm text-gray-600">Establishments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.total_gates}</p>
              <p className="text-sm text-gray-600">Gates</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{summary.total_departments}</p>
              <p className="text-sm text-gray-600">Departments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{summary.pending_requests}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Establishments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Establishments</h3>
            {trends.top_establishments.length > 0 ? (
              <div className="space-y-3">
                {trends.top_establishments.map((establishment, index) => (
                  <div key={establishment.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="ml-3 text-gray-900">{establishment.name}</span>
                    </div>
                    <span className="text-gray-600 font-medium">{establishment.visitor_count} visitors</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No visitor data available</p>
            )}
          </div>

          {/* Check-in Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in Status Distribution</h3>
            {trends.checkin_status.length > 0 ? (
              <div className="space-y-3">
                {trends.checkin_status.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                        {status.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-600 font-medium">{status.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No check-in data available</p>
            )}
          </div>
        </div>

        {/* Daily Visitor Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Visitor Trends (Last 30 Days)</h3>
            <div className="text-sm text-gray-600">
              Avg. Visit Duration: {summary.avg_visit_duration} minutes
            </div>
          </div>
          
          {trends.daily_visitors.length > 0 ? (
            <div className="h-64 flex items-end space-x-1 overflow-x-auto">
              {trends.daily_visitors.map((day, index) => {
                const maxVisitors = Math.max(...trends.daily_visitors.map(d => d.visitors));
                const height = maxVisitors > 0 ? (day.visitors / maxVisitors) * 200 : 0;
                
                return (
                  <div key={day.date} className="flex flex-col items-center min-w-[40px]">
                    <div 
                      className="w-8 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                      style={{ height: `${height}px` }}
                      title={`${day.visitors} visitors on ${formatDate(day.date)}`}
                    />
                    <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                      {formatDate(day.date)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No visitor trends data available</p>
            </div>
          )}
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Peak Performance</h4>
              <p className="text-sm text-green-700">
                Your busiest establishment is{" "}
                <span className="font-medium">
                  {trends.top_establishments[0]?.name || "N/A"}
                </span>{" "}
                with {trends.top_establishments[0]?.visitor_count || 0} total visitors.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Growth Potential</h4>
              <p className="text-sm text-blue-700">
                You have {summary.total_establishments} establishment{summary.total_establishments !== 1 ? 's' : ''} with{" "}
                {summary.total_gates} gate{summary.total_gates !== 1 ? 's' : ''} managing visitor access across{" "}
                {summary.total_departments} department{summary.total_departments !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyAnalytics;