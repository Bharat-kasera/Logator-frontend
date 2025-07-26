import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Avatar, Alert } from '@mui/material';
import { useEstablishment } from '../contexts/EstablishmentContext';
import { useAuth } from '../contexts/AuthContext';

const CompanyUpdate: React.FC = () => {
  const { selectedEstablishment } = useEstablishment();
  const { wsToken } = useAuth();
  const [form, setForm] = useState<any>(selectedEstablishment || {});
  const [logoPreview, setLogoPreview] = useState<string | undefined>(selectedEstablishment?.logo);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedEstablishment) {
      setForm(selectedEstablishment);
      setLogoPreview(selectedEstablishment.logo);
    }
  }, [selectedEstablishment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Keep both short and DB field names in sync for gst/pan
    if (name === 'gst') {
      setForm((prev: any) => ({ ...prev, gst: value, gst_number: value }));
    } else if (name === 'pan') {
      setForm((prev: any) => ({ ...prev, pan: value, pan_number: value }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev: any) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoPreview(ev.target?.result as string);
        setForm((prev: any) => ({ ...prev, logo: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdated(false);
    setError(null);
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        address1: form.address1,
        address2: form.address2,
        pincode: form.pincode,
        gst_number: form.gst_number || form.gst,
        pan_number: form.pan_number || form.pan,
        logo: form.logo,
        latitude: form.latitude,
        longitude: form.longitude,
        plan: form.plan,
      };
      const res = await fetch(`/api/establishments/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': wsToken ? `Bearer ${wsToken}` : '',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update establishment');
      }
      setUpdated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update establishment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Update Company Details
      </Typography>
      <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3, mt: 2 }}>
        {updated && <Alert severity="success" sx={{ mb: 2 }}>Establishment updated successfully!</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            name="name"
            label="Name of the Establishment"
            value={form.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            name="address1"
            label="Address 1"
            value={form.address1}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            name="address2"
            label="Address 2"
            value={form.address2}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            name="pincode"
            label="Pincode"
            value={form.pincode}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            name="gst"
            label="GST No."
            value={form.gst}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            name="pan"
            label="PAN No."
            value={form.pan}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            sx={{ mb: 2, display: 'block' }}
          >
            Upload Logo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoChange}
            />
          </Button>
          {logoPreview && (
            <Box sx={{ mb: 2 }}>
              <img src={logoPreview} alt="Logo Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', border: '2px solid #ddd' }} />
            </Box>
          )}
          <Button type="submit" variant="contained" color="primary">
            Update Changes
          </Button>
        </form>
        {updated && (
          <Typography color="green" sx={{ mt: 2 }}>
            Company details updated (mock)
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CompanyUpdate;
