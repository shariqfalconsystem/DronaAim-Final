import { Typography, Box } from '@mui/material';
import ShieldIcon from '../../assets/icons/shield.png';

const SafetyScoreBox = ({ score, label, width, height, imageHeight }: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        py: 1,
        width: width ?? 150,
        height: height ?? 50,
        borderRadius: '10px',
        backgroundColor: '#F6FFFA',
        border: '1px solid #7bc197',
        color: 'black',
        fontWeight: 'bold',
      }}
    >
      <Box>
        <img src={ShieldIcon} alt="shield-icon" width={imageHeight ?? 30} height={imageHeight ?? 30} />
      </Box>
      <Box
        gap={0.5}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" lineHeight={0.5} fontSize="1.1rem">
          {score || 'NA'}
        </Typography>
        <Typography variant="caption" lineHeight={1}>
          {label ?? 'Trip Score'}
        </Typography>
      </Box>
    </Box>
  );
};

export default SafetyScoreBox;
