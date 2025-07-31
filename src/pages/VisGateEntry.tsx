import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Webcam from 'react-webcam';

interface Visitor {
  checkin_id: number;
  visitor_id: number;
  firstname?: string;
  lastname?: string;
  phone: string;
  country_code: string;
  check_in_at: string;
  check_out_at?: string;
  to_meet?: string;
  gate_name: string;
}

interface Gate {
  id: number;
  name: string;
  establishment_id: number;
  establishment_name: string;
}

const VisGateEntry: React.FC = () => {
  const location = useLocation();
  const { wsToken } = useAuth();
  const establishment = location.state?.establishment || { name: 'Establishment', id: null };
  const [activeTab, setActiveTab] = useState(0);
  const [authorizedGates, setAuthorizedGates] = useState<Gate[]>([]);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  const [checkedOutVisitors, setCheckedOutVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check-in form state
  const [phone, setPhone] = useState('+91 ');
  const [visitorName, setVisitorName] = useState('');
  const [toMeet, setToMeet] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    fetchAuthorizedGates();
  }, []);

  useEffect(() => {
    if (selectedGate) {
      if (activeTab === 1) fetchActiveVisitors();
      if (activeTab === 2) fetchCheckedOutVisitors();
    }
  }, [selectedGate, activeTab]);

  const fetchAuthorizedGates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/checkin/gates', {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthorizedGates(data.authorizedGates);
        if (data.authorizedGates.length > 0) {
          setSelectedGate(data.authorizedGates[0]);
        }
      } else {
        setError('Failed to fetch authorized gates');
      }
    } catch (error) {
      console.error('Error fetching gates:', error);
      setError('Failed to fetch authorized gates');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveVisitors = async () => {
    if (!selectedGate) return;
    
    try {
      const response = await fetch(`/api/visitors/active/${selectedGate.establishment_id}`, {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveVisitors(data.activeVisitors);
      }
    } catch (error) {
      console.error('Error fetching active visitors:', error);
    }
  };

  const fetchCheckedOutVisitors = async () => {
    if (!selectedGate) return;
    
    try {
      const response = await fetch(`/api/visitors/checked-out/${selectedGate.establishment_id}`, {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCheckedOutVisitors(data.checkedOutVisitors);
      }
    } catch (error) {
      console.error('Error fetching checked-out visitors:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!phone.trim() || !selectedGate) {
      setError('Please select a gate and enter a phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/visitors/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wsToken}`,
        },
        body: JSON.stringify({
          phone,
          gateId: selectedGate.id,
          visitorName,
          toMeet,
          establishmentId: selectedGate.establishment_id,
          photo: capturedPhoto,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Visitor checked in successfully! Check-in ID: ${data.checkinId}`);
        setPhone('+91 ');
        setVisitorName('');
        setToMeet('');
        setCapturedPhoto(null);
        setShowCamera(false);
        if (activeTab === 1) fetchActiveVisitors();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to check in visitor');
      }
    } catch (error) {
      console.error('Error checking in visitor:', error);
      setError('Failed to check in visitor');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (checkinId: number) => {
    try {
      const response = await fetch(`/api/visitors/${checkinId}/checkout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wsToken}`,
        },
        body: JSON.stringify({
          gateId: selectedGate?.id,
        }),
      });

      if (response.ok) {
        alert('Visitor checked out successfully!');
        fetchActiveVisitors();
        if (activeTab === 2) fetchCheckedOutVisitors();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to check out visitor');
      }
    } catch (error) {
      console.error('Error checking out visitor:', error);
      setError('Failed to check out visitor');
    }
  };

  const handleReverseCheckout = async (checkinId: number) => {
    try {
      const response = await fetch(`/api/visitors/${checkinId}/reverse-checkout`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        alert('Checkout reversed successfully!');
        fetchCheckedOutVisitors();
        fetchActiveVisitors();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reverse checkout');
      }
    } catch (error) {
      console.error('Error reversing checkout:', error);
      setError('Failed to reverse checkout');
    }
  };

  const handleArchive = async (checkinId: number) => {
    try {
      const response = await fetch(`/api/visitors/${checkinId}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        alert('Visitor record archived successfully!');
        fetchCheckedOutVisitors();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to archive visitor record');
      }
    } catch (error) {
      console.error('Error archiving visitor record:', error);
      setError('Failed to archive visitor record');
    }
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedPhoto(imageSrc);
      setShowCamera(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && authorizedGates.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gates...</p>
        </div>
      </div>
    );
  }

  if (authorizedGates.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">No authorized gates found. Please contact the establishment owner for access.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { label: 'Check-In' },
    { label: 'Check-Out' },
    { label: 'Checked-Out' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">
        {establishment.name || 'Visitor Management'}
      </h2>
      
      {/* Gate Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Gate
        </label>
        <select
          value={selectedGate?.id || ''}
          onChange={(e) => {
            const gate = authorizedGates.find(g => g.id === parseInt(e.target.value));
            setSelectedGate(gate || null);
          }}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {authorizedGates.map((gate) => (
            <option key={gate.id} value={gate.id}>
              {gate.name} - {gate.establishment_name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 justify-center">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${
              activeTab === idx 
                ? "bg-orange-500 text-white border-orange-500" 
                : "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-b-lg shadow p-6 border-t-0">
        {/* Check-In Tab */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Check-In Visitor</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visitor Name
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="input-field"
                  placeholder="Guest name (optional)"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Visit
                </label>
                <input
                  type="text"
                  value={toMeet}
                  onChange={(e) => setToMeet(e.target.value)}
                  className="input-field"
                  placeholder="Who to meet or purpose"
                />
              </div>
            </div>

            {/* Camera Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visitor Photo
              </label>
              {!showCamera && !capturedPhoto && (
                <button
                  onClick={() => setShowCamera(true)}
                  className="btn-secondary"
                >
                  Take Photo
                </button>
              )}
              
              {showCamera && (
                <div className="space-y-4">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full max-w-sm rounded"
                  />
                  <div className="space-x-2">
                    <button
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Capture
                    </button>
                    <button
                      onClick={() => setShowCamera(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {capturedPhoto && (
                <div className="space-y-2">
                  <img src={capturedPhoto} alt="Captured" className="w-32 h-32 object-cover rounded" />
                  <button
                    onClick={() => {
                      setCapturedPhoto(null);
                      setShowCamera(true);
                    }}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Retake
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking In...' : 'Check In Visitor'}
            </button>
          </div>
        )}

        {/* Check-Out Tab */}
        {activeTab === 1 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Active Visitors</h3>
              <button
                onClick={fetchActiveVisitors}
                className="btn-secondary"
              >
                Refresh
              </button>
            </div>
            
            {activeVisitors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active visitors found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Check-In Time</th>
                      <th className="px-4 py-2 text-left">Purpose</th>
                      <th className="px-4 py-2 text-left">Gate</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVisitors.map((visitor) => (
                      <tr key={visitor.checkin_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {visitor.firstname} {visitor.lastname}
                        </td>
                        <td className="px-4 py-2">
                          {visitor.country_code} {visitor.phone}
                        </td>
                        <td className="px-4 py-2">
                          {formatTime(visitor.check_in_at)}
                        </td>
                        <td className="px-4 py-2">
                          {visitor.to_meet || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {visitor.gate_name}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleCheckOut(visitor.checkin_id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Check Out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Checked-Out Tab */}
        {activeTab === 2 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Recently Checked-Out Visitors</h3>
              <button
                onClick={fetchCheckedOutVisitors}
                className="btn-secondary"
              >
                Refresh
              </button>
            </div>
            
            {checkedOutVisitors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recently checked-out visitors found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Check-Out Time</th>
                      <th className="px-4 py-2 text-left">Purpose</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkedOutVisitors.map((visitor) => (
                      <tr key={visitor.checkin_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {visitor.firstname} {visitor.lastname}
                        </td>
                        <td className="px-4 py-2">
                          {visitor.country_code} {visitor.phone}
                        </td>
                        <td className="px-4 py-2">
                          {visitor.check_out_at ? formatDate(visitor.check_out_at) : 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {visitor.to_meet || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          <div className="space-x-2">
                            <button
                              onClick={() => handleReverseCheckout(visitor.checkin_id)}
                              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                            >
                              Reverse
                            </button>
                            <button
                              onClick={() => handleArchive(visitor.checkin_id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisGateEntry;
