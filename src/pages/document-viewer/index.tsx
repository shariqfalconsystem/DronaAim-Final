import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const DocumentViewer = () => {
  const { docId } = useParams(); // Get document ID from the route
  const [searchParams] = useSearchParams(); // Get query parameters
  const signedUrl = searchParams.get('signedUrl'); // Extract signedUrl

  if (!signedUrl) {
    return (
      <Box sx={{ textAlign: 'center', padding: 4 }}>
        <Typography variant="h6" color="error">
          Invalid or missing document link.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Document Viewer
      </Typography>

      <Box sx={{ border: '1px solid #ccc', marginBottom: 2 }}>
        <iframe
          src={signedUrl}
          title="Document Viewer"
          style={{ width: '100%', height: '600px', border: 'none' }}
        ></iframe>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          window.open(signedUrl, '_blank');
        }}
      >
        Download Document
      </Button>
    </Box>
  );
};

export default DocumentViewer;
