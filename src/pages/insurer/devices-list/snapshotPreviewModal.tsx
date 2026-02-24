import React from 'react';
import { Box, Button, IconButton, Typography, CircularProgress } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';

interface SnapshotPreviewModalProps {
  imageUrl: string;
  index: number;
  onClose: () => void;
  onShare: (url: string, index: number) => void;
  onDownload: (url: string, filename: string) => void;
  isDownloading: boolean;
  cameraLabel?: string;
  timestamp?: string;
  filename: string;
}

const SnapshotPreviewModal: React.FC<SnapshotPreviewModalProps> = ({
  imageUrl,
  index,
  onClose,
  onShare,
  onDownload,
  isDownloading,
  cameraLabel,
  timestamp,
  filename,
}) => {
  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            bgcolor: '#00b341',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {cameraLabel}
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: 'white',
            fontSize: 14,
            fontStyle: 'italic',
            textAlign: 'center',
            flexGrow: 1,
          }}
        >
          {timestamp}
        </Typography>

        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            ml: 'auto',
            mt: 4,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        component="img"
        src={imageUrl}
        alt="Snapshot preview"
        onClick={(e) => e.stopPropagation()}
        sx={{
          maxWidth: '90%',
          maxHeight: '80%',
          borderRadius: 2,
          mt: 8,
        }}
      />

      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          display: 'flex',
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={() => onShare(imageUrl, index)}
          sx={{ bgcolor: '#2ecc71', textTransform: 'none' }}
        >
          Share
        </Button>
        <Button
          variant="contained"
          startIcon={isDownloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
          onClick={() => onDownload(imageUrl, filename)}
          sx={{ bgcolor: '#27ae60', textTransform: 'none' }}
          disabled={isDownloading}
        >
          Download
        </Button>
      </Box>
    </Box>
  );
};

export default SnapshotPreviewModal;
