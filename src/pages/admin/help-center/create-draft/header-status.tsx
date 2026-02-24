// HeaderStatus.tsx
import React from 'react';
import { Typography } from '@mui/material';
import { UploadState } from './types';
import { getUploadingFileInfo } from './file-utilities';

interface HeaderStatusProps {
  isSaving: boolean;
  isCreatingDraft: boolean;
  isLoadingTopics: boolean;
  uploadState: UploadState;
}

const HeaderStatus: React.FC<HeaderStatusProps> = ({ isSaving, isCreatingDraft, isLoadingTopics, uploadState }) => {
  const fileInfo = uploadState.isUploading
    ? getUploadingFileInfo(uploadState.fileType, uploadState.fileName)
    : { displayType: '', fileName: '' };

  return (
    <>
      {isSaving && (
        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
          Saving...
        </Typography>
      )}
      {isCreatingDraft && (
        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
          Creating draft...
        </Typography>
      )}
      {isLoadingTopics && (
        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
          Loading topics...
        </Typography>
      )}
      {uploadState.isUploading && (
        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
          Uploading {fileInfo.displayType.toLowerCase()}... {uploadState.progress}%
        </Typography>
      )}
    </>
  );
};

export default HeaderStatus;
