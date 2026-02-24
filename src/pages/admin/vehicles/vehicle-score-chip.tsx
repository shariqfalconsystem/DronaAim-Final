import { styled } from '@mui/material/styles';
import { Box, BoxProps } from '@mui/material';

interface VehicleScoreChipProps extends BoxProps {
  score: number;
}

export const VehicleScoreChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'score',
})<VehicleScoreChipProps>(({ score, theme }) => ({
  backgroundColor: score >= 60 ? '#e6f7ed' : '#ffe6e6',
  color: score >= 60 ? '#00a650' : '#ff0000',
  border: `1px solid ${score >= 60 ? '#00a650' : '#ff0000'}`,
  borderRadius: '8px',
  padding: '10px 20px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
}));
