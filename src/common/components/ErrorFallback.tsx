import React from 'react';
import { Box, Typography, Button, Container, Link } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { keyframes } from '@emotion/react';

// Define a simple fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface ErrorFallbackProps {
  resetErrorBoundary?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ resetErrorBoundary }) => {

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        textAlign: 'center',
        animation: `${fadeIn} 0.5s ease-out`,
      }}
      disableGutters
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          animation: `${fadeIn} 0.5s ease-out`,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: '#f44336', animation: `${fadeIn} 0.5s ease-out` }} />
      </Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2, color: '#333', animation: `${fadeIn} 0.5s ease-out` }}>
        Oops! Something went wrong.
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#555', animation: `${fadeIn} 0.5s ease-out` }}>
        We’re sorry for the inconvenience. Please try refreshing the page or contact support if the issue persists.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleReload}
        sx={{
          textTransform: 'none',
          fontWeight: 'bold',
          borderRadius: 2,
          px: 4,
          mb: 2,
          animation: `${fadeIn} 0.5s ease-out`,
        }}
      >
        Refresh Page
      </Button>
    </Container>
  );
};

export default ErrorFallback;
