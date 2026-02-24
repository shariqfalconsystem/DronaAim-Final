import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import clickUpload from '../../../assets/icons/FileUpload1.png';
import { uploadDocuments } from '../../../services/fleetManager/driverServices';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  lonestarId: string;
  fetchData?: () => void;
  onUploadSuccess?: () => void;
}

interface DocumentData {
  documentName: string;
  documentLink: string;
  files?: File[];
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  open,
  onClose,
  lonestarId,
  fetchData,
  onUploadSuccess,
}) => {
  const [documentName, setDocumentName] = useState<string>('');
  const [documentLink, setDocumentLink] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);

  const handleClose = () => {
    setDocumentName('');
    setDocumentLink('');
    setUploadedFiles([]); 
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedFiles([files[0]]);
      setDocumentLink('');
    }
  };

  const handleDocumentCenter = async () => {
    if (!lonestarId) {
      toast.error('Driver ID not found');
      return;
    }

    if (uploadedFiles.length === 0 && !documentLink) {
      toast.error('Please upload a file or enter a link');
      return;
    }

    setIsUploading(true);

    try {
      if (uploadedFiles.length > 0) {
        const selectedFile = uploadedFiles[0];
        const renamedFile = new File(
          [selectedFile],
          documentName?.trim() ? `${documentName.trim()}.${selectedFile.name.split('.').pop()}` : selectedFile.name,
          { type: selectedFile.type }
        );

        const response = await uploadDocuments(lonestarId, renamedFile, 'Document', currentUserId);

        if (response.status === 202) {
          toast.success(response?.data?.message || 'File Uploaded successfully');
          if (fetchData) {
            fetchData();
          }
        } else {
          toast.error(response?.data?.details || 'Failed to Upload the file');
        }
      } 

      handleClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.details || error.message || 'Failed to Upload the file');
    } finally {
      setIsUploading(false);
    }
  };

  const isSaveDisabled = !documentLink && uploadedFiles.length === 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          minHeight: '400px',
          width: '90%',
          maxWidth: '700px',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#3F5C78',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3,
        }}
      >
        <Typography variant="h6" component="div">
          Upload Document
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, mt: 2, fontWeight: 500 }}>
              Write the Document Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Document Name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>

          <Box
            sx={{
              border: `2px dashed ${documentLink ? '#ccc' : '#247FAD'}`,
              borderRadius: '8px',
              padding: 3,
              cursor: documentLink ? 'not-allowed' : 'pointer',
              width: '100%',
              backgroundColor: documentLink ? '#f9f9f9' : 'white',
              opacity: documentLink ? 0.6 : 1,
              '&:hover': {
                borderColor: documentLink ? '#ccc' : '#3F5C78',
              },
            }}
          >
            <label
              htmlFor="file-upload"
              style={{
                cursor: documentLink ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <img src={clickUpload} alt="Upload" style={{ width: 40, height: 40 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ color: documentLink ? '#999' : '#247FAD', fontWeight: 500 }}>
                  Click to Upload
                </Typography>
                <Typography variant="caption" sx={{ color: documentLink ? '#999' : '#697886' }}>
                  (File should be in .pdf/.png/.jpeg format)
                </Typography>
              </Box>
            </label>
            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              accept=".pdf,.png,.jpeg,.jpg"
              onChange={handleFileChange}
              disabled={!!documentLink}
            />
          </Box>

          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {uploadedFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      border: '1px dashed #ccc',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: '#f44336',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                          {file.name.split('.').pop()?.toUpperCase()}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                        {file.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpeg,.jpg"
                        style={{ display: 'none' }}
                        id={`file-replace-${index}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFiles([file]); 
                          }
                        }}
                      />
                      <label htmlFor={`file-replace-${index}`}>
                        <Button
                          variant="outlined"
                          size="small"
                          component="span"
                          sx={{
                            textTransform: 'none',
                            minWidth: '100px',
                            borderColor: '#4caf50',
                            color: '#4caf50',
                            '&:hover': {
                              borderColor: '#45a049',
                              backgroundColor: 'rgba(76, 175, 80, 0.04)',
                            },
                          }}
                        >
                          Change File
                        </Button>
                      </label>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: '#f5f5f5',
          gap: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            minWidth: '80px',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDocumentCenter}
          variant="contained"
          disabled={isSaveDisabled || isUploading}
          sx={{
            textTransform: 'none',
            minWidth: '80px',
            backgroundColor: isSaveDisabled || isUploading ? '#ccc' : '#2c3e50',
            '&:hover': {
              backgroundColor: isSaveDisabled || isUploading ? '#ccc' : '#2c3e50',
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDocumentModal;