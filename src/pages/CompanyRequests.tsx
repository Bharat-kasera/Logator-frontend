import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCompany } from "../contexts/CompanyContext";
import CompanySidePanel from "../components/CompanySidePanel";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../utils/api";

interface PendingRequest {
  id: number;
  user_id: number;
  target_id: number;
  type: string; // 'D' for Department, 'G' for Gate
  status: string;
  created_at: string;
  updated_at: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  establishment_name?: string;
  department_name?: string;
  gate_name?: string;
}

interface RequestsResponse {
  requests: PendingRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const CompanyRequests: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { selectedCompany } = useCompany();
  
  const [requestsData, setRequestsData] = useState<RequestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingRequests, setProcessingRequests] = useState<Set<number>>(new Set());
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [companyId, currentPage, statusFilter, typeFilter]);

  const fetchRequests = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      });
      
      const response = await api.get(`/companies/${companyId}/requests?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }
      
      const data = await response.json();
      setRequestsData(data);
    } catch (err: any) {
      console.error("Error fetching pending requests:", err);
      setError(err.message || "Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: number, action: 'approve' | 'deny') => {
    if (!companyId) return;
    
    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      
      const response = await api.put(`/companies/${companyId}/requests/${requestId}`, {
        action
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} request`);
      }
      
      // Refresh the requests list
      await fetchRequests();
    } catch (err: any) {
      console.error(`Error ${action}ing request:`, err);
      setError(err.message || `Failed to ${action} request`);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'D') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    } else if (type === 'G') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }
    return null;
  };

  const getTypeName = (type: string) => {
    return type === 'D' ? 'Department' : type === 'G' ? 'Gate' : 'Unknown';
  };

  const clearFilters = () => {
    setStatusFilter("pending");
    setTypeFilter("");
    setCurrentPage(1);
  };

  if (loading && !requestsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <CompanySidePanel companyName={selectedCompany?.name} />
        <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
          <LoadingSpinner size="lg" color="green" message="Loading requests..." fullScreen={false} />
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
              onClick={fetchRequests}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!requestsData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
      <CompanySidePanel companyName={selectedCompany?.name} />
      
      <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Access Requests</h1>
          <p className="text-green-600">Review and manage access requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="">All Statuses</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Types</option>
                <option value="D">Department Access</option>
                <option value="G">Gate Access</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, requestsData.pagination.total)} of {requestsData.pagination.total} requests
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {requestsData.pagination.totalPages}
          </div>
        </div>

        {/* Requests List */}
        {requestsData.requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">No access requests match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requestsData.requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        {getTypeIcon(request.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.firstname && request.lastname 
                            ? `${request.firstname} ${request.lastname}` 
                            : 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Requesting {getTypeName(request.type)} Access
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact Information</p>
                        <p className="text-sm text-gray-600">{request.phone}</p>
                        {request.email && (
                          <p className="text-sm text-gray-600">{request.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Access Details</p>
                        <p className="text-sm text-gray-600">
                          {request.establishment_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.type === 'D' ? request.department_name : request.gate_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Requested {formatDateTime(request.created_at)}
                        </span>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRequestAction(request.id, 'deny')}
                            disabled={processingRequests.has(request.id)}
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingRequests.has(request.id) ? 'Processing...' : 'Deny'}
                          </button>
                          <button
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            disabled={processingRequests.has(request.id)}
                            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingRequests.has(request.id) ? 'Processing...' : 'Approve'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {requestsData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!requestsData.pagination.hasPrev || loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: requestsData.pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === requestsData.pagination.totalPages || 
                  Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="text-gray-500">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded ${
                          page === currentPage
                            ? 'bg-green-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!requestsData.pagination.hasNext || loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {loading && requestsData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <LoadingSpinner size="lg" color="green" message="Updating..." fullScreen={false} />
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyRequests;