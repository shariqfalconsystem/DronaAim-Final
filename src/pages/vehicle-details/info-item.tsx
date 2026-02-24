import React from 'react';
import { Grid, Avatar, Typography, Box, useTheme } from '@mui/material';

interface InfoItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  styles?: any;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, value, label, styles }) => {
  const theme: any = useTheme();

  return (
    <Grid
      item
      sx={{
        display: 'flex',
        width: 'auto',
        height: 50,
        alignItems: 'center',
        border: '2px solid #9CACBA',
        borderRadius: '8px',
        padding: 1,
        flexWrap: 'nowrap',
        ...styles,
      }}
    >
      <Avatar
        sx={{
          marginRight: '10px',
          backgroundColor: theme.palette.common.white,
          color: theme.palette.primary.main,
          width: 38,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Avatar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography align="center" variant="h6" sx={{ lineHeight: 1, fontSize: '1rem' }}>
          {value}
        </Typography>
        <Typography align="left" variant="caption" color="text.primary" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Box>
    </Grid>
  );
};

export default InfoItem;
