import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  TextField,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import PhotoUpload from '../components/PhotoUpload';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth() as any;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country_code: '',
    email: '',
    photo: '',
    representing: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstname || '',
        lastName: user.lastname || '',
        phone: user.phone || '',
        country_code: user.country_code || '',
        email: user.email || '',
        photo: user.photo_url || '',
        representing: user.representing || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoCapture = (image: string) => {
    setFormData(prev => ({ ...prev, photo: image }));
  };

  const handlePhotoUpload = (image: string) => {
    setFormData(prev => ({ ...prev, photo: image }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        photo_url: formData.photo,
        representing: formData.representing
      };

      const wsToken = localStorage.getItem('wsToken');
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wsToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));

    } catch (err: any) {
      setSuccess(''); // clear success on error
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        width: '100%',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 'sm',
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          align="center"
          sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}
        >
          Manage Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* First Name and Last Name */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <TextField
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </Box>

          {/* Phone Number (readonly) */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {formData.country_code} {formData.phone}
            </Typography>
          </Box>

          {/* Email */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              id="email"
              label="Email Address (Optional)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              helperText={formData.email ? '' : 'No reports will be sent via email'}
            />
          </Box>

          {/* Representing */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              id="representing"
              label="Representing (Company/Organization)"
              name="representing"
              value={formData.representing}
              onChange={handleInputChange}
              required
            />
          </Box>

          {/* Photo Upload */}
          <Box sx={{ mb: 3 }}>
            <PhotoUpload
              photo={formData.photo}
              onCapture={handlePhotoCapture}
              onUpload={handlePhotoUpload}
            />
          </Box>

          {/* Submit */}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button type="submit" variant="contained" sx={{ mb: 2 }}>
              Update Profile
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;
