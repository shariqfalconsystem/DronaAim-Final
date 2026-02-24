import React from 'react';
import { Chip, Box, ChipProps } from '@mui/material';
import { RiCheckboxCircleFill, RiCloseCircleFill, RiHourglass2Fill } from '@remixicon/react';

type VideoStatus = 'inProgress' | 'completed' | 'notFound' | 'completedWithLimits';

interface StatusConfig {
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  displayText: string;
}

const statusConfig: Record<VideoStatus, StatusConfig> = {
  completed: {
    icon: RiCheckboxCircleFill,
    color: '#00a650',
    bgColor: '#e6f7ed',
    displayText: 'Completed',
  },
  inProgress: {
    icon: RiHourglass2Fill,
    color: '#FF9800',
    bgColor: '#FFF3E0',
    displayText: 'In Progress',
  },
  notFound: {
    icon: RiCloseCircleFill,
    color: '#D24537',
    bgColor: '#FFF2F2',
    displayText: 'Not Found',
  },
  completedWithLimits: {
    icon: RiCheckboxCircleFill,
    color: '#00a650',
    bgColor: '#e6f7ed',
    displayText: 'Completed',
  },
};

interface VideoStatusChipProps extends Omit<ChipProps, 'icon'> {
  status: VideoStatus;
}

const VideoStatusChip: React.FC<VideoStatusChipProps> = ({ status, ...chipProps }) => {
  const config = statusConfig[status || 'notFound'];
  const Icon = config?.icon;

  return (
    <Chip
      icon={
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
          <Icon size={16} color={config?.color} />
        </Box>
      }
      label={config?.displayText}
      sx={{
        minWidth: '100px',
        backgroundColor: config?.bgColor,
        color: config?.color,
        border: `1px solid ${config?.color}`,
        borderRadius: '12px',
        fontWeight: '500',
        '& .MuiChip-icon': {
          marginLeft: '4px',
        },
      }}
      {...chipProps}
    />
  );
};

export default VideoStatusChip;
