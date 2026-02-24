import React from 'react';
import { Dialog, DialogContent, DialogContentText, Button, styled, Box } from '@mui/material';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    width: '90%',
    maxWidth: '320px',
    margin: 0,
  },
}));

const StyledDialogContent = styled(DialogContent)({
  padding: '20px 20px 0',
});

const StyledDialogContentText = styled(DialogContentText)({
  color: '#000',
  fontSize: '16px',
  textAlign: 'center',
  marginBottom: '20px',
  '& span': {
    display: 'block',
  },
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  borderTop: '1px solid #E0E0E0',
});

const StyledButton = styled(Button)({
  flex: 1,
  borderRadius: 0,
  padding: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  textTransform: 'none',
  '&:first-of-type': {
    borderRight: '1px solid #E0E0E0',
  },
});

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  // driverName: string;
  deviceId: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ open, onClose, onConfirm, deviceId }) => {
  return (
    <StyledDialog open={open} onClose={onClose} aria-describedby="alert-dialog-description">
      <StyledDialogContent>
        <StyledDialogContentText id="alert-dialog-description">
          <span>Are you sure you want to delete</span>
          <span>this Device </span>
          <span>( DeviceId : {deviceId})?</span>
        </StyledDialogContentText>
      </StyledDialogContent>
      <ButtonContainer>
        <StyledButton onClick={onConfirm} color="primary">
          Confirm
        </StyledButton>
        <StyledButton onClick={onClose} color="primary" sx={{ fontWeight: '400' }}>
          Cancel
        </StyledButton>
      </ButtonContainer>
    </StyledDialog>
  );
};

export default DeleteConfirmationDialog;
