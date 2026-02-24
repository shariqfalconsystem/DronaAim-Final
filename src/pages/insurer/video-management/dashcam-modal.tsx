import React from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import Notfound from '../../../assets/icons/not found.png';
import Requestaccess from '../../../assets/icons/request access.png';

const VideoStatusModal = ({ open, onClose, status }: any) => {
  const isNotFound = status && status.toLowerCase() === 'notfound';

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="video-status-modal"
      aria-describedby="video-status-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          textAlign: 'center',
        }}
      >
        {isNotFound ? (
          <>
            <Typography variant="h6" color="error" sx={{ fontWeight: '400', mb: 2 }}>
              Sorry!
            </Typography>

            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                component="div"
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#f5f5f5',
                }}
              >
                <img
                  src={Notfound}
                  alt="Not Found"
                  style={{ width: 30, height: 30 }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10.66 4H14a2 2 0 0 1 2 2v3.34l1 .76V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V9.67l-1 .76V16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2'/%3E%3C/svg%3E";
                  }}
                />
              </Box>
            </Box>

            <Typography variant="body1" color="error">
              Dashcam Footage not available for this time range.
            </Typography>
          </>
        ) : (
          <>
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                component="div"
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#f5f5f5',
                }}
              >
                <img src={Requestaccess} alt="Request Access" style={{ width: 30, height: 30 }} />
              </Box>
            </Box>

            <Typography id="video-status-modal" variant="h6" component="h2" sx={{ mb: 1, wrap: 'no-wrap' }} noWrap>
              Request in progress
            </Typography>
            <Typography id="video-status-description" sx={{ mb: 3, color: 'green', fontSize: '0.875rem' }}>
              You will be notified when the video is available to view
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default VideoStatusModal;
