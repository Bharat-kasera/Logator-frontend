import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEstablishment } from '../contexts/EstablishmentContext';

interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  avgDailyVisitors: number;
  peakHours: { hour: number; count: number }[];
  topDepartments: { name: string; visitors: number }[];
  topGates: { name: string; visitors: number }[];
}

const Analytics: React.FC = () => {
  const { wsToken } = useAuth();
  const { selectedEstablishment } = useEstablishment();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState('');

  useEffect(() => {
    // Use mock data for now
    setLoading(true);
    setTimeout(() => {
      setAnalytics({
        totalVisitors: 1247,
        todayVisitors: 23,
        weeklyVisitors: 156,
        monthlyVisitors: 634,
        avgDailyVisitors: 18,
        peakHours: [
          { hour: 9, count: 45 },
          { hour: 10, count: 52 },
          { hour: 11, count: 38 },
          { hour: 14, count: 42 },
          { hour: 15, count: 48 },
          { hour: 16, count: 35 }
        ],
        topDepartments: [
          { name: 'Reception', visitors: 234 },
          { name: 'Sales', visitors: 189 },
          { name: 'Marketing', visitors: 156 },
          { name: 'HR', visitors: 123 },
          { name: 'Finance', visitors: 98 }
        ],
        topGates: [
          { name: 'Main Gate', visitors: 456 },
          { name: 'North Gate', visitors: 234 },
          { name: 'South Gate', visitors: 178 },
          { name: 'West Gate', visitors: 123 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (!selectedEstablishment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-gray-500 mb-4">No establishment selected</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span 
                  onClick={() => navigate('/dashboard')} 
                  className="ml-3 text-xl font-bold text-gray-900 cursor-pointer"
                >
                  Logator.io
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analytics <span className="text-orange-500">Dashboard</span>
          </h1>
          <p className="text-lg text-gray-600">
            Visitor insights and statistics for {selectedEstablishment.name}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-lg border border-orange-100">
            {[
              { value: '1d', label: 'Today' },
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <svg
              className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalVisitors.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Visitors</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.todayVisitors}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weekly Visitors</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics.weeklyVisitors}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Daily</p>
                    <p className="text-3xl font-bold text-purple-600">{analytics.avgDailyVisitors}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Peak Hours */}
              <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                  <h3 className="text-xl font-semibold text-gray-900">Peak Hours</h3>
                  <p className="text-sm text-gray-600 mt-1">Busiest times of the day</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.peakHours.map((hour) => (
                      <div key={hour.hour} className="flex items-center">
                        <div className="w-16 text-sm text-gray-600">
                          {hour.hour}:00
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-500 h-3 rounded-full transition-all"
                              style={{
                                width: `${(hour.count / Math.max(...analytics.peakHours.map(h => h.count))) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-900 font-medium">
                          {hour.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Departments */}
              <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                  <h3 className="text-xl font-semibold text-gray-900">Top Departments</h3>
                  <p className="text-sm text-gray-600 mt-1">Most visited departments</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.topDepartments.map((dept, index) => (
                      <div key={dept.name} className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-green-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                        </div>
                        <div className="text-sm text-gray-600">
                          {dept.visitors} visitors
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Gates */}
              <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                  <h3 className="text-xl font-semibold text-gray-900">Top Gates</h3>
                  <p className="text-sm text-gray-600 mt-1">Most used entry points</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.topGates.map((gate, index) => (
                      <div key={gate.name} className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{gate.name}</p>
                        </div>
                        <div className="text-sm text-gray-600">
                          {gate.visitors} entries
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                  <h3 className="text-xl font-semibold text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600 mt-1">Download reports and data</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="font-medium text-gray-900">Visitor Report (PDF)</span>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="font-medium text-gray-900">Analytics Data (CSV)</span>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Analytics;