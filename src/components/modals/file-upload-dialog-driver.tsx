import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Menu, MenuItem, Radio } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { RiCloseCircleFill } from '@remixicon/react';
import fileUpload from '../../assets/icons/FileUpload.png';
import clickUpload from '../../assets/icons/FileUpload1.png';
import Loader from '../molecules/loader';

interface FileUploadBoxProps {
  open: boolean;
  handleClose: () => void;
  onUpload: (files: File[]) => void;
  handleDownload: any;
  loading: boolean;
  isIfta?: any;
}

const FileUploadDialog: React.FC<FileUploadBoxProps> = ({
  open,
  handleClose,
  onUpload,
  handleDownload,
  loading,
  isIfta,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files ? Array.from(event.target.files) : [];

  if (files.length > 0) {
    setUploadedFiles(files);
  }
  event.target.value = '';
};


  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRadioClick = (event: any, format: string) => {
    event.stopPropagation();
    setSelectedFormat(format);
    handleDownload(format);
    setAnchorEl(null);
  };

  const handleConfirmUpload = () => {
    onUpload(uploadedFiles);
    setUploadedFiles([]);
  };

  const handleCancelUpload = () => {
    setUploadedFiles([]);
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '900px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#3F5C78',
            color: 'white',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src={fileUpload} alt="File Upload Icon" style={{ width: 24, height: 24 }} />
            <Typography sx={{ fontSize: '16px', fontWeight: 'normal' }}>File Upload</Typography>
          </Box>
          <IconButton size="small" sx={{ color: 'white' }} onClick={handleClose}>
            <RiCloseCircleFill />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Loader />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', padding: 3, gap: 2 }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                mb: 10,
              }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  border: '2px dashed #247FAD',
                  borderRadius: '8px',
                  padding: 3,
                  cursor: 'pointer',
                  width: '100%',
                  '&:hover': { borderColor: '#3F5C78' },
                }}
              >
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                  <img src={clickUpload} alt="Click to Upload" style={{ width: 40, height: 40 }} />
                  <Typography variant="body2" sx={{ marginTop: 1, color: '#247FAD' }}>
                    Click to Upload
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#697886' }}>
                    (Maximum file size: 5MB)
                    <br />
                    (File should be in .csv or .xls format)
                  </Typography>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  style={{ display: 'none' }}
                  accept=".csv, .xls"
                  multiple
                  onChange={handleFileChange}
                />
              </Box>

              <Button
                variant="contained"
                component="label"
                sx={{
                  marginTop: 2,
                  backgroundColor: '#EDFFF4',
                  color: '#2C3E50',
                  textTransform: 'none',
                  minWidth: '200px',
                  width: 'auto',
                  alignSelf: 'center',
                  borderRadius: '8px',
                  border: '2px solid #00833499',
                  '&:hover': { backgroundColor: '#d9f7e3' },
                }}
              >
                Choose Files
                <input type="file" hidden accept=".csv, .xls" multiple onChange={handleFileChange} />
              </Button>

              <>
                <Typography variant="body2" sx={{ textAlign: 'center', marginY: 2, color: '#247FAD' }}>
                  Or
                </Typography>

                <Button
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    borderColor: '#9CACBA',
                    backgroundColor: '#EDF6FB',
                    color: '#2C3E50',
                    width: 'auto',
                    alignSelf: 'center',
                    minWidth: '200px',
                    borderRadius: '8px',
                    // '&:hover': { borderColor: '#32475b', color: '#32475b' },
                  }}
                  onClick={handleMenuOpen}
                  endIcon={anchorEl ? <ExpandLess /> : <ExpandMore />}
                >
                  Download Template
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  sx={{
                    '& .MuiMenu-paper': {
                      borderColor: '#3F5C78',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: '8px',
                      backgroundColor: '#EDF6FB',
                    },
                  }}
                >
                  <MenuItem
                    onClick={(e) => handleRadioClick(e, 'csv')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      borderBottom: '1px solid #3F5C78',
                    }}
                  >
                    CSV Format
                    <Radio checked={selectedFormat === 'csv'} sx={{ padding: 0, marginLeft: 1.4 }} size="small" />
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => handleRadioClick(e, 'xlsx')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    XLSX Format
                    <Radio checked={selectedFormat === 'xlsx'} sx={{ padding: 0, marginLeft: 1 }} size="small" />
                  </MenuItem>
                </Menu>
              </>
            </Box>

            <Box
              sx={{
                width: '3px',
                height: 'auto',
                bgcolor: '#3F5C7899',
                alignSelf: 'stretch',
              }}
            />

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: '14px',
                  fontWeight: 'normal',
                  color: '#247FAD',
                  marginBottom: 1,
                }}
              >
                Uploads
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: '3px',
                  backgroundColor: '#3F5C78',
                  marginBottom: 2,
                }}
              />
              <Box
                sx={{
                  flex: 1,
                  border: '2px dashed #247FAD',
                  borderRadius: '8px',
                  padding: 2,
                  height: '80px',
                  overflowY: 'auto',
                }}
              >
                {uploadedFiles.length === 0 ? (
                  <Typography variant="caption" sx={{ color: '#247FAD' }}>
                    No files are currently being uploaded.
                  </Typography>
                ) : (
                  uploadedFiles.map((file, index) => (
                    <Typography key={index} variant="body2" sx={{ color: '#333' }}>
                      {file.name}
                    </Typography>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          {uploadedFiles.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 2 }}>
              <Button variant="contained" color="primary" onClick={handleConfirmUpload} sx={{ textTransform: 'none' }}>
                Confirm Upload
              </Button>
              <Button variant="outlined" onClick={handleCancelUpload} sx={{ textTransform: 'none', color: '#000' }}>
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FileUploadDialog;
