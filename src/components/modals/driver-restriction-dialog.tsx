import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import AccessWarning from '../../assets/img/access.png';

interface DriverRoleRestrictionDialogProps {
  open: boolean;
  onClose: () => void;
  onOtherRolesClick?: () => void;
  buttonText?: string;
  logoSrc: string;
  restrictionImageSrc: string;
  title?: string;
  description?: string;
  instruction?: string;
}

const DriverRoleRestrictionDialog: React.FC<DriverRoleRestrictionDialogProps> = ({
  open,
  onClose,
  onOtherRolesClick,
  buttonText = 'Other Roles',
  logoSrc,
  restrictionImageSrc,
  title = 'Access Restricted !',
  description = 'The Driver role is only accessible via the Mobile app.',
  instruction = 'Please log in using the mobile application to continue.',
}) => {
  const handleButtonClick = () => {
    if (onOtherRolesClick) {
      onOtherRolesClick();
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '800px',
          maxHeight: '90vh',
          p: 6,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, textAlign: 'left' }}>
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <img src={logoSrc} alt="Logo" style={{ height: '50px' }} />
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'normal',
                color: '#1E293B',
                mb: 2,
              }}
            >
              {title}
            </Typography>

            {/* Warning Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <img src={AccessWarning} alt="Logo" width={80} height={60} />
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                mb: 2,
              }}
            >
              {description}
            </Typography>

            {/* Instruction */}
            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                mb: 3,
                fontWeight: 'bold',
              }}
            >
              {instruction}
            </Typography>
          </DialogContent>

          {/* Action Button */}
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-start' }}>
            <Button onClick={handleButtonClick} variant="outlined" color="primary" sx={{ borderRadius: '10px' }}>
              {buttonText}
            </Button>
          </DialogActions>
        </Box>

        {/* Right side - Illustration */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={restrictionImageSrc}
            alt="Restricted Login"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default DriverRoleRestrictionDialog;
