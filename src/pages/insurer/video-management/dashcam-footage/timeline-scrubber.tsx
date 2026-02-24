// src/components/video/timeline/TimelineScrubber.tsx
import React, { forwardRef } from 'react';
import { Box } from '@mui/material';

interface TimelineScrubberProps {
  trimRange: [number, number];
  progress: number;
  videoDuration: number;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent, handle: 'start' | 'end') => void;
}

const TimelineScrubber = forwardRef<HTMLDivElement, TimelineScrubberProps>(
  ({ trimRange, progress, videoDuration, onClick, onMouseDown }, ref) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        sx={{
          height: '40px',
          bgcolor: '#e0e0e0',
          position: 'relative',
          cursor: 'pointer',
          mt: 0.5,
          mb: 2,
          borderRadius: '4px',
        }}
      >
        {/* Timeline markers - every 10 seconds */}
        {videoDuration > 0 &&
          [...Array(Math.ceil(videoDuration / 10) + 1)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                left: `${((i * 10) / videoDuration) * 100}%`,
                height: '100%',
                width: '1px',
                bgcolor: '#aaa',
              }}
            />
          ))}

        {/* Trim area highlight */}
        <Box
          sx={{
            position: 'absolute',
            left: `${trimRange[0]}%`,
            width: `${trimRange[1] - trimRange[0]}%`,
            height: '100%',
            bgcolor: 'rgba(131, 216, 96, 0.7)',
            zIndex: 1,
          }}
        />

        {/* Current progress indicator */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            bgcolor: 'rgba(0, 51, 80, 0.3)',
            zIndex: 0,
          }}
        />

        {/* Current position handle */}
        <Box
          sx={{
            position: 'absolute',
            left: `${progress}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '24px',
            borderRadius: '4px',
            bgcolor: '#003350',
            zIndex: 2,
          }}
        />

        {/* Trim start handle */}
        <Box
          sx={{
            position: 'absolute',
            left: `${trimRange[0]}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '40px',
            bgcolor: '#83D860',
            borderRadius: '4px',
            cursor: 'ew-resize',
            zIndex: 3,
            '&:hover': {
              bgcolor: '#72c24f',
            },
          }}
          onMouseDown={(e) => onMouseDown(e, 'start')}
        />

        {/* Trim end handle */}
        <Box
          sx={{
            position: 'absolute',
            left: `${trimRange[1]}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '40px',
            bgcolor: '#83D860',
            borderRadius: '4px',
            cursor: 'ew-resize',
            zIndex: 3,
            '&:hover': {
              bgcolor: '#72c24f',
            },
          }}
          onMouseDown={(e) => onMouseDown(e, 'end')}
        />
      </Box>
    );
  }
);

export default TimelineScrubber;
