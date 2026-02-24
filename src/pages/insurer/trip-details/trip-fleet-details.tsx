import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

const TripFleetDetails = ({ state }: any) => {
  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        p: 2,
      }}
    >
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="body2" component="span">
            Fleet Name :&nbsp;
          </Typography>
          <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
            {state.lookup_fleetcompanies?.[0]?.name  || state?.fleetName || 'NA'}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2" component="span">
            Fleet ID :&nbsp;
          </Typography>
          <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
            {state?.lonestarId || state?.fleetId || 'NA'}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2" component="span">
            Insured ID :&nbsp;
          </Typography>
          <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
            {state.lookup_fleetcompanies?.[0]?.insuredId || 'NA'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TripFleetDetails;
