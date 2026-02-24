import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const VideoDropdown = ({ event }: any) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 300,
        padding: 2,
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {event.title}
      </Typography>
      <Box sx={{ width: '100%', height: 150, backgroundColor: 'black', marginBottom: 2 }}>
        {/* Replace this with actual video component */}
        <Typography variant="body2" color="white" textAlign="center" lineHeight="150px">
          Video Placeholder
        </Typography>
      </Box>
      <Typography variant="body2">{event.time}</Typography>
      {/* Add more event details here */}
    </Paper>
  );
};

export default VideoDropdown;
