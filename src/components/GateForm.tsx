import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Gate {
  id: number;
  name: string;
  geofencing: boolean;
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
}

interface GateFormProps {
  establishmentId: string;
  editingGate?: Gate | null;
  onGateCreated: (gate: Gate) => void;
  onGateUpdated: (gate: Gate) => void;
  onCancel: () => void;
}

// Map click handler component
function MapClickHandler({ 
  onMapClick, 
  position 
}: { 
  onMapClick: (latlng: LatLng) => void;
  position: [number, number] | null;
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

// Map updater component for smooth zoom and center updates
function MapUpdater({ 
  center, 
  radius, 
  shouldUpdate,
  onUpdateComplete
}: { 
  center: [number, number] | null;
  radius: number;
  shouldUpdate: boolean;
  onUpdateComplete?: () => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (center && shouldUpdate) {
      // Create bounds based on the radius to ensure proper zoom level
      const bounds = L.latLng(center).toBounds(radius * 4); // Multiply by 4 for better view
      map.fitBounds(bounds, { 
        maxZoom: 18,
        padding: [20, 20] // Add some padding
      });
      
      // Call the completion callback after a small delay to ensure the animation completes
      const timer = setTimeout(() => {
        onUpdateComplete?.();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [center, radius, shouldUpdate, map, onUpdateComplete]);

  return null;
}

const GateForm: React.FC<GateFormProps> = ({
  establishmentId,
  editingGate,
  onGateCreated,
  onGateUpdated,
  onCancel
}) => {
  const { wsToken } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    geofencing: false,
    latitude: null as number | null,
    longitude: null as number | null,
    radius: 50
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [shouldUpdateMap, setShouldUpdateMap] = useState(false);

  // Initialize form data if editing
  useEffect(() => {
    if (editingGate) {
      setFormData({
        name: editingGate.name,
        geofencing: editingGate.geofencing,
        latitude: editingGate.latitude ?? null,
        longitude: editingGate.longitude ?? null,
        radius: editingGate.radius || 50
      });
      
      if (editingGate.latitude && editingGate.longitude) {
        const position: [number, number] = [editingGate.latitude, editingGate.longitude];
        setMapCenter(position);
        setMarkerPosition(position);
        setShouldUpdateMap(true);
      }
    }
  }, [editingGate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleMapClick = (latlng: LatLng) => {
    if (formData.geofencing) {
      const position: [number, number] = [latlng.lat, latlng.lng];
      setMarkerPosition(position);
      setFormData(prev => ({
        ...prev,
        latitude: latlng.lat,
        longitude: latlng.lng
      }));
      setShouldUpdateMap(true); // Trigger zoom when user clicks on map
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      setError('');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition: [number, number] = [latitude, longitude];
          setMapCenter(newPosition);
          setMarkerPosition(newPosition);
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          setShouldUpdateMap(true); // Trigger map zoom
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get current location. Please click on the map to set coordinates.');
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setError('Geolocation is not supported by this browser. Please click on the map to set coordinates.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Gate name is required');
      return;
    }

    if (formData.geofencing && (!formData.latitude || !formData.longitude)) {
      setError('Please set coordinates for geofencing');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        establishment_id: parseInt(establishmentId),
        name: formData.name.trim(),
        geofencing: formData.geofencing,
        latitude: formData.geofencing ? formData.latitude : null,
        longitude: formData.geofencing ? formData.longitude : null,
        radius: formData.geofencing ? formData.radius : null
      };

      const url = editingGate ? `/api/gates/${editingGate.id}` : '/api/gates';
      const method = editingGate ? 'PUT' : 'POST';

      const response = editingGate 
        ? await api.put(`/gates/${editingGate.id}`, requestBody, {
            headers: { 'Authorization': `Bearer ${wsToken}` }
          })
        : await api.post('/gates', requestBody, {
            headers: { 'Authorization': `Bearer ${wsToken}` }
          });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save gate');
      }

      const savedGate = await response.json();
      
      if (editingGate) {
        onGateUpdated(savedGate);
      } else {
        onGateCreated(savedGate);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingGate ? 'Edit Gate' : 'Add New Gate'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gate Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Gate Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter gate name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            required
          />
        </div>

        {/* Geofencing Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="geofencing"
            name="geofencing"
            checked={formData.geofencing}
            onChange={handleInputChange}
            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
          />
          <label htmlFor="geofencing" className="ml-2 text-sm font-medium text-gray-700">
            Enable Geofencing
          </label>
        </div>

        {/* Geofencing Configuration */}
        {formData.geofencing && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Set Location & Radius</h4>
              
              {/* Current Location Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {locationLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use Current Location
                    </>
                  )}
                </button>
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude || ''}
                    onChange={handleInputChange}
                    step="any"
                    placeholder="Click on map to set"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude || ''}
                    onChange={handleInputChange}
                    step="any"
                    placeholder="Click on map to set"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    readOnly
                  />
                </div>
              </div>

              {/* Radius */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius (meters): {formData.radius}m
                </label>
                <input
                  type="range"
                  name="radius"
                  min="10"
                  max="500"
                  step="10"
                  value={formData.radius}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10m</span>
                  <span>500m</span>
                </div>
              </div>

              {/* Map */}
              <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler 
                    onMapClick={handleMapClick} 
                    position={markerPosition}
                  />
                  <MapUpdater 
                    center={markerPosition} 
                    radius={formData.radius} 
                    shouldUpdate={shouldUpdateMap}
                    onUpdateComplete={() => setShouldUpdateMap(false)}
                  />
                  {markerPosition && formData.radius && (
                    <Circle
                      center={markerPosition}
                      radius={formData.radius}
                      pathOptions={{
                        color: '#f97316',
                        fillColor: '#f97316',
                        fillOpacity: 0.2
                      }}
                    />
                  )}
                </MapContainer>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                Click on the map to set the gate location. The orange circle shows the geofencing area.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingGate ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                </svg>
                {editingGate ? 'Update Gate' : 'Create Gate'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default GateForm; 