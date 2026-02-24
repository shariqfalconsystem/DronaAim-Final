import { Box, Typography, Grid, Chip } from '@mui/material';
import ChipWithIcon from '../../components/atoms/chip-with-icon';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const SafetyScoreAnalysis = ({ trips, eventCounts, totalCount }: any) => {
  const riskFactors = [
    {
      label: 'Speeding',
      count: eventCounts['Speed'] || 0,
      scoreImpact: 'NA',
    },
    {
      label: 'Harsh Acceleration',
      count: eventCounts['Accelerate'] || 0,
      scoreImpact: 'NA',
    },
    {
      label: 'Harsh Braking',
      count: eventCounts['Brake'] || 0,
      scoreImpact: 'NA',
    },
    {
      label: 'Harsh Cornering',
      count: eventCounts['Turn'] || 0,
      scoreImpact: 'NA',
    },
    {
      label: 'Impact',
      count: eventCounts['Shock'] || 0,
      scoreImpact: 'NA',
    },
    {
      label: 'Severe Impact',
      count: eventCounts['SevereShock'] || 0,
      scoreImpact: 'NA',
    },
    {
      label: 'SOS',
      count: eventCounts['PanicButton'] || 0,
      scoreImpact: 'NA',
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.common.white,
        borderRadius: '10px',
      }}
    >
      <Grid
        item
        container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          mb: 1,
          borderBottom: '1px solid grey',
          padding: '20px',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
          Events Overview
        </Typography>
        <Chip
          icon={<ReportProblemIcon color="error" fontSize="small" />}
          label={'Total ' + totalCount + ' events'}
          variant="outlined"
          sx={{ p: 1, bgcolor: '#FBEDEB' }}
        />{' '}
      </Grid>

      <Grid container spacing={2} sx={{ p: '0 20px 10px 20px', justifyContent: 'space-between' }}>
        <Grid item xs={4}>
          <Typography variant="h6" sx={{ fontSize: '1rem' }}>
            Events
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="h6" align="center" sx={{ fontSize: '1rem' }}>
            Count
          </Typography>
        </Grid>
      </Grid>
      {riskFactors.map((factor: any, index: any) => (
        <Grid
          container
          spacing={2}
          key={index}
          sx={{
            p: '0 15px 15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Grid item xs={4}>
            <Typography variant="body1" color="#247FAD">
              {factor.label}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body1" align="center" color="#247FAD">
              {factor.count !== 'NA'
                ? `${factor.count} ${parseInt(factor.count) !== 1 ? 'events' : 'event'}`
                : factor.count}{' '}
            </Typography>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default SafetyScoreAnalysis;
