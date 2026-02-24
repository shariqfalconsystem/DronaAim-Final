import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { RiCloseCircleFill } from '@remixicon/react';
import PublishImg from '../../../../assets/img/publish.png';

// Content types available for selection
interface ContentType {
  id: string;
  name: string;
}

interface PublishDialogProps {
  open: boolean;
  selectedContentType: string;
  availableContentTypes: ContentType[];
  contentTypeError: boolean;
  isPublishing: boolean;
  onClose: () => void;
  onContentTypeChange: any;
  onPublish: () => Promise<void>;
  onPreview: () => void;
  fromPreview?: boolean;
}

// Styled components
const PublishDialogButton = styled(Button)({
  backgroundColor: '#1e3a8a',
  color: 'white',
  borderRadius: '4px',
  padding: '8px 24px',
  textTransform: 'none',
  minWidth: '100px',
  '&:hover': {
    backgroundColor: '#1e40af',
  },
});

const PreviewButton = styled(Button)({
  backgroundColor: '#4682B4',
  color: 'white',
  borderRadius: '4px',
  padding: '8px 24px',
  textTransform: 'none',
  minWidth: '100px',
  '&:hover': {
    backgroundColor: '#3A6B99',
  },
});

const CancelButton = styled(Button)({
  backgroundColor: '#ffffff',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '8px 24px',
  textTransform: 'none',
  minWidth: '100px',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

const StyledSelect = styled(Select)({
  width: '100%',
  height: '40px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#ccc',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#aaa',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1e3a8a',
  },
});

const PublishDialog: React.FC<PublishDialogProps> = ({
  open,
  selectedContentType,
  availableContentTypes,
  contentTypeError,
  isPublishing,
  onClose,
  onContentTypeChange,
  onPublish,
  onPreview,
  fromPreview,
}) => {
  console.log('selected content type : ', selectedContentType);
  console.log('availableContentTypes : ', availableContentTypes);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: '8px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#34495e',
          padding: '12px 20px',
          m: 0,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Publish To
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              p: 0,
              color: '#fff',
              '&:hover': {
                background: 'transparent',
              },
            }}
          >
            <RiCloseCircleFill color="#fff" size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            mb: 3,
            mt: 1,
            width: '90px',
            height: '90px',
          }}
        >
          <img
            src={PublishImg}
            alt="Publish"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>

        <Typography
          variant="body1"
          align="center"
          sx={{
            mb: 4,
            color: '#0f172a',
            fontWeight: 500,
            fontSize: '0.95rem',
            lineHeight: 1.5,
          }}
        >
          Now, categorize it under a relevant content type for easy access and organization.
        </Typography>

        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography
            component="label"
            sx={{
              display: 'block',
              mb: 1,
              color: '#475569',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Content type <span style={{ color: '#f43f5e' }}>*</span>
          </Typography>

          <FormControl error={contentTypeError} required sx={{ width: '100%' }}>
            <StyledSelect
              value={selectedContentType}
              onChange={onContentTypeChange}
              displayEmpty
              renderValue={(selected) => {
                if (selected === '') {
                  return <Typography sx={{ color: '#94a3b8' }}>Search</Typography>;
                }
                const selectedType = availableContentTypes.find((type) => type.id === selected);
                return selectedType ? selectedType.name : 'Search';
              }}
              IconComponent={(props) => (
                <Box {...props} sx={{ marginRight: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748b">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </Box>
              )}
            >
              {availableContentTypes.map((type) => (
                <MenuItem
                  key={type.id}
                  value={type.id}
                  sx={{
                    ':hover': {
                      backgroundColor: '#2c3e50',
                      color: '#fff',
                    },
                  }}
                >
                  {type.name}
                </MenuItem>
              ))}
            </StyledSelect>
            {contentTypeError && <FormHelperText>Please select a content type</FormHelperText>}
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          justifyContent: 'center',
          gap: 1.5,
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <PublishDialogButton
          onClick={onPublish}
          disabled={isPublishing}
          sx={{
            backgroundColor: '#0f2851',
            '&:hover': {
              backgroundColor: '#1e3a8a',
            },
          }}
        >
          {isPublishing ? <CircularProgress size={20} color="inherit" /> : 'Publish'}
        </PublishDialogButton>
        {!fromPreview && (
          <PreviewButton
            onClick={onPreview}
            sx={{
              backgroundColor: '#3F5C78',
              '&:hover': {
                backgroundColor: '#3F5C88',
              },
            }}
          >
            Preview
          </PreviewButton>
        )}

        <CancelButton
          onClick={onClose}
          sx={{
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            '&:hover': {
              backgroundColor: '#f1f5f9',
            },
          }}
        >
          Cancel
        </CancelButton>
      </DialogActions>
    </Dialog>
  );
};

export default PublishDialog;
