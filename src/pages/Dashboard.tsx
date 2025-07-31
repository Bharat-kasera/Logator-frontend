import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

interface PendingRequest {
  id: number;
  type: string;
  establishment_name: string;
  firstname?: string;
  lastname?: string;
}

interface Establishment {
  id: number;
  name: string;
  plan: number | null;
  logo?: string;
}

interface DashboardData {
  pendingRequests: PendingRequest[];
  establishments: Establishment[];
  stats: {
    total_visitors: number;
    today_visitors: number;
  };
}

const Dashboard: React.FC = () => {
  const { wsToken, user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Helper function to get plan name
  const getPlanName = (plan: number | null | undefined): string => {
    if (plan === null || plan === undefined) {
      return "Basic"; // Default to Basic if no plan specified
    }
    
    const planNumber = Number(plan);
    switch (planNumber) {
      case 1:
        return "Basic";
      case 2:
        return "Pro";
      case 3:
        return "Enterprise";
      default:
        return "Basic"; // Default fallback
    }
  };

  // Helper function to get plan color
  const getPlanColor = (plan: number | null | undefined): string => {
    const planNumber = Number(plan);
    switch (planNumber) {
      case 1:
        return "bg-gray-100 text-gray-800";
      case 2:
        return "bg-orange-100 text-orange-800";
      case 3:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800"; // Default to Basic styling
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get("/dashboard", {
        headers: {
          Authorization: `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [wsToken]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-12 w-12 text-orange-500 mx-auto"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Main dashboard content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome back,{" "}
            <span className="text-orange-500">{user?.firstname || "User"}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Here's what's happening with your visitor management system today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/create-establishment")}
            className="flex items-center justify-center px-4 sm:px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Establishment
          </button>

          <button
            onClick={() => navigate("/subscriptions")}
            className="flex items-center justify-center px-4 sm:px-6 py-3 bg-white text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
              />
            </svg>
            Manage Subscriptions
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Visitors */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">
                  Total Visitors
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {dashboardData?.stats.total_visitors || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Today's Visitors */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">
                  Today's Visitors
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {dashboardData?.stats.today_visitors || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Establishments */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">
                  Establishments
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {dashboardData?.establishments.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">
                  Pending Requests
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  {dashboardData?.pendingRequests.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Establishments List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Your Establishments
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and monitor your business locations
                </p>
              </div>
              <div className="p-4 sm:p-6">
                {dashboardData?.establishments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-orange-600"
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
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No establishments yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Create your first establishment to start managing visitors
                    </p>
                    <button
                      onClick={() => navigate("/create-establishment")}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Create Your First Establishment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.establishments.map((establishment) => (
                      <div
                        key={establishment.id}
                        className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-orange-300 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-5 h-5 text-orange-600"
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
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate text-lg">
                                  {establishment.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(establishment.plan)}`}
                                  >
                                    {getPlanName(establishment.plan)} Plan
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 flex-shrink-0">
                            <button
                              onClick={() =>
                                navigate("/dashboard/departments")
                              }
                              className="px-4 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                            >
                              Departments
                            </button>
                            <button
                              onClick={() => navigate("/dashboard/gates")}
                              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                            >
                              Gates
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Recent Notifications */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Notifications
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Latest activity and requests
                </p>
              </div>
              <div className="p-4 sm:p-6">
                {dashboardData?.pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-5 5-5-5h5V3h5v14z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.pendingRequests
                      .slice(0, 5)
                      .map((request, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-4 h-4 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {request.type === "D" ? "Department" : "Gate"}{" "}
                                invitation
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {request.establishment_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Common tasks and shortcuts
                </p>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                <button
                  onClick={() => navigate("/dashboard/departments")}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 group-hover:bg-orange-200 rounded-lg flex items-center justify-center mr-3 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      Manage Departments
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/dashboard/gates")}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 group-hover:bg-orange-200 rounded-lg flex items-center justify-center mr-3 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      Manage Gates
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/dashboard/mappings")}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 group-hover:bg-orange-200 rounded-lg flex items-center justify-center mr-3 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      User Mappings
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
