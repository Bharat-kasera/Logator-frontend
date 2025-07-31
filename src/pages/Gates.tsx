import React, { useEffect, useState } from 'react';
import { useEstablishment } from '../contexts/EstablishmentContext';
import type { Establishment } from '../contexts/EstablishmentContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import InviteUserModal from '../components/InviteUserModal';
import { api } from '../utils/api';

interface Gate {
  id: number;
  name: string;
  geofencing: boolean;
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
}

const Gates: React.FC = () => {
  const { selectedEstablishment, setSelectedEstablishment } = useEstablishment();
  const { wsToken } = useAuth();
  const navigate = useNavigate();
  const [gates, setGates] = useState<Gate[]>([]);
  const [gateName, setGateName] = useState('');
  const [geofencingEnabled, setGeofencingEnabled] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '', radius: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingGate, setEditingGate] = useState<Gate | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGateForInvite, setSelectedGateForInvite] = useState<Gate | null>(null);
  const [availableEstablishments, setAvailableEstablishments] = useState<Establishment[]>([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);

  // Plan logic - ensure we have a valid plan number
  const plan = Number(selectedEstablishment?.plan) || 1; // Convert to number and default to Basic if undefined
  const maxGates = plan === 1 ? 1 : Infinity; // Basic: 1 gate, Pro & Enterprise: unlimited
  const isBasic = plan === 1;
  const isPro = plan === 2;

  useEffect(() => {
    if (!selectedEstablishment) {
      fetchAvailableEstablishments();
      return;
    }
    fetchGates();
  }, [selectedEstablishment, wsToken]);

  const fetchAvailableEstablishments = async () => {
    setLoadingEstablishments(true);
    try {
      const response = await api.get('/establishments/my-establishments', {
        headers: { 'Authorization': `Bearer ${wsToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableEstablishments(data);
      }
    } catch (err) {
      console.error('Failed to fetch establishments:', err);
    } finally {
      setLoadingEstablishments(false);
    }
  };

  const handleEstablishmentSelect = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
  };

  const fetchGates = async () => {
    if (!selectedEstablishment?.id) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/gates/${selectedEstablishment.id}`, {
        headers: { 'Authorization': `Bearer ${wsToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGates(data);
      } else {
        const errorText = await response.text();
        console.error('Gates API error:', response.status, errorText);
        throw new Error(`Failed to fetch gates: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching gates:', err);
      setError('Failed to fetch gates');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGateName('');
    setGeofencingEnabled(false);
    setCoordinates({ lat: '', lng: '', radius: '' });
    setEditingGate(null);
  };

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates(prev => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          }));
        },
        () => {
          // Fallback to manual input
          const lat = window.prompt('Enter latitude (e.g., 28.6139):');
          const lng = window.prompt('Enter longitude (e.g., 77.2090):');
          if (lat && lng) {
            setCoordinates(prev => ({ ...prev, lat, lng }));
          }
        }
      );
    } else {
      const lat = window.prompt('Enter latitude (e.g., 28.6139):');
      const lng = window.prompt('Enter longitude (e.g., 77.2090):');
      if (lat && lng) {
        setCoordinates(prev => ({ ...prev, lat, lng }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!gateName.trim() || gates.length >= maxGates) return;
    
    if (geofencingEnabled && (!coordinates.lat || !coordinates.lng || !coordinates.radius)) {
      setError('❌ Please capture coordinates and enter radius for geofencing');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const requestBody = {
        establishment_id: selectedEstablishment?.id,
        name: gateName.trim(),
        geofencing: geofencingEnabled,
        latitude: geofencingEnabled ? parseFloat(coordinates.lat) : null,
        longitude: geofencingEnabled ? parseFloat(coordinates.lng) : null,
        radius: geofencingEnabled ? parseInt(coordinates.radius) : null
      };

      const response = await api.post('/gates', requestBody, {
        headers: {
          'Authorization': `Bearer ${wsToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add gate');
      }
      
      const newGate = await response.json();
      setGates([...gates, newGate]);
      resetForm();
      setSuccess('✅ Gate added successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const error = err as Error;
      setError(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingGate || !gateName.trim()) return;
    
    if (geofencingEnabled && (!coordinates.lat || !coordinates.lng || !coordinates.radius)) {
      setError('❌ Please capture coordinates and enter radius for geofencing');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const requestBody = {
        name: gateName.trim(),
        geofencing: geofencingEnabled,
        latitude: geofencingEnabled ? parseFloat(coordinates.lat) : null,
        longitude: geofencingEnabled ? parseFloat(coordinates.lng) : null,
        radius: geofencingEnabled ? parseInt(coordinates.radius) : null
      };

      const response = await api.put(`/gates/${editingGate.id}`, requestBody, {
        headers: {
          'Authorization': `Bearer ${wsToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update gate');
      }
      
      const updatedGate = { ...editingGate, ...requestBody };
      setGates(gates.map(g => g.id === editingGate.id ? updatedGate : g));
      resetForm();
      setSuccess('✅ Gate updated successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const error = err as Error;
      setError(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gate: Gate) => {
    setEditingGate(gate);
    setGateName(gate.name);
    setGeofencingEnabled(gate.geofencing);
    setCoordinates({
      lat: gate.latitude?.toString() || '',
      lng: gate.longitude?.toString() || '',
      radius: gate.radius?.toString() || ''
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this gate?')) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.delete(`/gates/${id}`, {
        headers: { 'Authorization': `Bearer ${wsToken}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete gate');
      }
      
      setGates(gates.filter(g => g.id !== id));
      setSuccess('✅ Gate deleted successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const error = err as Error;
      setError(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = () => {
    const plan = selectedEstablishment?.plan;
    const planNum = Number(plan); // Convert to number to handle string/number mismatch
    if (planNum === 1) return 'Basic';
    if (planNum === 2) return 'Pro';
    if (planNum === 3) return 'Enterprise';
    return 'Unknown';
  };

  const getPlanDescription = () => {
    const plan = selectedEstablishment?.plan;
    const planNum = Number(plan); // Convert to number to handle string/number mismatch
    if (planNum === 1) return 'Basic plan allows up to 1 gate';
    if (planNum === 2) return 'Pro plan allows unlimited gates';
    if (planNum === 3) return 'Enterprise plan allows unlimited gates';
    return 'Unknown plan limits';
  };

  if (!selectedEstablishment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span onClick={() => navigate('/dashboard')} className="ml-3 text-xl font-bold text-gray-900 cursor-pointer">Logator.io</span>
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Manage <span className="text-orange-500">Gates</span>
            </h1>
            <p className="text-lg text-gray-600">
              Select an establishment to manage its gates
            </p>
          </div>

          {loadingEstablishments ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : availableEstablishments.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select an Establishment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableEstablishments.map((establishment) => (
                  <div
                    key={establishment.id}
                    onClick={() => handleEstablishmentSelect(establishment)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{establishment.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{establishment.address1}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {establishment.plan === 1 ? 'Basic' : establishment.plan === 2 ? 'Pro' : establishment.plan === 3 ? 'Enterprise' : 'Unknown'} Plan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No establishments found</h3>
              <p className="text-gray-600 mb-4">Create your first establishment to start managing gates</p>
              <button
                onClick={() => navigate('/create-establishment')}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create Your First Establishment
              </button>
            </div>
          )}
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
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <span onClick={() => navigate('/dashboard')} className="ml-3 text-xl font-bold text-gray-900 cursor-pointer">Logator.io</span>
              </div>
              <div className="ml-8 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Current:</span>
                <div className="flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium">{selectedEstablishment.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedEstablishment(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
              >
                Switch Establishment
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Manage <span className="text-orange-500">Gates</span>
          </h1>
          <p className="text-lg text-gray-600">
            Control access points with geofencing for {selectedEstablishment.name}
          </p>
        </div>

        {/* Plan Information */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Plan Information</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isBasic ? 'bg-gray-100 text-gray-800' :
              isPro ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {getPlanName()} Plan
            </span>
          </div>
          <p className="text-gray-600 mb-4">{getPlanDescription()}</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gates used:</span>
              <span className="font-medium text-gray-900">
                {gates.length} / {maxGates === Infinity ? '∞' : maxGates}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  gates.length >= maxGates ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ 
                  width: maxGates === Infinity ? '20%' : `${(gates.length / maxGates) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg">
            {success}
          </div>
        )}

        {/* Add/Edit Gate Form */}
        {(editingGate || gates.length < maxGates) && (
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingGate ? 'Edit Gate' : 'Add New Gate'}
            </h3>
          
          <div className="space-y-6">
            {/* Gate Name */}
            <div>
              <label htmlFor="gateName" className="block text-sm font-medium text-gray-700 mb-2">
                Gate Name *
              </label>
              <input
                type="text"
                id="gateName"
                value={gateName}
                onChange={(e) => setGateName(e.target.value)}
                placeholder="Enter gate name"
                disabled={!editingGate && gates.length >= maxGates}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Geofencing Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="geofencing"
                checked={geofencingEnabled}
                onChange={(e) => setGeofencingEnabled(e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor="geofencing" className="ml-2 text-sm font-medium text-gray-700">
                Enable Geofencing
              </label>
            </div>

            {/* Geofencing Configuration */}
            {geofencingEnabled && (
              <div className="bg-orange-50 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Geofencing Configuration</h4>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleCaptureLocation}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Capture Current Location
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={coordinates.lat}
                      onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
                      placeholder="28.6139"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={coordinates.lng}
                      onChange={(e) => setCoordinates(prev => ({ ...prev, lng: e.target.value }))}
                      placeholder="77.2090"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Radius (meters)</label>
                    <input
                      type="number"
                      value={coordinates.radius}
                      onChange={(e) => setCoordinates(prev => ({ ...prev, radius: e.target.value }))}
                      placeholder="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <p className="text-sm text-gray-600">
                    <strong>Geofencing</strong> allows automatic check-in/check-out when visitors enter or leave the specified area.
                    Set a radius that covers your gate area effectively.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={editingGate ? handleUpdate : handleSubmit}
                disabled={(!editingGate && gates.length >= maxGates) || !gateName.trim() || loading}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingGate ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                    </svg>
                    {editingGate ? 'Update Gate' : 'Add Gate'}
                  </>
                )}
              </button>
              
              {editingGate && (
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

          </div>
        </div>
        )}

        {/* Plan Limit Reached Message */}
        {!editingGate && gates.length >= maxGates && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Plan Limit Reached</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>You have reached the maximum number of gates for your {getPlanName()} plan. To add more gates, consider upgrading to a higher plan.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/subscriptions')}
                    className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gates List */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Gates</h3>
          </div>
          
          {loading && gates.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500">Loading gates...</p>
            </div>
          ) : gates.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-gray-500 mb-4">No gates yet</p>
              <p className="text-sm text-gray-400">Create your first gate to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {gates.map((gate) => (
                <div key={gate.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{gate.name}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              gate.geofencing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {gate.geofencing ? '✓ Geofencing Enabled' : 'Geofencing Disabled'}
                            </span>
                          </div>
                          {gate.geofencing && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Latitude:</span> {gate.latitude}
                              </div>
                              <div>
                                <span className="font-medium">Longitude:</span> {gate.longitude}
                              </div>
                              <div>
                                <span className="font-medium">Radius:</span> {gate.radius}m
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedGateForInvite(gate);
                          setShowInviteModal(true);
                        }}
                        disabled={loading}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Invite user as receptionist"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(gate)}
                        disabled={loading}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit gate"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(gate.id)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete gate"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedGateForInvite(null);
        }}
        onInviteSent={() => {
          setSuccess('Invitation sent successfully!');
          setTimeout(() => setSuccess(''), 3000);
        }}
        preSelectedGateId={selectedGateForInvite?.id}
      />
    </div>
  );
};

export default Gates;

