import { Typography, Box } from '@mui/material';
import ShieldIcon from '../../assets/icons/shield.png';
import { RiShieldStarLine } from '@remixicon/react';

const DriverSafetyScoreBox = ({ score, label, width, height, imageHeight, textColored, textSize }: any) => {
  const getBackgroundColor = (score: number) => {
    if (score >= 90) return '#F6FFFA';
    if (score >= 80) return '#FF98000D';
    return '#FFF2F2';
  };

  const getBorderColor = (score: number) => {
    if (score >= 90) return '#00833480';
    if (score >= 80) return '#FF980080';
    return '#FF363666';
  };

  const getTextColor = (score: number) => {
    if (score >= 90) return '#1C7C44';
    if (score >= 80) return '#FF9800';
    return '#D24537';
  };

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
        backgroundColor: getBackgroundColor(score),
        border: `2px solid ${getBorderColor(score)}`,
        color: 'black',
        fontWeight: 'bold',
      }}
    >
      <Box>
        <RiShieldStarLine color={getTextColor(score)} size={imageHeight ?? 20} />
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
        <Typography
          variant="h6"
          lineHeight={0.5}
          fontSize={textSize ?? '1.1rem'}
          color={textColored ? getTextColor(score) : '#000'}
        >
          {score || 'NA'}
        </Typography>
        <Typography variant="caption" lineHeight={1} color={textColored ? getTextColor(score) : '#000'}>
          {label ?? 'Trip Score'}
        </Typography>
      </Box>
    </Box>
  );
};

export default DriverSafetyScoreBox;
