import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Email, Phone } from '@mui/icons-material';
import logo from '../../assets/img/logo.png';
import accessDeniedImage from '../../assets/img/access.png';
import restrictLogin from '../../assets/img/restrict-login.png';
import { useNavigate } from 'react-router-dom';
import SupportEmailModal from '../../pages/support/support-email-modal';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from 'aws-amplify/auth';
import { clearAuthState } from '../../redux/auth/authSlice';
import { paths } from '../constants/routes';
import environment from '../../environments/environment';

interface PolicyExpirationDialogProps {
  isOpen: boolean;
  userInfo?: any;
  message?: string;
  warning?: string;
  onOtherRolesClick?: () => void;
  showOtherRolesButton?: boolean;
}

const PolicyExpirationDialog: React.FC<PolicyExpirationDialogProps> = ({
  isOpen,
  userInfo,
  message,
  warning,
  onOtherRolesClick,
  showOtherRolesButton = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const insurerId = useSelector((state: any) => state.auth.currentUserId);

  const handleLogout = async () => {
    setIsLoading(true);
    setLoadingMessage('Logging out...');

    try {
      localStorage.removeItem('persist:root');
      window.location.reload();
      sessionStorage.clear();
      await signOut();
      dispatch(clearAuthState());
      navigate(paths.LOGIN);
    } catch (error) {
      console.error('Error signing out: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (showOtherRolesButton && onOtherRolesClick) {
      onOtherRolesClick();
    } else {
      handleLogout();
    }
  };

  const toggleModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => {}}
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
                <img src={logo} alt="DronaAim Logo" style={{ height: '50px' }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 'normal', color: '#1E293B', mb: 2 }}>
                Access Denied!
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <img src={accessDeniedImage} alt="Access Denied" style={{ width: 'auto', height: '80px' }} />
              </Box>

              {warning && (
                <Typography variant="body2" sx={{ color: '#e31111ff', mb: 3 }}>
                  {warning}
                </Typography>
              )}

              {message && (
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  {message}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ color: '#64748B', mr: 1 }} />
                <Typography
                  variant="body2"
                  sx={{ color: '#334155', fontSize: '1rem', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={toggleModal}
                >
                  <a>{environment.supportEmail}</a>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ color: '#64748B', mr: 1 }} />
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '1rem' }}>
                  +1(817)-865-5261
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-start' }}>
              <Button
                onClick={handleButtonClick}
                variant="outlined"
                color="primary"
                sx={{ borderRadius: '10px' }}
                disabled={isLoading}
              >
                {showOtherRolesButton ? 'Other Roles' : 'Log Out'}
              </Button>
            </DialogActions>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={restrictLogin} alt="Restricted Login" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
        </Box>
      </Dialog>

      <SupportEmailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fleetManagerId={insurerId}
        fleetManagerName={userInfo?.fullName}
        fleetManagerEmail={userInfo?.emailId}
      />
    </>
  );
};

export default PolicyExpirationDialog;
