// src/components/HelpCenter/ItemFooter.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { AiOutlineClockCircle } from 'react-icons/ai';

interface ItemFooterProps {
  date: string;
}

const ItemFooter: React.FC<ItemFooterProps> = ({ date }) => {
  if (!date) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
      <AiOutlineClockCircle size={14} color="#666" />
      <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
        {date}
      </Typography>
    </Box>
  );
};

export default ItemFooter;
