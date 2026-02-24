import React from 'react';
import { Grid, Typography, IconButton, Box } from '@mui/material';
import { LuRefreshCcw } from 'react-icons/lu';

const ChangePasswordHeader: React.FC = () => {
  return (
    <Grid
      container
      spacing={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        padding: 1,
        backgroundColor: '#fff',
        borderRadius: '8px',
      }}
    >
      <Grid item display="flex" alignItems="center">
        <Box ml={2} flexDirection="row" display="flex" alignItems="center">
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontSize: '1.4rem',
              fontWeight: 600,
              lineHeight: '32px',
              textAlign: 'left',
            }}
          >
            Account
          </Typography>

          <Box sx={{ alignItems: 'center', mt: 1, ml: 2 }}>
            <IconButton onClick={() => window.location.reload()}>
              <LuRefreshCcw color="#247FAD" size={20} />
            </IconButton>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChangePasswordHeader;
