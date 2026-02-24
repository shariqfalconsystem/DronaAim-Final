import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, IconButton, Avatar, CircularProgress } from '@mui/material';
import { Close, CameraAlt, Upload, Refresh, Check, Cancel } from '@mui/icons-material';
import { RiCloseCircleFill } from '@remixicon/react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';

interface PhotoUploadPopupProps {
  open: boolean;
  onClose: () => void;
  onPhotoUpload: (file: File) => void;
  isUploading?: boolean;
  userPhoto?: string;
  isEditing?: boolean;
}

const PhotoUploadPopup: React.FC<PhotoUploadPopupProps> = ({
  open,
  onClose,
  onPhotoUpload,
  isUploading = false,
  userPhoto,
  isEditing = false,
}) => {
  const [activeMode, setActiveMode] = useState<'selection' | 'camera' | 'preview'>('selection');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'upload' | 'camera' | null>(null); // Track image source

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Webcam configuration
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  // Start camera
  const startCamera = useCallback(() => {
    setCameraError(null);
    setIsCameraLoading(true);
    setActiveMode('camera');
  }, []);

  // Handle webcam ready
  const handleWebcamReady = useCallback(() => {
    setIsCameraLoading(false);
    setCameraError(null);
  }, []);

  // Handle webcam error
  const handleWebcamError = useCallback((error: string | DOMException) => {
    console.error('Webcam error:', error);
    setIsCameraLoading(false);

    let errorMessage = 'Unable to access camera. ';

    if (typeof error === 'string') {
      errorMessage += error;
    } else if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage += 'Please allow camera permissions in your browser settings and try again.';
          break;
        case 'NotFoundError':
          errorMessage += 'No camera found on this device.';
          break;
        case 'NotReadableError':
          errorMessage += 'Camera is already in use by another application.';
          break;
        case 'OverconstrainedError':
          errorMessage += 'Camera constraints could not be satisfied.';
          break;
        case 'AbortError':
          errorMessage += 'Camera access was aborted.';
          break;
        case 'SecurityError':
          errorMessage += 'Camera access blocked due to security restrictions.';
          break;
        default:
          errorMessage += `An error occurred: ${error.message}`;
      }
    }

    setCameraError(errorMessage);
    setActiveMode('selection');
  }, []);

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const file = new File([blob], `camera-photo-${timestamp}.jpg`, {
              type: 'image/jpeg',
            });

            setSelectedFile(file);
            setCapturedImage(imageSrc);
            setImageSource('camera');
            setActiveMode('preview');
          })
          .catch((error) => {
            console.error('Error processing captured image:', error);
            setCameraError('Failed to process captured image. Please try again.');
          });
      }
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.warning('Only JPEG, JPG, and PNG files are allowed');
        event.target.value = '';
        return;
      }

      const maxSizeInMB = 5;
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeInMB) {
        toast.warning('File size should not exceed 5 MB');
        event.target.value = '';
        return;
      }

      setSelectedFile(file);
      setImageSource('upload');
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setActiveMode('preview');
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleSave = () => {
    if (selectedFile) {
      onPhotoUpload(selectedFile);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setActiveMode('camera');
    setCameraError(null);
    setIsCameraLoading(false);
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setImageSource(null);
    setActiveMode('selection');
    setCameraError(null);
    setIsCameraLoading(false);
  };

  const handleClose = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setImageSource(null);
    setActiveMode('selection');
    setCameraError(null);
    setIsCameraLoading(false);
    onClose();
  };

  const handleCancelCamera = () => {
    setActiveMode('selection');
    setCameraError(null);
    setIsCameraLoading(false);
  };

  useEffect(() => {
    if (open) {
      setActiveMode('selection');
      setCapturedImage(null);
      setSelectedFile(null);
      setImageSource(null);
      setCameraError(null);
      setIsCameraLoading(false);
    }
  }, [open]);

  const getTitle = () => {
    if (activeMode === 'camera') return 'Take Photo';
    if (activeMode === 'preview') return 'Preview Photo';
    return isEditing ? 'Edit Photo' : 'Add Photo';
  };

  const renderSelectionMode = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Avatar
        src={isEditing && userPhoto ? userPhoto : undefined}
        sx={{
          width: 120,
          height: 120,
          bgcolor: isEditing && userPhoto ? 'transparent' : '#E8F4FD',
          color: '#1976D2',
          mx: 'auto',
          mb: 3,
        }}
      >
        {!isEditing || !userPhoto ? <CameraAlt sx={{ fontSize: 40 }} /> : null}
      </Avatar>

      <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
        {isEditing ? 'Update your profile photo' : 'Help others to recognize you !'}
      </Typography>

      <Typography variant="body2" sx={{ color: 'grey.600', mb: 1 }}>
        (Maximum file size: 5MB)
      </Typography>

      <Typography variant="body2" sx={{ color: 'grey.600', mb: 4 }}>
        (File should be in .jpeg or .png format)
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            bgcolor: '#2C3E50',
            color: 'white',
            textTransform: 'none',
            borderRadius: 1,
            px: 3,
            py: 1,
            '&:hover': {
              bgcolor: '#1976d2',
            },
          }}
        >
          Upload Photo
        </Button>

        <Button
          variant="contained"
          startIcon={<CameraAlt />}
          onClick={startCamera}
          sx={{
            bgcolor: '#3F5C78',
            color: 'white',
            textTransform: 'none',
            borderRadius: 1,
            px: 3,
            py: 1,
            '&:hover': {
              bgcolor: '#1976d2',
            },
          }}
        >
          Use Camera
        </Button>
      </Box>

      {cameraError && (
        <Typography
          variant="body2"
          sx={{
            color: 'error.main',
            mt: 2,
            p: 2,
            bgcolor: 'error.50',
            borderRadius: 1,
          }}
        >
          {cameraError}
        </Typography>
      )}
    </Box>
  );

  const renderCameraMode = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2" sx={{ mb: 2, color: 'grey.600' }}>
        Position yourself in the frame and click capture when ready
      </Typography>

      <Box sx={{ position: 'relative', mb: 3, display: 'inline-block' }}>
        <Box
          sx={{
            width: '400px',
            height: '300px',
            borderRadius: '8px',
            border: '2px solid #ddd',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={handleWebcamReady}
            onUserMediaError={handleWebcamError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {isCameraLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                zIndex: 1,
              }}
            >
              <CircularProgress color="inherit" sx={{ mb: 1 }} />
              <Typography variant="body2">Loading camera...</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<CameraAlt />}
          onClick={capturePhoto}
          disabled={isCameraLoading || isUploading}
          sx={{
            bgcolor: '#2C3E50',
            color: 'white',
            textTransform: 'none',
            borderRadius: 1,
            px: 3,
            py: 1,
            '&:hover': {
              bgcolor: '#1976d2',
            },
            '&:disabled': {
              bgcolor: 'grey.400',
            },
          }}
        >
          {isCameraLoading ? 'Loading...' : 'Capture Photo'}
        </Button>

        <Button
          variant="outlined"
          onClick={handleCancelCamera}
          disabled={isUploading}
          sx={{
            borderColor: '#ccc',
            color: '#666',
            textTransform: 'none',
            borderRadius: 1,
            px: 3,
            py: 1,
            '&:hover': {
              borderColor: '#999',
              color: '#333',
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );

  const renderPreviewMode = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2" sx={{ mb: 2, color: 'grey.600' }}>
        Review your photo before uploading
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Avatar
          src={capturedImage || undefined}
          sx={{
            width: 160,
            height: 160,
            mx: 'auto',
            border: '4px solid white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <Check />}
          onClick={handleSave}
          disabled={isUploading}
          sx={{
            bgcolor: '#2C3E50',
            color: 'white',
            textTransform: 'none',
            borderRadius: 1,
            px: 3,
            py: 1,
            '&:hover': {
              bgcolor: '#1976d2',
            },
            '&:disabled': {
              bgcolor: 'grey.400',
            },
          }}
        >
          {isUploading ? 'Uploading...' : 'Save Photo'}
        </Button>

        {imageSource === 'camera' ? (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRetake}
            disabled={isUploading}
            sx={{
              borderColor: '#ccc',
              color: '#666',
              textTransform: 'none',
              borderRadius: 1,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#999',
                color: '#333',
              },
            }}
          >
            Retake
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={handleCancel}
            disabled={isUploading}
            sx={{
              borderColor: '#ccc',
              color: '#666',
              textTransform: 'none',
              borderRadius: 1,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#999',
                color: '#333',
              },
            }}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 550,
            bgcolor: 'white',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '1px solid #e0e0e0',
              bgcolor: '#3F5C78',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 500,
                fontSize: '16px',
              }}
            >
              {getTitle()}
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{
                color: 'white',
                width: 40,
                height: 30,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <RiCloseCircleFill size={30} />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            {activeMode === 'selection' && renderSelectionMode()}
            {activeMode === 'camera' && renderCameraMode()}
            {activeMode === 'preview' && renderPreviewMode()}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/jpg,image/png"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </>
  );
};

export default PhotoUploadPopup;
