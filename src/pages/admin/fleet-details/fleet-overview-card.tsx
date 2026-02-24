import { Box, Typography, Grid } from '@mui/material';
import MiniInfoCard from '../../../components/atoms/mini-info-card';
import { convertKmToMiles, formatTotalDistance, trimToTwoDecimals } from '../../../utility/utilities';
import TotalVehiclesIcon from '../../../assets/icons/total-vehicles.png';
import TotalDriversIcon from '../../../assets/icons/total-drivers.png';
import TotalDevicesIcon from '../../../assets/icons/total-devices.png';
import TotalMilesIcon from '../../../assets/icons/total-miles.png';

const FleetOverview = ({ fleetId, state, fleetStats }: any) => {
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
        <Grid item md={6.8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', mt: 1 }} gap={1}>
            <Typography variant="body2" color="text.secondary">
              Fleet ID : <span style={{ fontWeight: 'bold' }}>{state?.lonestarId || 'NA'} </span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Insured ID : <span style={{ fontWeight: 'bold' }}>{state?.insuredId ||'NA'} </span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              DOT Number : <span style={{ fontWeight: 'bold' }}> {state?.dotNumber || 'NA'} </span>
            </Typography>
          </Box>
        </Grid>
        <Grid item md={5.2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', mt: 1 }} gap={1}>
            <Typography variant="body2" color="text.secondary">
              Policy Number: <span style={{ fontWeight: 'bold' }}>{state?.lookup_Policies?.[0]?.policyId || 'NA'}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Garage Address : <span style={{ fontWeight: 'bold' }}>{state?.garageAddress || 'NA'} </span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mailing Address: <span style={{ fontWeight: 'bold' }}> {state?.mailingAddress || 'NA'} </span>
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
                <img src={TotalVehiclesIcon} alt="total-vehicles" width={35} height={26} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {`${fleetStats?.totalVehicles || '0'} vehicles `}
                </Typography>
                <Typography variant="caption" color="#fff" fontSize="0.7rem">
                  Total Vehicles
                </Typography>
              </Box>
            </MiniInfoCard>
            <MiniInfoCard width={235}>
              <Box>
                <img src={TotalDriversIcon} alt="total-vehicles" width={35} height={26} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {`${fleetStats?.totalDrivers || 0} drivers `}
                </Typography>
                <Typography variant="caption" color="#fff" fontSize="0.7rem">
                  Total Drivers
                </Typography>
              </Box>
            </MiniInfoCard>
            <MiniInfoCard width={235}>
              <Box>
                <img src={TotalDevicesIcon} alt="total-vehicles" width={35} height={26} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {`${fleetStats?.totalDevices || 0} devices `}
                </Typography>
                <Typography variant="caption" color="#fff" fontSize="0.7rem">
                  Total Devices
                </Typography>
              </Box>
            </MiniInfoCard>
            <MiniInfoCard width={235}>
              <Box>
                <img src={TotalMilesIcon} alt="total-vehicles" width={35} height={26} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {fleetStats?.totalMiles
                    ? `${formatTotalDistance(trimToTwoDecimals(convertKmToMiles(fleetStats?.totalMiles)))} miles `
                    : '0 miles'}
                </Typography>
                <Typography variant="caption" color="#fff" fontSize="0.7rem">
                  Total Miles
                </Typography>
              </Box>
            </MiniInfoCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FleetOverview;
