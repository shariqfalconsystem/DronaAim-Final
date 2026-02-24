// src/components/video/timeline/TimelineControls.tsx
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Download, CheckCircleOutline } from '@mui/icons-material';

interface TimelineControlsProps {
  selectedFootage: string;
  trimStartTime: string;
  trimEndTime: string;
  downloadUrl: string | null;
  processingTrim: boolean;
  trimEnabled: boolean;
  ffmpegLoaded: boolean;
  ffmpegLoading: boolean;
  videoSrc?: string;
  onTrimClick: () => void;
  onDownloadClick: () => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  selectedFootage,
  trimStartTime,
  trimEndTime,
  downloadUrl,
  processingTrim,
  trimEnabled,
  ffmpegLoaded,
  ffmpegLoading,
  videoSrc,
  onTrimClick,
  onDownloadClick,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
        Showing footage: {selectedFootage}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          Trimming: {trimStartTime} - {trimEndTime}
        </Typography>

        {downloadUrl ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<Download />}
            sx={{
              backgroundColor: '#83D860',
              color: '#003350',
              '&:hover': { backgroundColor: '#72c24f' },
              fontSize: '0.75rem',
              textTransform: 'capitalize',
            }}
            onClick={onDownloadClick}
          >
            Download
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={processingTrim ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutline />}
            sx={{
              backgroundColor: '#83D860',
              color: '#003350',
              '&:hover': { backgroundColor: '#72c24f' },
              fontSize: '0.75rem',
              opacity: trimEnabled ? 1 : 0.6,
              textTransform: 'capitalize',
            }}
            onClick={onTrimClick}
            disabled={processingTrim || !ffmpegLoaded || ffmpegLoading || !videoSrc || !trimEnabled}
          >
            {processingTrim ? 'Processing...' : 'Trim Video'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TimelineControls;
