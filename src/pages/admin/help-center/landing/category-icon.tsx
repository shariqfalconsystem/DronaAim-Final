import React from 'react';
import { Box } from '@mui/material';
import UserManualIcon from '../../../../assets/icons/user-manual.png';
import AllTopicsIcon from '../../../../assets/icons/all-topics.png';
import TroubleshootingIcon from '../../../../assets/icons/troubleshooting.png';
import SupportiveIcon from '../../../../assets/icons/supportive.png';
import FaqIcon from '../../../../assets/icons/FAQ.png';

interface CategoryIconProps {
  type: string;
  selected: boolean;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ type, selected }) => {
  // Choose the appropriate icon based on type
  const getIconSrc = () => {
    switch (type) {
      case 'list':
        return AllTopicsIcon;
      case 'file':
        return UserManualIcon;
      case 'tools':
        return TroubleshootingIcon;
      case 'headset':
        return SupportiveIcon;
      case 'question':
        return FaqIcon;
      default:
        return AllTopicsIcon;
    }
  };

  return (
    <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box
        component="img"
        src={getIconSrc()}
        alt={`${type} icon`}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: selected ? 'brightness(0) invert(1)' : 'none', // Invert to white when selected
        }}
      />
    </Box>
  );
};

export default CategoryIcon;
