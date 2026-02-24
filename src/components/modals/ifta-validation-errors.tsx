import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  IconButton,
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import WarningIcon from '@mui/icons-material/Warning';

interface ValidationErrorModalProps {
  open: boolean;
  onClose: () => void;
  validationErrors: { [key: string]: string[] };
}

const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({ open, onClose, validationErrors }) => {
  // Function to clean up the user name by removing "null" parts
  const cleanUserName = (user: string | null | undefined): string => {
    if (!user) return 'Not Available'; // Handle null or undefined

    return user
      .split(',') // Split by commas instead of spaces
      .map((part) => part.trim()) // Trim each part after splitting
      .filter((part) => part.toLowerCase() !== 'null' && part !== '') // Remove "null" and empty parts
      .join(', '); // Join the remaining parts back into a string with commas and spaces
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      PaperProps={{
        style: {
          borderRadius: '10px',
          width: '800px',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: (theme) => theme.palette.primary.main,
          mb: '25px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            Validation Errors
          </Typography>
          <IconButton onClick={onClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {Object.entries(validationErrors).map(([user, errors]) => (
            <React.Fragment key={user}>
              {/* Display the cleaned user name */}
              <ListItem sx={{ pt: 2, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {cleanUserName(user)}
                </Typography>
              </ListItem>
              {/* Display each error under the user */}
              {errors.map((error, index) => (
                <ListItem key={`${user}-${index}`} sx={{ pl: 4 }}>
                  <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <ListItemText primary={error} />
                </ListItem>
              ))}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationErrorModal;
