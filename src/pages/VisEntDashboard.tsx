import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, TextField, Grid } from '@mui/material';
import GeoRadarDemo from './GeoRadarDemo';

const establishments = [
  { name: 'Establishment 1', gate: 'North Gate', coords: [12.9716, 77.5946] },
  { name: 'Establishment 2', gate: 'South Gate', coords: [12.9352, 77.6245] },
];

function haversineDistance([lat1, lon1]: number[], [lat2, lon2]: number[]) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const VisEntDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setError('Unable to retrieve your location.');
      }
    );
  }, []);

  const handleSelect = (establishment: string) => {
    navigate('/dashboard/visgateentry', { state: { establishment } });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select Establishment and Gate
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <TextField
          label="Radius (meters)"
          type="number"
          value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          sx={{ width: 160 }}
        />
        {userCoords && (
          <Typography color="text.secondary">
            Your location: {userCoords[0].toFixed(5)}, {userCoords[1].toFixed(5)}
          </Typography>
        )}
      </Box>
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={3}>
        {establishments.map((est, idx) => {
          let distance = null;
          let enabled = false;
          if (userCoords) {
            distance = haversineDistance(userCoords, est.coords);
            enabled = distance <= radius;
          }
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ opacity: enabled ? 1 : 0.5 }}>
                <CardContent>
                  <Typography variant="h6">{est.name}</Typography>
                  <Typography color="text.secondary">Gate: {est.gate}</Typography>
                  {userCoords && (
                    <Typography color={enabled ? 'success.main' : 'error'}>
                      Distance: {distance ? distance.toFixed(1) : '--'} m
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!enabled}
                    sx={{ mt: 2 }}
                    onClick={() => handleSelect(est.name)}
                  >
                    Enter
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <GeoRadarDemo />
      </Box>
    </Box>
  );
};

export default VisEntDashboard;
