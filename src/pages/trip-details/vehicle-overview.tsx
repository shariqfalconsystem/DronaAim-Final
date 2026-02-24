import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import InfoItem from '../vehicle-details/info-item';
import { RiShieldStarLine } from '@remixicon/react';
import VehicleIcon from '../../assets/img/vehicle-photo.png';
import { formatScore } from '../../utility/utilities';
import { useNavigate } from 'react-router-dom';
import VehicleSafetyScoreBox from '../vehicle-details/vehicle-score-box';
import TotalTripsIcon from '../../assets/icons/total-trips.png';
import { paths } from '../../common/constants/routes';

const VehicleOverview = ({ vin, imei, trips, vehicleStats, height }: any) => {
  const navigate = useNavigate();

  const navigateToVehicleDetails = () => {
    navigate(`${paths.VEHICLEDETAILS}/${vin}/`, { replace: true, state: { ...trips, fromTripDetails: true } });
  };

  return (
    <Card sx={{ borderRadius: '10px', height: height ? height : 'auto' }}>
      <CardContent>
        <Grid
          container
          spacing={2}
          sx={{
            height: 'auto',
            padding: 0,
            borderRadius: '10px',
          }}
        >
          <Grid
            item
            md={2}
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
            }}
          >
            <img src={VehicleIcon} style={{ width: '100%', height: '100%' }} />
          </Grid>
          <Grid
            item
            xs={7}
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography textAlign="left" sx={{ fontSize: '1rem', lineHeight: 2 }}>
                VIN Number: &nbsp;
                <span style={{ color: 'black', fontWeight: '600' }}>{vin && vin !== 'undefined' ? vin : 'NA'}</span>
              </Typography>

              <Typography
                textAlign="left"
                sx={{
                  fontSize: '0.9rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  textWrap: 'nowrap',
                }}
              >
                Vehicle ID: &nbsp;
                <span style={{ color: 'black' }}>{trips?.vehicleId ?? 'NA'}</span>
              </Typography>

              <Typography
                textAlign="left"
                sx={{
                  fontSize: '0.9rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  textWrap: 'nowrap',
                  mt: 1,
                }}
              >
                Device ID: &nbsp;
                <span style={{ color: 'black' }}> {trips?.deviceId ?? 'NA'}</span>
              </Typography>

              <Typography
                textAlign="left"
                sx={{
                  fontSize: '0.9rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  textWrap: 'nowrap',
                  mt: 1,
                }}
              >
                IMEI Number: &nbsp;
                <span style={{ color: 'black' }}> {trips?.imei ?? 'NA'}</span>
              </Typography>

              <Typography
                textAlign="left"
                sx={{
                  fontSize: '0.9rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  textWrap: 'nowrap',
                  mt: 1,
                }}
              >
                Device Provider: &nbsp;
                <span style={{ color: 'black' }}> {vehicleStats?.deviceProvider ?? 'NA'}</span>
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            container
            xs={3}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              flexDirection: 'row',
              alignItems: 'start',
            }}
          >
            <VehicleSafetyScoreBox score={formatScore(vehicleStats?.meanScore)} label="Vehicle Score" />
          </Grid>
        </Grid>

        <Grid
          container
          spacing={0}
          sx={{
            padding: '8px 0 0px 0',
            height: '10%',
            marginTop: 5,
            justifyContent: 'flex-start',
            display: 'flex',
            alignItems: 'end',
          }}
        >
          <InfoItem
            icon={<RiShieldStarLine size={30} color="#3F5C78" className="home-icon" />}
            value={vehicleStats?.totalDistanceInMiles || '0'}
            label="Total Miles(Device)"
          />

          <Box component="span" onClick={navigateToVehicleDetails} sx={{ cursor: 'pointer' }}>
            <InfoItem
              icon={<img src={TotalTripsIcon} />}
              value={vehicleStats?.tripsCount || '0'}
              label="Total Trips"
              styles={{ marginX: 1 }}
            />
          </Box>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default VehicleOverview;
