import React from 'react';
import { Paper, Typography, Box, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StatusCardProps {
  icon: any;
  title: string;
  value: number | any;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  background: 'linear-gradient(180deg, #FFFFFF 0%, #E9F8FF 100%)',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(2),
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ContentWrapper = styled(Box)({
  flexGrow: 1,
});

const StatusCard: React.FC<StatusCardProps> = ({ icon: Icon, title, value }) => {
  return (
    <StyledPaper elevation={0}>
      <IconWrapper>
        <img src={Icon} alt={title} style={{ width: '60px', height: '40px', color: '#495057' }} />
      </IconWrapper>
      <ContentWrapper>
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h5" component="div" fontWeight="bold">
          {value?.toLocaleString()}
        </Typography>
      </ContentWrapper>
    </StyledPaper>
  );
};

export default StatusCard;
