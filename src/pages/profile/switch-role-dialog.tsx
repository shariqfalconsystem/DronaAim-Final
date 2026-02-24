import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Button } from '@mui/material';
import { roleLabels } from '../../common/constants/general';

interface SwitchRoleDialogProps {
  open: boolean;
  selectedRole: any;
  onCancel: () => void;
  onConfirm: () => void;
}

const SwitchRoleDialog: React.FC<SwitchRoleDialogProps> = ({ open, selectedRole, onCancel, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
          Switch Role
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
          Are you sure you want to switch to the following role?
        </Typography>

        {selectedRole && (
          <Box
            sx={{
              bgcolor: '#F8F9FA',
              border: '1px solid #E0E0E0',
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Organization:{' '}
              {selectedRole.name || selectedRole.lonestarId || selectedRole.insurerId || selectedRole.dronaaimId}
            </Typography>
            <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
              Role: {roleLabels[selectedRole.role] || selectedRole.role}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pt: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            ml: 2,
            textTransform: 'none',
          }}
        >
          Switch Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SwitchRoleDialog;
