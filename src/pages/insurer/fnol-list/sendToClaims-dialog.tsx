import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Button, TextField } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import sendClaims from '../../../assets/icons/sendClaims.png';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void;
}

const SendClaims: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const [note, setNote] = useState('');
  const inputHeight = 100;

  const handleConfirm = () => {
    onConfirm(note);
    setNote(''); 
    onClose();
  };

  const handleClose = () => {
    setNote(''); 
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: '10px' } }}>
      <DialogTitle sx={{ bgcolor: (theme) => theme.palette.primary.main, mb: '25px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            Confirm FNOL Submission
          </Typography>
          <IconButton onClick={handleClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', mb: 3, p: 1 }}>
          <img src={sendClaims} alt="Send Claims" style={{ maxWidth: '10%', height: 'auto' }} />
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Are you sure want to send this FNOL to Edge Claims?
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          Please confirm and optionally add a note for the claims team.
        </Typography>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: '600' }}>
          Add Note (Optional):
        </Typography>

        <TextField
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='Example:"FNOL event is inconclusive but appears to capture a rear-end accident at the :12 mark of the dashcam footage"'
          multiline
          sx={{
            width: '100%',
            '& .MuiInputBase-root': { height: `${inputHeight}px`, fontSize: '0.875rem', alignItems: 'flex-start' },
          }}
        />

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1, borderRadius: 2, background: '#2C3E50' }}
            onClick={handleConfirm}
          >
            Send to Edge Claims
          </Button>
          <Button variant="outlined" color="primary" sx={{ mr: 1, borderRadius: 2 }} onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SendClaims;
