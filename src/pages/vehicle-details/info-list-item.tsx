import React from 'react';
import { ListItem, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';

const DotIcon = () => (
  <Box
    component="span"
    sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      bgcolor: 'text.primary',
      display: 'inline-block',
    }}
  />
);

interface InfoListItemProps {
  label: string;
  value: string | number;
}

const InfoListItem: React.FC<InfoListItemProps> = ({ label, value }) => {
  return (
    <ListItem>
      <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
        <DotIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body1" align="left">
            <span style={{ color: 'black' }}>{label}:</span>{' '}
            <span style={{ color: '#247FAC', fontWeight: 'bold' }}>{value}</span>
          </Typography>
        }
      />
    </ListItem>
  );
};

export default InfoListItem;
