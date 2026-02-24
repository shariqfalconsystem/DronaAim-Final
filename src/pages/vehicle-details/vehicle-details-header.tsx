import React from 'react';
import { Grid, Typography, IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { RiCheckboxCircleFill, RiCloseCircleFill } from '@remixicon/react';
import { LuRefreshCcw } from 'react-icons/lu';
import VehicleSafetyScoreBox from './vehicle-score-box';
import { formatScore } from '../../utility/utilities';

interface TripHeaderProps {
  vin: string | any;
  state: any;
}

const VehicleDetailsHeader: React.FC<TripHeaderProps> = ({ vin, state }) => {
  const navigate = useNavigate();

  const renderStatus = () => {
    if (state?.vehicleStatus === 'active') {
      return (
        <Typography
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'green',
            py: 0.5,
            fontSize: '0.75rem',
          }}
        >
          <RiCheckboxCircleFill color="#00a650" />
          &nbsp; Active
        </Typography>
      );
    } else if (state?.vehicleStatus === 'inactive') {
      return (
        <Typography
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'red',
            py: 0.5,
            fontSize: '0.75rem',
          }}
        >
          <RiCloseCircleFill color="#ff0000" />
          &nbsp; Inactive
        </Typography>
      );
    } else {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            py: 0.5,
          }}
        >
          <Typography
            sx={{
              color: '#4a4a4a',
              bgColor: '#e0e0e0',
              fontSize: '0.75rem',
            }}
          >
            NA
          </Typography>
        </Box>
      );
    }
  };

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
            {vin}
          </Typography>
          <Box
            sx={{
              border:
                status === 'Completed'
                  ? '1px solid red'
                  : status === 'Started'
                  ? '1px solid green'
                  : '1px solid #4a4a4a',
              borderRadius: '10px',
              bgcolor: status === 'Completed' ? '#FFF6F6' : status === 'Started' ? '#F6FFFA' : '#F5F5F5',
              px: 1,
              ml: 1,
              minHeight: '32px',
              minWidth: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderStatus()}
          </Box>
          <Box sx={{ alignItems: 'center', mt: 1, ml: 2 }}>
            <IconButton onClick={() => window.location.reload()}>
              <LuRefreshCcw color="#247FAD" size={20} />
            </IconButton>
          </Box>
        </Box>
      </Grid>
      <Grid item display="flex" alignItems="center">
        <VehicleSafetyScoreBox score={formatScore(state?.meanScore)} label="Vehicle Score" />
      </Grid>
    </Grid>
  );
};

export default VehicleDetailsHeader;
