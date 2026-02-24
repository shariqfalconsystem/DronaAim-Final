import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import WhatsAppIcon from '../../assets/icons/whatsapp.png';
import OutlookIcon from '../../assets/icons/outlook.png';
import GmailIcon from '../../assets/icons/gmail.png';

const ShareDialog = ({ open, onClose, documentUrl, documentName }: any) => {
  const handleGmailShare = () => {
    const subject = encodeURIComponent(`Shared Document: ${documentName}`);
    const body = encodeURIComponent(`Please find the shared document here: ${documentUrl}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  const handleOutlookShare = () => {
    const subject = encodeURIComponent(`Shared Document: ${documentName}`);
    const body = encodeURIComponent(`Please find the shared document here: ${documentUrl}`);
    window.open(`https://outlook.office.com/mail/deeplink/compose?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Please find the shared document here: ${documentUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '8px',
          width: '500px',
          maxWidth: '90vw',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#475E78',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
        }}
      >
        <Typography>Share {documentName || 'Media'}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <RiCloseCircleFill />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: '24px' }}>
        <Typography sx={{ mb: 3, mt: 2 }}>Share the file via</Typography>

        <Box display="flex" justifyContent="space-around" mb={2}>
          <IconButton onClick={handleGmailShare}>
            <img src={GmailIcon} alt="gmail" />
          </IconButton>
          <IconButton onClick={handleOutlookShare}>
            <img src={OutlookIcon} alt="outlook" />
          </IconButton>
          <IconButton onClick={handleWhatsAppShare}>
            <img src={WhatsAppIcon} alt="whatsapp" />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
