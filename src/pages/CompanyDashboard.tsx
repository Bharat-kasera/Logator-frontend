import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCompany } from "../contexts/CompanyContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import CompanySidePanel from "../components/CompanySidePanel";

interface Company {
  id: number;
  name: string;
  description?: string;
  uuid: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface Establishment {
  id: number;
  name: string;
  location?: string;
  company_id: number;
}

interface PendingRequest {
  id: number;
  firstname: string;
  lastname: string;
  status: string;
}

interface CompanyDashboardData {
  company: Company;
  establishments: Establishment[];
  stats: {
    total_visitors: number;
    today_visitors: number;
  };
  pendingRequests: PendingRequest[];
}

const CompanyDashboard: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { wsToken } = useAuth();
  const { setSelectedCompany } = useCompany();
  
  const [dashboardData, setDashboardData] = useState<CompanyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyDashboard = async () => {
      if (!companyId || !wsToken) {
        console.log("❌ Missing companyId or wsToken:", { companyId, wsToken: !!wsToken });
        setLoading(false); // Stop loading if missing required data
        return;
      }

      console.log("🚀 Fetching company dashboard for UUID:", companyId);
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/companies/${companyId}/dashboard`, {
          headers: {
            Authorization: `Bearer ${wsToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
          
          // Set selected company (removed from useEffect deps to prevent infinite loop)
          if (setSelectedCompany) {
            setSelectedCompany(data.company);
          }
          
          console.log("✅ Company dashboard loaded successfully:", data.company.name);
        } else {
          const errorText = await response.text();
          console.error("❌ API Error:", response.status, errorText);
          throw new Error(`Failed to fetch company dashboard: ${response.status} - ${errorText}`);
        }
      } catch (err) {
        console.error("❌ Error fetching company dashboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load company dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, wsToken]); // setSelectedCompany intentionally excluded to prevent infinite loop

  if (loading) {
    return (
      <LoadingSpinner 
        size="xl" 
        color="green" 
        message="Loading company dashboard..." 
        fullScreen={true} 
      />
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard/companies')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  const { company, establishments, stats, pendingRequests } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
      {/* Company Side Panel */}
      <CompanySidePanel companyName={company.name} />

      {/* Main Content */}
      <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">{company.name} Dashboard</h1>
          <p className="text-green-600">Welcome to your company management console</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(`/company/${companyId}/establishments`)}
            className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Establishment
          </button>
          <button
            onClick={() => navigate(`/company/${companyId}/analytics`)}
            className="flex items-center justify-center px-6 py-3 bg-white text-green-700 border border-green-200 rounded-lg hover:bg-green-50 font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Analytics
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Visitors */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_visitors}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Today's Visitors */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Visitors</p>
                <p className="text-3xl font-bold text-gray-900">{stats.today_visitors}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Establishments */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Establishments</p>
                <p className="text-3xl font-bold text-gray-900">{establishments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{pendingRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Establishments Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Establishments</h2>
              <button
                onClick={() => navigate(`/company/${companyId}/establishments`)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            {establishments.length > 0 ? (
              <div className="space-y-3">
                {establishments.slice(0, 3).map((establishment: Establishment, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{establishment.name}</p>
                      <p className="text-sm text-gray-600">{establishment.location || "No location set"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">Active</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-500 mb-2">No establishments yet</p>
                <button
                  onClick={() => navigate(`/company/${companyId}/establishments`)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Create your first establishment
                </button>
              </div>
            )}
          </div>

          {/* Pending Requests Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
              <button
                onClick={() => navigate(`/company/${companyId}/requests`)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((request: PendingRequest, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">{request.firstname} {request.lastname}</p>
                      <p className="text-sm text-gray-600">Pending approval</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No pending requests</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;