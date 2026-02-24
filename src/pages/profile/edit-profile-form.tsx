import React, { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, MenuItem, Avatar } from '@mui/material';
import { ArrowBackIos, CameraAltOutlined } from '@mui/icons-material';
import ProfilePhotoPopup from './profile-photo-popup';
import PhotoUploadPopup from './photo-upload-popup';

// Phone number validation regex
export const phoneRegExp = /^[0-9]{10}$/;

interface EditProfileFormProps {
  editFormData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
  };
  userDetails: {
    name: string;
    image: string;
    signedUrl: string;
  };
  onInputChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  onPhotoUpload: (file: File) => void;
  isUploading?: boolean;
  onDeletePhoto?: () => void;
  isSaving?: boolean;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  editFormData,
  userDetails,
  onInputChange,
  onCancel,
  onSave,
  onPhotoUpload,
  isUploading = false,
  onDeletePhoto,
  isSaving = false,
}) => {
  const [photoPopupOpen, setPhotoPopupOpen] = useState(false);
  const [photoUploadPopupOpen, setPhotoUploadPopupOpen] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Phone validation function
  const validatePhoneNumber = (phone: string): string => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    if (!phoneRegExp.test(phone)) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  // Handle phone number input change with validation
  const handlePhoneChange = (value: string) => {
    // Only allow numeric input and limit to 10 characters
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);

    onInputChange('phone', numericValue);

    // Validate and set error
    const error = validatePhoneNumber(numericValue);
    setPhoneError(error);
  };

  // Photo popup handlers
  const handlePhotoClick = () => {
    setPhotoPopupOpen(true);
  };

  const handleClosePhotoPopup = () => {
    setPhotoPopupOpen(false);
  };

  const handleEditPhoto = () => {
    setIsEditingPhoto(true);
    setPhotoPopupOpen(false);
    setPhotoUploadPopupOpen(true);
  };

  const handleAddPhoto = () => {
    setIsEditingPhoto(false);
    setPhotoPopupOpen(false);
    setPhotoUploadPopupOpen(true);
  };

  const handleDeletePhoto = () => {
    if (onDeletePhoto) {
      onDeletePhoto();
    }
    setPhotoPopupOpen(false);
  };

  const handleClosePhotoUploadPopup = () => {
    setPhotoUploadPopupOpen(false);
    setIsEditingPhoto(false);
  };

  const handlePhotoUploadWrapper = (file: File) => {
    onPhotoUpload(file);
    setPhotoUploadPopupOpen(false);
    setPhotoPopupOpen(false);
  };

  const handleSaveProfile = async () => {
    // Validate phone before saving
    const phoneValidationError = validatePhoneNumber(editFormData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    try {
      await onSave();
    } catch (error: any) {
      console.error('Error updating profile:', error);
    }
  };

  const hasPhoto = userDetails.signedUrl && userDetails.signedUrl !== '';
  const isPhoneValid = editFormData.phone.trim() && !phoneError;

  return (
    <>
      <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={onCancel} sx={{ mr: 2 }}>
            <ArrowBackIos />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Edit profile
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', mb: 4, textAlign: 'center' }}>
          <Avatar
            src={userDetails.signedUrl || undefined}
            sx={{
              width: 100,
              height: 100,
              margin: '0 auto',
              cursor: 'pointer',
              bgcolor: !hasPhoto ? '#E8F4FD' : 'transparent',
              color: !hasPhoto ? '#1976D2' : 'inherit',
            }}
            alt={userDetails?.name}
            onClick={handlePhotoClick}
          >
            {!hasPhoto && <CameraAltOutlined sx={{ fontSize: 40 }} />}
          </Avatar>
          <IconButton
            onClick={handlePhotoClick}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translate(25%, -25%)',
              bgcolor: 'grey.300',
              color: 'black',
              p: 0.5,
              '&:hover': { bgcolor: 'grey.400' },
            }}
          >
            <CameraAltOutlined fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              First Name
            </Typography>
            <TextField
              fullWidth
              value={editFormData.firstName}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: 48,
                  bgcolor: '#F9F9F9',
                },
                '& .Mui-disabled': {
                  color: '#999',
                },
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              Last Name
            </Typography>
            <TextField
              fullWidth
              value={editFormData.lastName}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: 48,
                  bgcolor: '#F9F9F9',
                },
                '& .Mui-disabled': {
                  color: '#999',
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
            Email
          </Typography>
          <TextField
            fullWidth
            value={editFormData.email}
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: '#4CAF50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                    }}
                  >
                    ✓
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                height: 48,
                bgcolor: '#F9F9F9',
              },
              '& .Mui-disabled': {
                color: '#999',
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
            Contact Number *
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select
              value={editFormData.countryCode}
              onChange={(e) => onInputChange('countryCode', e.target.value)}
              sx={{
                width: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: 48,
                  bgcolor: '#F5F5F5',
                },
              }}
            >
              <MenuItem
                value="+1"
                sx={{
                  ':hover': {
                    backgroundColor: '#2c3e50',
                    color: '#fff',
                  },
                }}
              >
                (+1)
              </MenuItem>
              <MenuItem
                value="+91"
                sx={{
                  ':hover': {
                    backgroundColor: '#2c3e50',
                    color: '#fff',
                  },
                }}
              >
                (+91)
              </MenuItem>
              <MenuItem
                value="+44"
                sx={{
                  ':hover': {
                    backgroundColor: '#2c3e50',
                    color: '#fff',
                  },
                }}
              >
                (+44)
              </MenuItem>
            </TextField>
            <TextField
              fullWidth
              value={editFormData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Enter 10-digit phone number"
              error={!!phoneError}
              helperText={phoneError}
              inputProps={{
                maxLength: 10,
                pattern: '[0-9]*',
                inputMode: 'numeric',
              }}
              InputProps={{
                endAdornment: isPhoneValid ? (
                  <InputAdornment position="end">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#4CAF50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      ✓
                    </Box>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: 48,
                  bgcolor: '#F5F5F5',
                  '&.Mui-error': {
                    '& fieldset': {
                      borderColor: '#d32f2f',
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSaving}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: 'none',
              borderColor: '#DDD',
              color: '#666',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={isSaving || !isPhoneValid}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: 'none',
              bgcolor: '#1976d2',
              '&:disabled': {
                bgcolor: '#ccc',
              },
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {/* Photo Popup */}
      <ProfilePhotoPopup
        open={photoPopupOpen}
        onClose={handleClosePhotoPopup}
        userPhoto={userDetails.signedUrl}
        userName={userDetails.name}
        onEditPhoto={handleEditPhoto}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      {/* Photo Upload Popup */}
      <PhotoUploadPopup
        open={photoUploadPopupOpen}
        onClose={handleClosePhotoUploadPopup}
        onPhotoUpload={handlePhotoUploadWrapper}
        isUploading={isUploading}
        userPhoto={userDetails.signedUrl}
        isEditing={isEditingPhoto}
      />
    </>
  );
};

export default EditProfileForm;
