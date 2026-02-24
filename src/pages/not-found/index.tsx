import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #e9eff5 100%)',
        px: 3,
      }}
    >
      {/* Main Title */}
      <Typography
        variant="h1"
        sx={{
          fontSize: '5rem',
          fontWeight: '800',
          color: '#ff3d00',
          letterSpacing: '-2px',
          mb: 1,
          '@media (max-width: 768px)': {
            fontSize: '3.5rem',
          },
        }}
      >
        Oops!
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="h6"
        sx={{
          fontSize: '1.5rem',
          fontWeight: '500',
          color: '#5f6368',
          mb: 2,
        }}
      >
        We can't find the page you're looking for.
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          fontSize: '1rem',
          color: '#6b7177',
          mb: 4,
          maxWidth: '500px',
          lineHeight: 1.6,
        }}
      >
        The link might be broken, or the page may have been removed. Check the URL or head back to the homepage.
      </Typography>

      {/* Button */}
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{
          backgroundColor: '#007bff',
          color: '#fff',
          fontWeight: 'bold',
          textTransform: 'none',
          borderRadius: '25px',
          px: 5,
          py: 1.5,
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: '#0056b3',
          },
        }}
      >
        Go Back Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
