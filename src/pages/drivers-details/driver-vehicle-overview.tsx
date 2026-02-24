import React from 'react';
import { Card, CardContent, Grid, Typography, Box, useTheme, Divider } from '@mui/material';
import VehicleIcon from '../../assets/img/vehicle-photo.png';
import InfoItem from '../vehicle-details/info-item';
import { formatScore } from '../../utility/utilities';
import { GiPathDistance } from 'react-icons/gi';
import VehicleSafetyScoreBox from '../vehicle-details/vehicle-score-box';

interface DriverVehicleOverview {
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

const DriverVehicleOverview: React.FC<any> = ({ vehicleStats, vehicleDetails }) => {
  const theme: any = useTheme();

  return (
    <Card sx={{ width: 'auto', borderRadius: '10px' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid
            item
            container
            alignItems="center"
            sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={VehicleIcon} alt="Truck" style={{ width: '60px', height: '60px' }} />
              <Box>
                <Typography variant="h6" sx={{ pl: 2, fontSize: '1rem' }}>
                  Assigned Vehicles
                </Typography>

                <Typography align="left" variant="h6" sx={{ ml: 2, fontSize: '0.9rem' }}>
                  {vehicleDetails?.vehicleId || 'NA'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <VehicleSafetyScoreBox score={formatScore(vehicleDetails?.meanScore)} label="Vehicle Score" />
            </Box>
          </Grid>
          <Divider sx={{ mt: 2 }} />

          {/* Second Row */}
          <Grid item container sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '100fr auto 1fr',
                  gap: 1.1,
                  alignItems: 'center',
                }}
              >
                <Typography align="left" variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                  VIN Number
                </Typography>
                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  : {vehicleDetails?.vin || 'NA'}
                </Typography>
                <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC" sx={{ fontSize: '0.8rem' }}>
                  {/* {driver.phoneNumber} */}
                </Typography>

                <Typography align="left" variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                  Device ID
                </Typography>
                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  : {vehicleDetails?.deviceId || 'NA'}
                </Typography>
                <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC" sx={{ fontSize: '0.8rem' }}>
                  {/* {driver.age} */}
                </Typography>

                <Typography align="left" variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                  Device Provider
                </Typography>
                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  : {vehicleStats?.deviceProvider || 'NA'}
                </Typography>
                <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC" sx={{ fontSize: '0.8rem' }}>
                  {/* {driver.licenceType} */}
                </Typography>

                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  Total Miles (device)
                </Typography>
                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  : {vehicleStats?.totalDistanceInMiles || '0'}
                </Typography>
                <Typography
                  align="left"
                  variant="body2"
                  fontWeight="bold"
                  color="#247FAC"
                  sx={{ fontSize: '0.8rem' }}
                ></Typography>

                <Typography align="left" variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                  Make
                </Typography>
                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  : {vehicleDetails?.make || 'NA'}
                </Typography>
                <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC" sx={{ fontSize: '0.8rem' }}>
                  {/* {driver.runTime} */}
                </Typography>

                <Typography align="left" variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                  Model
                </Typography>
                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  : {vehicleDetails?.model || 'NA'}
                </Typography>
                <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC" sx={{ fontSize: '0.8rem' }}>
                  {/* {driver.runTime} */}
                </Typography>

                <Typography align="left" variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                  Year
                </Typography>
                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  : {vehicleDetails?.year || 'NA'}
                </Typography>
                <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC" sx={{ fontSize: '0.8rem' }}>
                  {/* {driver.runTime} */}
                </Typography>

                <Typography align="left" variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                  License Plate
                </Typography>
                <Typography align="left" variant="body2" sx={{ fontSize: '0.8rem' }}>
                  : {vehicleDetails?.tagLicencePlateNumber || 'NA'}
                </Typography>
                <Typography align="left" variant="body2" fontWeight="bold" color="#247FAC" sx={{ fontSize: '0.8rem' }}>
                  {/* {driver.runTime} */}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <InfoItem
                  icon={<GiPathDistance size={30} color="#3F5C78" className="home-icon" />}
                  value={vehicleStats?.totalTrips || '0'}
                  label="Total Trips"
                  styles={{ marginX: 1, minWidth: '150px' }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DriverVehicleOverview;
