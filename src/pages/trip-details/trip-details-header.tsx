import React from 'react';
import { Grid, Typography, IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { formatScore } from '../../utility/utilities';
import CompletedBox from '../../assets/icons/completed-box.png';
import ActiveNavigation from '../../assets/icons/active-navigation.png';
import VehicleSafetyScoreBox from '../vehicle-details/vehicle-score-box';

const TripDetatilsHeader: React.FC<any> = ({ tripId, trips }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2} display="flex" alignItems="center" justifyContent="space-between">
      <Grid item display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)}>
          <IoArrowBack />
        </IconButton>
        <Box ml={2} flexDirection="row" display="flex" alignItems="center">
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontSize: '1.4rem',
              fontWeight: 600,
              lineHeight: '32px',
              textAlign: 'left',
            }}
          >
            {tripId || 'NA'}
          </Typography>
          <Box
            sx={{
              border: trips?.tripStatus === 'Completed' ? '1px solid #427890' : '1px solid #d3c7b2',
              borderRadius: '10px',
              bgcolor: trips?.tripStatus === 'Completed' ? '#F6FFFA' : '#fbf3e4',
              px: 1,
              ml: 1,
            }}
          >
            {trips?.tripStatus === 'Completed' ? (
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
                <img src={CompletedBox} />
                &nbsp; Completed
              </Typography>
            ) : (
              <Typography
                sx={{
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'orange',
                  py: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                <img src={ActiveNavigation} />
                &nbsp; Started
              </Typography>
            )}
          </Box>
        </Box>
      </Grid>
      <Grid item display="flex" alignItems="center">
        <VehicleSafetyScoreBox score={formatScore(trips?.tripScore)} />
      </Grid>
    </Grid>
  );
};

export default TripDetatilsHeader;
