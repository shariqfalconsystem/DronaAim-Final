import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { roleLabels } from '../../common/constants/general';

interface OrganizationCardProps {
  orgRole: any;
  isActive: boolean;
  onSelect: (orgRole: any) => void;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({ orgRole, isActive, onSelect }) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 1 }}>
      <Paper
        sx={{
          p: 1,
          height: 100,
          bgcolor: isActive ? '#E8F4FD' : '#F8F9FA',
          border: isActive ? '2px solid #4CAF50' : '1px solid #E0E0E0',
          borderRadius: 2,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
        onClick={() => onSelect(orgRole)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, fontSize: '12px', color: '#666' }}>
            Organization Name :
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '12px', color: '#333', fontWeight: 500 }}>
            {orgRole?.name || orgRole?.lonestarId || orgRole?.insurerId || orgRole?.dronaaimId || 'N/A'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, fontSize: '12px', color: '#666' }}>
            Role :
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '12px', color: isActive ? '#4CAF50' : '#333', fontWeight: 600 }}>
            {roleLabels[orgRole.role] || orgRole.role}
          </Typography>
        </Box>

        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: theme.shadows[2],
            }}
          >
            ✓
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default OrganizationCard;
