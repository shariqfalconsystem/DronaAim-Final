// src/components/HelpCenter/Header.tsx
import React from 'react';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { RiRefreshLine } from 'react-icons/ri';

const Header: React.FC = () => {
  return (
    <Box
      sx={{
        boxShadow: '0px 4px 4px 0px #00000040',
        bgcolor: '#fff',
        py: 2,
        px: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid item display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h6" sx={{ ml: 3 }}>
            Help Center
          </Typography>
          <IconButton>
            <RiRefreshLine />
          </IconButton>
        </Grid>
        <Grid item></Grid>
      </Grid>
    </Box>
  );
};

export default Header;
