import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box, Avatar, Divider } from '@mui/material';

import Logo from '../../assets/img/logo.png';

interface Role {
  organization: string;
  role: string;
  lonestarId?: string;
  insurerId?: string;
  originalMapping?: any;
}

interface RoleSelectionModalProps {
  open: boolean;
  onClose: () => void;
  roles: any;
  onSelectRole: (selectedRole: Role) => void;
  userInfo?: any;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ open, onClose, roles, onSelectRole, userInfo }) => {
  // Helper function to format role display name
  const formatRoleName = (role: string) => {
    switch (role) {
      case 'fleetManager':
        return 'Fleet Manager';
      case 'fleetManagerSuperUser':
        return 'Super Fleet Manager';
      case 'insurer':
        return 'Insurer';
      case 'insurerSuperUser':
        return 'Super Insurer';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  console.log('roles : ', roles);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: '16px',
        },
      }}
    >
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'left', mb: 2 }}>
          <img src={Logo} alt="Logo" style={{ maxWidth: '180px' }} />
        </Box>
        <Box
          sx={{
            width: 'auto',
            height: '2px',
            bgcolor: '#3F5C7899',
            alignSelf: 'stretch',
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', p: 2 }}>
          <Box
            sx={{
              width: '50%',
              pr: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Hi,
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ width: 60, height: 60 }} src={userInfo?.signedUrl}>
                {userInfo?.firstName ? userInfo.firstName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h6">
                  {userInfo?.fullName || `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`.trim() || 'User'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {userInfo?.emailId || 'No email provided'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {userInfo?.primaryPhoneCtryCd ? `(${userInfo.primaryPhoneCtryCd})` : ''}{' '}
                  {userInfo?.primaryPhone || 'No phone provided'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: 1, mt: 5 }}>
              <Typography variant="h4">Choose a role</Typography>
              <Typography variant="body2" color="textSecondary">
                to continue
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: '3px',
              height: 'auto',
              bgcolor: '#3F5C7899',
              alignSelf: 'stretch',
            }}
          />

          <Box sx={{ width: '50%', pl: 2 }}>
            {roles.length > 0 ? (
              roles.map((roleItem: any, index: any) => {
                const isActive = roleItem.policyDetails?.[0]?.isActive;
                const policyMessage = roleItem.policyDetails?.[0]?.message || '';

                return (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid #E0E0E0',
                      borderRadius: 2,
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#E5EBF1' : '#F5F5F5',
                      opacity: isActive ? 1 : 0.7,
                      transition: 'all 0.2s',
                      '&:hover': isActive
                        ? {
                            backgroundColor: '#D1E7DD',
                            borderColor: '#A3CFBB',
                          }
                        : {
                            backgroundColor: '#EEEEEE',
                          },
                    }}
                    onClick={() => onSelectRole(roleItem.originalMapping || roleItem)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {roleItem.organization || 'DronaAim'}
                      </Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: isActive ? '#4CAF50' : '#FF9800',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Role: {formatRoleName(roleItem.role)}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  No roles available
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionModal;
