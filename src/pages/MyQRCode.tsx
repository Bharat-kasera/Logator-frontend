import React, { useState, useRef } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Button, Paper, Stack } from '@mui/material';
import QRCode from 'react-qr-code';
import { useAuth } from '../contexts/AuthContext';

const MyQRCode: React.FC = () => {
  const { user } = useAuth();
  const qrRef = useRef<SVGSVGElement | null>(null);

  const [options, setOptions] = useState({
    download: false,
    whatsapp: false,
    email: false,
  });

  const userId = user?.id || 'unknown';
  const qrValue = `https://yourapp.com/user/${userId}`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, [event.target.name]: event.target.checked });
  };

  const handleSubmit = () => {
    if (options.download && qrRef.current) {
      const svg = qrRef.current;
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-qrcode.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
    if (options.whatsapp) {
      const whatsappUrl = `https://wa.me/?text=Here%20is%20my%20QR%20code:%20${encodeURIComponent(qrValue)}`;
      window.open(whatsappUrl, '_blank');
    }
    if (options.email) {
      const mailto = `mailto:?subject=My%20QR%20Code&body=Here%20is%20my%20QR%20code:%20${encodeURIComponent(qrValue)}`;
      window.open(mailto, '_blank');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, display: 'flex', alignItems: 'center', minWidth: 600 }}>
        <Box>
          <QRCode
            value={qrValue}
            size={256}
            ref={qrRef}
          />
          <Typography variant="body2" mt={2} align="center">
            User ID: {userId}
          </Typography>
        </Box>
        <Box ml={6}>
          <Typography variant="h5" mb={2}>Share Options</Typography>
          <Stack spacing={1}>
            <FormControlLabel control={<Checkbox checked={options.download} onChange={handleChange} name="download" />} label="Download" />
            <FormControlLabel control={<Checkbox checked={options.whatsapp} onChange={handleChange} name="whatsapp" />} label="Send to Whatsapp" />
            <FormControlLabel control={<Checkbox checked={options.email} onChange={handleChange} name="email" />} label="Send by Email" />
            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>Submit</Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default MyQRCode;
