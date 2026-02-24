// UploadProgressOverlay.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { UploadState } from './types';
import { getUploadingFileInfo } from './file-utilities';

interface UploadProgressOverlayProps {
  uploadState: UploadState;
}

const UploadProgressOverlay: React.FC<UploadProgressOverlayProps> = ({ uploadState }) => {
  if (!uploadState.isUploading) return null;

  const fileInfo = getUploadingFileInfo(uploadState.fileType, uploadState.fileName);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 999,
        minWidth: '200px',
      }}
    >
      <CircularProgress size={40} variant="determinate" value={uploadState.progress} />
      <Typography variant="body2" sx={{ mt: 1 }}>
        Uploading {fileInfo.displayType}... {uploadState.progress}%
      </Typography>
      {uploadState.fileName && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {uploadState.fileName}
        </Typography>
      )}
    </Box>
  );
};

export default UploadProgressOverlay;
