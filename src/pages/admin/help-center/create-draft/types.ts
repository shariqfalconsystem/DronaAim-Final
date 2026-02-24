// types.ts
import { SelectChangeEvent } from '@mui/material';

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

export interface Topic {
  topicName: string;
  uiDisplayText: string;
  enabled: boolean;
}

export interface ContentType {
  id: string;
  name: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  fileType: 'image' | 'video' | 'pdf' | 'other';
  fileName: string;
}

export interface PublishDialogProps {
  open: boolean;
  selectedContentType: string;
  availableContentTypes: ContentType[];
  contentTypeError: boolean;
  isPublishing: boolean;
  onClose: () => void;
  onContentTypeChange: (event: SelectChangeEvent) => void;
  onPublish: () => Promise<void>;
  onPreview: () => void;
}
