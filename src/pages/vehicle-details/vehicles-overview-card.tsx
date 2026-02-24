import { Box, Typography, Grid } from '@mui/material';
import VehicleIcon from '../../assets/img/vehicle-photo.png';
import MiniInfoCard from '../../components/atoms/mini-info-card';
import { ImMeter } from 'react-icons/im';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { GiPathDistance } from 'react-icons/gi';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { CalculateAndFormatDuration } from '../../utility/utilities';

const VehicleOverview = ({
  Vin,
  vehicleStats,
  lookup_devices,
  deviceId,
  make,
  model,
  year,
  tagLicencePlateNumber,
}: any) => {
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={VehicleIcon} alt="Truck" style={{ width: '100px', height: '80px', marginRight: '20px' }} />

            <Box>
              <Typography variant="subtitle1">VIN Number: {Vin ?? 'NA'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Device ID : {deviceId ?? 'NA'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Device Provider : {vehicleStats?.deviceProvider ?? 'NA'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                IMEI Number : {lookup_devices?.[0]?.imei ?? 'NA'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'left', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Make: {make ?? 'NA'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Model : {model ?? 'NA'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Year : {year ?? 'NA'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              License Plate: {tagLicencePlateNumber ?? 'NA'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item md={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <MiniInfoCard width={235}>
              <Box>
                <ImMeter color="white" size={25} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {vehicleStats?.totalDistanceInMiles ?? '0'}
                </Typography>
                <Typography variant="caption" color="#fff" fontSize="0.7rem">
                  Total Miles(Device)
                </Typography>
              </Box>
            </MiniInfoCard>
            <MiniInfoCard width={235}>
              <Box>
                <WarningAmberOutlinedIcon sx={{ color: '#fff', fontSize: 25 }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {vehicleStats?.totalIncidents ?? '0'}
                </Typography>
                <Typography variant="caption" color="#fff" fontSize="0.7rem">
                  Total Events
                </Typography>
              </Box>
            </MiniInfoCard>
            <MiniInfoCard width={235}>
              <Box>
                <GiPathDistance color="#fff" size={25} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {vehicleStats?.totalTrips ?? '0'}
                </Typography>
                <Typography variant="caption" color="#fff" fontSize="0.7rem">
                  Total Trips
                </Typography>
              </Box>
            </MiniInfoCard>
            <MiniInfoCard width={235}>
              <Box>
                <TimerOutlinedIcon sx={{ color: '#fff', mr: 1, fontSize: 25 }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {CalculateAndFormatDuration(vehicleStats?.totalDeviceHours) ?? '0'}
                </Typography>
                <Typography variant="caption" color="#fff" fontSize="0.7rem">
                  Total Hours(Device)
                </Typography>
              </Box>
            </MiniInfoCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleOverview;
