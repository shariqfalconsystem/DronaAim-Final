import React from 'react';
import { Grid, Typography, IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import SafetyScoreBox from '../vehicle-details/safety-score-box';
import CompletedBox from '../../assets/icons/completed-box.png';
import { formatScore } from '../../utility/utilities';
import { vehicles } from '../fleet-tracking/vehicle-data';
import { RiCheckboxCircleFill, RiCheckboxCircleLine, RiCloseCircleFill, RiDashboard2Line } from '@remixicon/react';
import { LuRefreshCcw } from 'react-icons/lu';
import VehicleSafetyScoreBox from './driver-score-box';
import InfoItem from '../vehicle-details/info-item';
import { GiPathDistance } from 'react-icons/gi';

interface TripHeaderProps {
  driverId: string | any;
  state: any;
  latestTrip: any;
  totalDriverTrips: any;
}

const DriverDetailsHeader: React.FC<TripHeaderProps> = ({ driverId, state, latestTrip, totalDriverTrips }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2} display="flex" alignItems="center" justifyContent="space-between">
      <Grid item display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)}>
          <IoArrowBack />
        </IconButton>
        <Box ml={2} flexDirection="row" display="flex" alignItems="center">
          <Box display="flex" flexDirection="column" sx={{ paddingRight: 2, borderRight: '2px solid #2C3E50' }}>
            <Typography
              variant="h5"
              component="span"
              sx={{
                fontSize: '1.4rem',
                fontWeight: 600,
                lineHeight: '32px',
                textAlign: 'left',
                color: '#2C3E50',
              }}
            >
              {driverId}
            </Typography>
            <Typography variant="h6" component="span" sx={{ fontSize: '0.9rem', color: '#2C3E50' }}>
              {state?.firstName + ' ' + state?.lastName}
            </Typography>
          </Box>
          <Box
            sx={{
              border: latestTrip?.tripStatus === 'Started' ? '1px solid green' : '1px solid red',
              borderRadius: '10px',
              bgcolor: '#F6FFFA',
              px: 1,
              ml: 3,
            }}
          >
            {latestTrip?.tripStatus === 'Started'  && !latestTrip?.isOrphaned ?  (
              <Typography
                sx={{
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'green',
                  py: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                <RiCheckboxCircleFill color="#00a650" />
                &nbsp; On Trip
              </Typography>
            ) : (
              <Typography
                sx={{
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'red',
                  py: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                <RiCloseCircleFill color="#ff0000" />
                &nbsp; Off Trip
              </Typography>
            )}
          </Box>
          <Box sx={{ alignItems: 'center', mt: 1, ml: 2 }}>
            <IconButton onClick={() => window.location.reload()}>
              <LuRefreshCcw color="#247FAD" size={20} />
            </IconButton>{' '}
          </Box>
        </Box>
      </Grid>
      <Grid item display="flex" alignItems="center">
        <Box>
          <InfoItem
            icon={<GiPathDistance color="#3F5C78" size={25} className="trip-icon" />}
            value={totalDriverTrips ? totalDriverTrips : '0'}
            label="Total Trips"
            styles={{ marginX: 1 }}
          />
        </Box>
        <VehicleSafetyScoreBox score={formatScore(state?.meanScore)} label="Driver Score" />
      </Grid>
    </Grid>
  );
};

export default DriverDetailsHeader;
