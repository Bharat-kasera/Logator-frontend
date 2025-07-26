import React from 'react';
import { Box, Typography } from '@mui/material';
import AssetDebug from './AssetDebug';

const Analytics: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 p-2">
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 3,
              borderRadius: 1,
              height: '100%',
            }}
          >
            <Typography variant="h6">Visitor Trends</Typography>
            {/* Chart component will go here */}
          </Box>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 3,
              borderRadius: 1,
              height: '100%',
            }}
          >
            <Typography variant="h6">Department Statistics</Typography>
            {/* Chart component will go here */}
          </Box>
        </div>
      </div>
      {/* Asset Debug Tool for Development */}
      <Box sx={{ mt: 6 }}>
        <AssetDebug />
      </Box>
    </Box>
  );
};

export default Analytics;

