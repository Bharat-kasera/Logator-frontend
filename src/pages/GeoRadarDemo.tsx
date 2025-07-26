import React, { useState, useRef } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const markerIcon = new L.Icon({
  iconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: iconShadow,
  shadowSize: [41, 41],
});

function AnimateRipple({ center, radius }: { center: [number, number]; radius: number }) {
  const [rippleRadius, setRippleRadius] = useState(0);
  const requestRef = useRef<number>(0);

  React.useEffect(() => {
    let start: number | null = null;
    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      // Animate from 0 to radius in 1.5 seconds
      const progress = Math.min(elapsed / 1500, 1);
      setRippleRadius(progress * radius);
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Reset after a short pause
        setTimeout(() => {
          setRippleRadius(0);
          start = null;
          requestRef.current = requestAnimationFrame(animate);
        }, 500);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [radius, center[0], center[1]]);

  return (
    <Circle
      center={center}
      radius={rippleRadius}
      pathOptions={{ color: '#2196f3', fillColor: '#2196f3', fillOpacity: 0.2, opacity: 0.5 }}
    />
  );
}

function FitMap({ center, radius }: { center: [number, number]; radius: number }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && radius) {
      // Fit bounds to 100x radius
      const bounds = L.latLng(center).toBounds(radius * 100 * 2);
      map.fitBounds(bounds, { maxZoom: 19 });
    }
  }, [center, radius, map]);
  return null;
}

const GeoRadarDemo: React.FC = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setError('Unable to retrieve your location.');
      }
    );
  };

  return (
    <Box sx={{ p: 4, maxWidth: 700, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>Geo Radar Demo</Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Button variant="contained" onClick={handleCapture}>Capture coordinate</Button>
        <TextField
          label="Radius (meters)"
          type="number"
          value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          sx={{ width: 160 }}
        />
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      {coords && (
        <Box sx={{ height: 400, width: '100%', mt: 3 }}>
          <MapContainer
            center={coords}
            zoom={16}
            maxZoom={19}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={coords} icon={markerIcon} />
            <Circle
              center={coords}
              radius={radius}
              pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.08, opacity: 0.5 }}
            />
            <AnimateRipple center={coords} radius={radius} />
            <FitMap center={coords} radius={radius} />
          </MapContainer>
        </Box>
      )}
    </Box>
  );
};

export default GeoRadarDemo;
