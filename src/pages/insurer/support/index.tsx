import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Container, Grid } from '@mui/material';
import { Email, Language, Phone } from '@mui/icons-material';
import SupportIllustration from '../../../assets/img/support-illustration.png';
import { getUserById } from '../../../services/fleetManager/driverServices';
import SupportEmailModal from './support-email-modal';
import { useSelector } from 'react-redux';
import environment from '../../../environments/environment';

const SupportScreen = () => {
  const insurerId = useSelector((state: any) => state.auth.currentUserId);
  const [userInfo, setUserInfo] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUserInfo = useCallback(async () => {
    if (!insurerId) return;
    try {
      const { status, data } = await getUserById(insurerId);
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    }
  }, [insurerId]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const toggleModal = () => {
    setIsModalOpen(true);
  };

  return (
    <Container maxWidth={false}>
      <Grid
        container
        spacing={2}
        sx={{
          margin: 'auto',
          padding: 3,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '90vh',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: '#334155', fontWeight: 'bold', textAlign: 'center' }}
        >
          Support
        </Typography>
        <Card sx={{ backgroundColor: '#F1F5F9', boxShadow: 'none', px: 4 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" sx={{ color: '#334155', fontWeight: 'medium', mb: 8, fontSize: '1.2rem' }}>
                <span
                  style={{
                    textDecoration: 'underline',
                    textUnderlineOffset: '10px',
                    textDecorationThickness: '3px',
                  }}
                >
                  Please
                </span>{' '}
                contact us for any help and support at
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 4 }}>
                <Email sx={{ color: '#64748B', mr: 1 }} />
                <Typography
                  variant="body2"
                  sx={{ color: '#334155', fontSize: '1.1rem', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={toggleModal}
                >
                  <a>{environment.supportEmail}</a>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                <Phone sx={{ color: '#64748B', mr: 1 }} />
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '1.1rem' }}>
                  +1(817)-865-5261
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                <Language sx={{ color: '#64748B', mr: 1 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#334155',
                    fontSize: '1.1rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    '& a': {
                      color: 'blue',
                      textDecorationColor: 'blue',
                    },
                    '& a:active': {
                      color: 'blue',
                    },
                  }}
                >
                  <a href="https://dronaaim.ai/" target="_blank" rel="noopener noreferrer">
                    https://dronaaim.ai/
                  </a>
                </Typography>
              </Box>
            </Box>
            <Box
              component="img"
              src={SupportIllustration}
              alt="Support illustration"
              sx={{ width: 450, height: 250 }}
            />
          </CardContent>
        </Card>
      </Grid>
      <SupportEmailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        insurerId={insurerId}
        insurerName={userInfo?.firstName ? `${userInfo?.firstName} ${userInfo?.lastName}` : ''}
        insurerEmail={userInfo?.emailId || ''}
      />
    </Container>
  );
};

export default SupportScreen;
