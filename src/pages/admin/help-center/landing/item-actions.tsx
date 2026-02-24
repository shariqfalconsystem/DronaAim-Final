// src/components/HelpCenter/ItemActions.tsx
import React from 'react';
import { Box, IconButton } from '@mui/material';
import { BsShare } from 'react-icons/bs';
import { FiDownload } from 'react-icons/fi';
import { PiDotsThreeCircle } from 'react-icons/pi';

const ItemActions: React.FC = () => {
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          display: 'flex',
        }}
      >
        <IconButton>
          <PiDotsThreeCircle size={20} color="#666" />
        </IconButton>
      </Box>

      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <IconButton size="small" sx={{ color: '#00529C', p: 1 }}>
          <BsShare size={16} />
        </IconButton>
        <IconButton size="small" sx={{ color: '#00529C', p: 1 }}>
          <FiDownload size={16} />
        </IconButton>
      </Box>
    </>
  );
};

export default ItemActions;
