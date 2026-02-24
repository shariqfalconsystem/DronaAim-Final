import React from 'react';
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';

interface ErrorConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  errorMessage?: string;
}

export const ErrorConfirmationDialog: React.FC<ErrorConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  errorMessage,
}) => {
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
              mb: 1,
            }}
          >
            ⚠️
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: '#666',
            mb: 3,
          }}
        >
          {errorMessage}
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
