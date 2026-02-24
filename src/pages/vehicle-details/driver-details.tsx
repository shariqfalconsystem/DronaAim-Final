import React from 'react';
import { Card, CardContent, Grid, Typography, Avatar, Box, Chip, useTheme } from '@mui/material';
import { Person } from '@mui/icons-material';

interface DriverDetailsProps {
  driver: {
    name: string;
    id: string;
    phoneNumber: string;
    age: string;
    licenceType: string;
    licenceNumber: string;
    runTime: string;
    safetyScore: string;
    recentTrips: string;
  };
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ driver }) => {
  const theme: any = useTheme();

  return (
    <Card sx={{ width: 350, height: '350px', borderRadius: '10px' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          {/* First Row */}
          <Grid item container xs={12} alignItems="center">
            <Grid item xs={3}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.primary.main,
                }}
              >
                <Person />
              </Avatar>
            </Grid>
            <Grid item container xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography align="left" variant="subtitle1">
                {driverData.driverName || 'NA'}
              </Typography>
              <Typography align="left" variant="caption" color="text.secondary">
                ID: {driverData.driverId || 'NA'}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Chip label="Active" color="success" size="small" />
            </Grid>
          </Grid>

          {/* Second Row */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Typography align="left" variant="body2">
                Phone Number
              </Typography>
              <Typography align="left" variant="body2">
                :
              </Typography>
              <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC">
                {driver.phoneNumber || 'NA'}
              </Typography>

              <Typography align="left" variant="body2">
                Age
              </Typography>
              <Typography align="left" variant="body2">
                :
              </Typography>
              <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC">
                {driver.age || 'NA'}
              </Typography>

              <Typography align="left" variant="body2">
                License Type
              </Typography>
              <Typography align="left" variant="body2">
                :
              </Typography>
              <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC">
                {driver.licenceType || 'NA'}
              </Typography>

              <Typography align="left" variant="body2">
                License Number
              </Typography>
              <Typography align="left" variant="body2">
                :
              </Typography>
              <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC">
                {driverData.licenseNumber || 'NA'}
              </Typography>

              <Typography align="left" variant="body2">
                Run Time
              </Typography>
              <Typography align="left" variant="body2">
                :
              </Typography>
              <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC">
                {driver.runTime || 'NA'}
              </Typography>
            </Box>
          </Grid>

          {/* Third Row */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Grid container sx={{ height: 60 }}>
              <Grid item xs={6} sx={{ textAlign: 'center', bgcolor: '#ECF0F1', p: 1 }}>
                <Typography variant="h6">{driver.safetyScore}</Typography>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="body2">Safety Score</Typography>
                </Box>
              </Grid>
              <Grid
                item
                xs={6}
                sx={{
                  textAlign: 'center',
                  bgcolor: '#D3E5EF',
                  p: 1,
                }}
              >
                <Typography variant="h6">{driver.recentTrips}</Typography>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="body2">Recent Trips</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DriverDetails;

const driverData = {
  driverId: 'DRV001',
  driverName: 'ConnectedX 1',
  licenseNumber: '73HTSDB',
  driverStartDateTime: '',
  driverEndDateTime: '',
};
