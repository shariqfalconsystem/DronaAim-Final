// src/components/video/timeline/TimelineMarkers.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatTime } from './video-utilities';

interface TimelineMarkersProps {
  videoDuration: number;
}

const TimelineMarkers: React.FC<TimelineMarkersProps> = ({ videoDuration }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
      <Typography variant="caption" color="textSecondary">
        {formatTime(0)}
      </Typography>
      {videoDuration > 0 &&
        [0.25, 0.5, 0.75].map((fraction) => (
          <Typography key={fraction} variant="caption" color="textSecondary">
            {formatTime(videoDuration * fraction)}
          </Typography>
        ))}
      <Typography variant="caption" color="textSecondary">
        {formatTime(videoDuration || 0)}
      </Typography>
    </Box>
  );
};

export default TimelineMarkers;
