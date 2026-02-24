import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';

// Delete Confirmation Dialog Component
export const DeleteConfirmationDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '8px',
          padding: '16px',
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: '48px',
              color: '#FFA500',
              mb: 1,
            }}
          >
            ⚠️
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#333',
            mb: 1,
          }}
        >
          The only role assigned to this user cannot be deleted.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: '#666',
            mb: 3,
          }}
        >
          Consider deactivating the user.
        </Typography>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#3F5C78',
            color: 'white',
            textTransform: 'none',
            borderRadius: '4px',
            px: 3,
            '&:hover': {
              backgroundColor: '#2c3e50',
            },
          }}
        >
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
};
