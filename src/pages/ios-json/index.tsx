import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useEffect } from 'react';

const IosJson = () => {
  useEffect(() => {
    // JSON content to download
    const jsonContent = {
      applinks: {
        apps: [],
        details: [
          {
            appID: '35BK495C44.com.connectedx.lonestar',
            paths: ['*'],
          },
        ],
      },
    };

    // Create a blob and a link to trigger download
    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'apple-app-site-association.json';
    link.click();

    // Cleanup the URL object
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Container maxWidth={false} disableGutters={false}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          verticalAlign: 'middle',
          height: '80vh',
        }}
      >
        <Typography color="black" variant="h4">
          Downloading iOS JSON File...{' '}
        </Typography>
      </Box>
    </Container>
  );
};

export default IosJson;
