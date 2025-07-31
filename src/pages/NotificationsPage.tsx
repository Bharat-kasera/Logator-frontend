import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PendingRequest {
  request_id: number;
  gate_id: number;
  status: string;
  created_at: string;
  establishment_id: number;
  establishment_name: string;
  gate_name: string;
  invited_by_firstname: string;
  invited_by_lastname: string;
  invited_by_phone: string;
}

const NotificationsPage: React.FC = () => {
  const { wsToken } = useAuth();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/requests/pending', {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        setError('Failed to fetch pending invitations');
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError('Failed to fetch pending invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: number, response: 'accept' | 'decline') => {
    try {
      setRespondingTo(requestId);
      setError(null);

      const apiResponse = await fetch(`/api/requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wsToken}`,
        },
        body: JSON.stringify({ response }),
      });

      if (apiResponse.ok) {
        // Remove the request from the list since it's no longer pending
        setRequests(prev => prev.filter(req => req.request_id !== requestId));
        
        // Show success message briefly
        const successMessage = `Invitation ${response}${response === 'accept' ? 'ed' : 'd'} successfully!`;
        // Show success message (replace with toast in production)
        console.log(successMessage);
      } else {
        const errorData = await apiResponse.json();
        setError(errorData.message || `Failed to ${response} invitation`);
      }
    } catch (error) {
      console.error(`Error ${response}ing invitation:`, error);
      setError(`Failed to ${response} invitation. Please try again.`);
    } finally {
      setRespondingTo(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Pending Invitations</h1>
            <p className="mt-1 text-gray-600">
              Manage invitations to become a receptionist at various establishments
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                <p className="text-gray-600">You don't have any pending invitations at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.request_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.establishment_name}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Gate: {request.gate_name}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Invited by:</span> {request.invited_by_firstname} {request.invited_by_lastname}
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span> {request.invited_by_phone}
                          </p>
                          <p>
                            <span className="font-medium">Received:</span> {formatDate(request.created_at)}
                          </p>
                        </div>

                        <div className="mt-3 text-sm text-gray-700">
                          You've been invited to manage the <strong>{request.gate_name}</strong> gate
                          at <strong>{request.establishment_name}</strong> as a receptionist.
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleResponse(request.request_id, 'decline')}
                          disabled={respondingTo === request.request_id}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {respondingTo === request.request_id ? 'Processing...' : 'Decline'}
                        </button>
                        <button
                          onClick={() => handleResponse(request.request_id, 'accept')}
                          disabled={respondingTo === request.request_id}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {respondingTo === request.request_id ? 'Processing...' : 'Accept'}
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
    </div>
  );
};

export default NotificationsPage;