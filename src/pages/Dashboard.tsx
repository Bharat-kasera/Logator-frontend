import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

// Interfaces are now imported from DataContext

const Dashboard: React.FC = () => {
  const { user, isInitialDataLoaded } = useAuth();
  const { 
    companies,
    establishments, 
    pendingRequests, 
    dashboardStats, 
    hasEstablishments,
    isLoadingDashboard,
    isLoadingEstablishments
  } = useData();
  const navigate = useNavigate();

  // Helper function to get primary company for redirects
  const getPrimaryCompany = () => {
    return companies.length > 0 ? companies[0] : null;
  };

  // Smart navigation functions
  const navigateToEstablishments = () => {
    const primaryCompany = getPrimaryCompany();
    if (primaryCompany?.uuid) {
      navigate(`/company/${primaryCompany.uuid}/establishments`);
    } else {
      navigate("/dashboard/companies");
    }
  };

  const navigateToDepartments = () => {
    const primaryCompany = getPrimaryCompany();
    if (primaryCompany?.uuid) {
      navigate(`/company/${primaryCompany.uuid}/dashboard`);
    } else {
      navigate("/dashboard/companies");
    }
  };

  const navigateToGates = () => {
    const primaryCompany = getPrimaryCompany();
    if (primaryCompany?.uuid) {
      navigate(`/company/${primaryCompany.uuid}/dashboard`);
    } else {
      navigate("/dashboard/companies");
    }
  };
  
  const loading = !isInitialDataLoaded || isLoadingDashboard || isLoadingEstablishments;

  // Helper function to get plan name
  const getPlanName = (plan?: number): string => {
    if (plan === undefined || plan === null) return "Basic";
    switch (plan) {
      case 1:
        return "Basic";
      case 2:
        return "Pro";
      case 3:
        return "Enterprise";
      default:
        return "Basic";
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

  if (loading) {
    return (
      <LoadingSpinner 
        size="xl" 
        color="orange" 
        message="Loading dashboard..." 
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Main dashboard content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome,{" "}
            <span className="text-orange-500">{user?.firstname || "User"}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Here's what's happening with your visitor management system today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={navigateToEstablishments}
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
            Manage Establishments
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

        {/* Stats Cards - Only show if user has establishments */}
        {hasEstablishments && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Visitors */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">
                  Total Visitors
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {dashboardStats?.total_visitors || 0}
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
                    {dashboardStats?.today_visitors || 0}
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
                    {establishments.length}
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
                    {pendingRequests.length}
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
        )}

        {/* Welcome section for users without establishments */}
        {!hasEstablishments && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-8 border border-orange-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-orange-600"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Logator.io!
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Get started by creating your first establishment to begin managing visitors, departments, and gates effectively.
              </p>
            </div>
          </div>
        )}

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
                {!hasEstablishments ? (
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
                    {establishments.map((establishment) => (
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
                              onClick={navigateToDepartments}
                              className="px-4 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                            >
                              Departments
                            </button>
                            <button
                              onClick={navigateToGates}
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
                {pendingRequests.length === 0 ? (
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
                    {pendingRequests
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

            {/* Quick Actions - Only show for users with establishments */}
            {hasEstablishments && (
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
                    onClick={navigateToDepartments}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
