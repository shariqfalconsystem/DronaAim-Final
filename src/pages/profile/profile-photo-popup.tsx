import React, { useState } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, IconButton, Avatar, CircularProgress } from '@mui/material';
import { Close, Edit, Add, Delete, CameraAlt } from '@mui/icons-material';
import { CiCamera } from 'react-icons/ci';
import { FaPencilAlt } from 'react-icons/fa';
import { RiCloseCircleFill } from '@remixicon/react';

interface ProfilePhotoPopupProps {
  open: boolean;
  onClose: () => void;
  userPhoto?: string;
  userName?: string;
  onEditPhoto: () => void;
  onAddPhoto: () => void;
  onDeletePhoto: () => void;
  isDeletingPhoto?: boolean;
}

const ProfilePhotoPopup: React.FC<ProfilePhotoPopupProps> = ({
  open,
  onClose,
  userPhoto,
  userName,
  onEditPhoto,
  onAddPhoto,
  onDeletePhoto,
  isDeletingPhoto = false,
}) => {
  const hasPhoto = userPhoto && userPhoto !== '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 550,
          bgcolor: '#1e3a5f',
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
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
            Profile photo
          </Typography>
          <IconButton
            onClick={onClose}
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

        {/* Photo Display */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
            px: 2,
          }}
        >
          {hasPhoto ? (
            <Avatar
              src={userPhoto}
              alt={userName}
              sx={{
                width: 160,
                height: 160,
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 160,
                height: 160,
                border: '4px solid white',
                bgcolor: 'grey.300',
                color: 'grey.600',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <CameraAlt sx={{ fontSize: 40 }} />
            </Avatar>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 1,
            justifyContent: 'center',
            bgcolor: 'white',
          }}
        >
          <Button
            variant="contained"
            startIcon={<FaPencilAlt />}
            onClick={onEditPhoto}
            sx={{
              bgcolor: hasPhoto ? '#2C3E50' : 'grey.600',
              color: 'white',
              textTransform: 'none',
              borderRadius: 1,
              px: 3,
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                bgcolor: hasPhoto ? '#1976d2' : 'grey.600',
              },
              '&:disabled': {
                bgcolor: 'grey.600',
                color: 'grey.400',
              },
            }}
            disabled={!hasPhoto || isDeletingPhoto}
          >
            Edit Photo
          </Button>

          <Button
            variant="contained"
            startIcon={<CiCamera color="#fff" />}
            onClick={onAddPhoto}
            sx={{
              bgcolor: '#3F5C78',
              color: 'white',
              textTransform: 'none',
              borderRadius: 1,
              px: 3,
              py: 1,
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                bgcolor: hasPhoto ? '#1976d2' : 'grey.600',
              },
              '&.Mui-disabled': {
                bgcolor: '#3F5C78 !important',
                color: '#fff !important',
              },
            }}
            disabled={!!hasPhoto || isDeletingPhoto}
          >
            Add Photo
          </Button>

          <Button
            variant="contained"
            startIcon={isDeletingPhoto ? <CircularProgress size={16} color="inherit" /> : <Delete />}
            onClick={onDeletePhoto}
            disabled={!hasPhoto || isDeletingPhoto}
            sx={{
              bgcolor: hasPhoto ? '#f44336' : 'grey.600',
              color: 'white',
              textTransform: 'none',
              borderRadius: 1,
              px: 3,
              py: 1,
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                bgcolor: hasPhoto && !isDeletingPhoto ? '#d32f2f' : 'grey.600',
              },
              '&:disabled': {
                bgcolor: 'grey.600',
                color: 'grey.400',
              },
            }}
          >
            {isDeletingPhoto ? 'Deleting...' : 'Delete Photo'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePhotoPopup;
