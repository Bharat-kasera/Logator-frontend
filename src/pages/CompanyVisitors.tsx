import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCompany } from "../contexts/CompanyContext";
import CompanySidePanel from "../components/CompanySidePanel";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../utils/api";

interface VisitorLog {
  id: number;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  purpose: string;
  status: string;
  check_in_at: string;
  check_out_at?: string;
  establishment_name?: string;
  gate_name?: string;
  department_name?: string;
  company_id: number;
  establishment_id?: number;
  gate_id?: number;
  department_id?: number;
}

interface Establishment {
  id: number;
  name: string;
}

interface VisitorResponse {
  visitors: VisitorLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  establishments: Establishment[];
}

const CompanyVisitors: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { selectedCompany } = useCompany();
  
  const [visitorData, setVisitorData] = useState<VisitorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [establishmentFilter, setEstablishmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchVisitors();
  }, [companyId, currentPage, statusFilter, establishmentFilter]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (currentPage === 1) {
        fetchVisitors();
      } else {
        setCurrentPage(1); // This will trigger fetchVisitors via the above useEffect
      }
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [search]);

  const fetchVisitors = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(establishmentFilter && { establishment: establishmentFilter }),
      });
      
      const response = await api.get(`/companies/${companyId}/visitors?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch visitor logs");
      }
      
      const data = await response.json();
      setVisitorData(data);
    } catch (err: any) {
      console.error("Error fetching visitor logs:", err);
      setError(err.message || "Failed to fetch visitor logs");
    } finally {
      setLoading(false);
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
      case 'checked_in':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'checked_out':
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'denied':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const calculateDuration = (checkIn: string, checkOut?: string) => {
    const checkInTime = new Date(checkIn);
    const checkOutTime = checkOut ? new Date(checkOut) : new Date();
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setEstablishmentFilter("");
    setCurrentPage(1);
  };

  if (loading && !visitorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <CompanySidePanel companyName={selectedCompany?.name} />
        <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
          <LoadingSpinner size="lg" color="green" message="Loading visitor logs..." fullScreen={false} />
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
              onClick={fetchVisitors}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!visitorData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
      <CompanySidePanel companyName={selectedCompany?.name} />
      
      <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Visitor Logs</h1>
          <p className="text-green-600">Track and manage visitor activity</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Statuses</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="pending">Pending</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Establishment</label>
              <select
                value={establishmentFilter}
                onChange={(e) => setEstablishmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Establishments</option>
                {visitorData.establishments.map((est) => (
                  <option key={est.id} value={est.id}>{est.name}</option>
                ))}
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
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, visitorData.pagination.total)} of {visitorData.pagination.total} visitors
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {visitorData.pagination.totalPages}
          </div>
        </div>

        {/* Visitor Logs Table */}
        {visitorData.visitors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No visitor logs found</h3>
            <p className="text-gray-600">No visitors match your current filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visitorData.visitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{visitor.visitor_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.visitor_phone}</div>
                        {visitor.visitor_email && (
                          <div className="text-sm text-gray-500">{visitor.visitor_email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.establishment_name}</div>
                        {visitor.gate_name && (
                          <div className="text-sm text-gray-500">Gate: {visitor.gate_name}</div>
                        )}
                        {visitor.department_name && (
                          <div className="text-sm text-gray-500">Dept: {visitor.department_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={visitor.purpose}>
                          {visitor.purpose}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visitor.status)}`}>
                          {getStatusText(visitor.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(visitor.check_in_at)}
                        {visitor.check_out_at && (
                          <div className="text-xs text-gray-500">
                            Out: {formatDateTime(visitor.check_out_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateDuration(visitor.check_in_at, visitor.check_out_at)}
                        {!visitor.check_out_at && (
                          <div className="text-xs text-gray-500">Active</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {visitorData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!visitorData.pagination.hasPrev || loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: visitorData.pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === visitorData.pagination.totalPages || 
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
              disabled={!visitorData.pagination.hasNext || loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {loading && visitorData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <LoadingSpinner size="lg" color="green" message="Updating..." fullScreen={false} />
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyVisitors;