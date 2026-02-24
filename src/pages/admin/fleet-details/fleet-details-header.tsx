import React from 'react';
import { Grid, Typography, IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { RiCheckboxCircleFill, RiCheckboxCircleLine, RiCloseCircleFill } from '@remixicon/react';
import { LuRefreshCcw } from 'react-icons/lu';
import VehicleSafetyScoreBox from '../../vehicle-details/vehicle-score-box';
import { formatScore } from '../../../utility/utilities';
import FleetLogo from '../../../assets/img/fleet-logo.png';

interface TripHeaderProps {
  vin: string | any;
  status: any;
  state: any;
}

const FleetDetailsHeader: React.FC<any> = ({ vin, status, state }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2} display="flex" alignItems="center" justifyContent="space-between">
      <Grid item display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)}>
          <IoArrowBack />
        </IconButton>
        <Box ml={2} flexDirection="row" display="flex" alignItems="center">
          <Box sx={{ mr: 2 }}>
            <img src={FleetLogo} width={50} height={50} />
          </Box>
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
            {state?.name}
          </Typography>
        </Box>
      </Grid>
      <Grid item display="flex" alignItems="center">
        <VehicleSafetyScoreBox score={formatScore(state?.meanScore || 'NA')} label="Fleet Score" />
      </Grid>
    </Grid>
  );
};

export default FleetDetailsHeader;
