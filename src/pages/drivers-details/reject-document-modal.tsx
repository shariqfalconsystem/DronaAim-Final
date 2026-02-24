import React, { useState } from 'react';
import { Box, Typography, Modal, Checkbox, FormControlLabel, TextField, Button } from '@mui/material';
import { Close } from '@mui/icons-material';
import { RiCloseCircleLine } from '@remixicon/react';
import { REJECTION_REASONS } from '../../common/constants/general';

const RejectDocumentModal = ({ open, onClose, onReject, isRejecting }: any) => {
  const [selectedReasons, setSelectedReasons] = useState<any>([]);
  const [customReason, setCustomReason] = useState<any>('');

  const handleReasonToggle = (reasonId: any) => {
    setSelectedReasons((prev: any) =>
      prev.includes(reasonId) ? prev.filter((id: any) => id !== reasonId) : [...prev, reasonId]
    );
  };

  const handleSubmit = () => {
    const reasons = [...selectedReasons, customReason ? 'Custom: ' + customReason : null].filter(Boolean);
    onReject(reasons);
    handleClose();
  };

  const resetStates = () => {
    setSelectedReasons([]);
    setCustomReason('');
  };

  const handleClose = () => {
    resetStates();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          backgroundColor: '#e6f0ff',
          borderRadius: '10px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto',
          width: '50%',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Reasons for rejecting this document:</Typography>
          <span onClick={handleClose} style={{ cursor: 'pointer' }}>
            <RiCloseCircleLine size={30} />
          </span>
        </Box>
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {REJECTION_REASONS.map((reason: any) => (
            <Box key={reason.id} sx={{ mb: 1, bgcolor: 'rgba(200, 230, 255, 0.3)', p: 1, borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedReasons.includes(reason.id)}
                    onChange={() => handleReasonToggle(reason.id)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{reason.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reason.description}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          ))}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Custom
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Explain clearly why you are rejecting the document ?"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleSubmit} disabled={isRejecting}>
            Reject
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RejectDocumentModal;
