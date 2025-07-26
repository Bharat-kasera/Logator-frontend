import React from 'react';
import { Button, Card, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';

const plans = [
  {
    name: 'Basic User',
    features: [
      'Create 1 Department',
      'Create 1 Gate',
      '3 Reports',
      'Data stored for 2 months',
      '100 visitor entries per month',
    ],
    buttonText: 'Choose Basic',
  },
  {
    name: 'Pro Establishment',
    features: [
      'Up to 20 Departments per establishment',
      'Up to 10 gates per establishment',
      'Geofencing',
      'Up to 10 reports',
      'Live records for 6 months',
    ],
    buttonText: 'Choose Pro',
  },
];

const SubscripEnt: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom fontWeight={700}>
        Establishment Plans
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Compare our establishment plans and select the one that fits your organization.
      </Typography>
      <Grid container spacing={4} justifyContent="center" mt={4}>
        {plans.map((plan, idx) => (
          <Grid item xs={12} md={5} key={plan.name}>
            <Card
              sx={{
                p: 4,
                boxShadow: 3,
                borderRadius: 3,
                bgcolor: '#fff',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="h5" fontWeight={600} mb={2} color={idx === 1 ? 'primary' : 'text.primary'}>
                {plan.name} Plan
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, mb: 3, width: '100%' }}>
                {plan.features.map((feature, i) => (
                  <Typography component="li" variant="body1" key={i} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ color: 'success.main', fontWeight: 700, mr: 1 }}>•</Box>
                    {feature}
                  </Typography>
                ))}
              </Box>
              <Button
                variant={idx === 1 ? 'contained' : 'outlined'}
                color="primary"
                size="large"
                sx={{ mt: 'auto', width: '100%' }}
              >
                {plan.buttonText}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SubscripEnt;
