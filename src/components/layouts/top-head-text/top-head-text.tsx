import React from 'react';
import { Grid, Typography } from '@mui/material';

interface VehiclesTableProps {
  vehicles: any[];
  handleVehicleClick: (vin: string) => void;
}

const UpperHeadText: React.FC<any> = ({ vehicles, handleVehicleClick }) => {
  return (
    <Grid item xs={12}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={7} container direction="column" alignItems="flex-start" textAlign="left">
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome Back, Tom
          </Typography>
          <Typography variant="subtitle1">
            Fleet management shouldn’t be complicated. It should be automated.
          </Typography>
        </Grid>
        <Grid item xs={5} justifyContent="flex-end"></Grid>
      </Grid>
    </Grid>
  );
};

export default UpperHeadText;
