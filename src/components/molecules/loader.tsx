import { Box, CircularProgress } from '@mui/material';
import React from 'react';

function loader({ height }: any) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: height || '400px',
        marginTop: 1,
        marginBottom: 1,
        backgroundColor: '#fff',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default loader;
