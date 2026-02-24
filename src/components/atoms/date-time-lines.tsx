import { Box, Typography } from '@mui/material';

const formatDateTimeForTripTable = (date: string, time: string) => {
  if ((!date && !time) || (date == 'NA' && time == 'NA')) return 'NA';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
        {date || ''}
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
        {time || ''}
      </Typography>
    </Box>
  );
};

export default formatDateTimeForTripTable;
