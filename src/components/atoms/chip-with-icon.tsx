import React from 'react';
import { Chip, Box, ChipProps } from '@mui/material';
import { RiCheckboxCircleFill, RiCloseCircleFill, RiHourglass2Fill, RiRefreshLine } from '@remixicon/react';

export type VehicleStatus =
  | 'Active'
  | 'active'
  | 'Idle'
  | 'Inactive'
  | 'inactive'
  | 'Repair'
  | 'DriverNotAssigned'
  | 'Online'
  | 'Offline'
  | 'notFound'
  | 'NA'
  | 'Expired'
  | 'Sync';

interface StatusConfig {
  icon: any;
  color: string;
  bgColor: string;
  label?: string;
}

const statusConfig: Record<VehicleStatus, StatusConfig> = {
  Active: {
    icon: RiCheckboxCircleFill,
    color: '#00a650',
    bgColor: '#e6f7ed',
  },
  active: {
    icon: RiCheckboxCircleFill,
    color: '#00a650',
    bgColor: '#e6f7ed',
  },
  Idle: {
    icon: RiHourglass2Fill,
    color: '#0088cc',
    bgColor: '#e6f3f7',
  },
  Inactive: {
    icon: RiCloseCircleFill,
    color: '#D24537',
    bgColor: '#FFF2F2',
  },
  inactive: {
    icon: RiCloseCircleFill,
    color: '#ff0000',
    bgColor: '#ffe6e6',
  },
  Repair: {
    icon: RiCheckboxCircleFill,
    color: '#ff0000',
    bgColor: '#ffe6e6',
  },
  DriverNotAssigned: {
    icon: RiCheckboxCircleFill,
    color: '#ff0000',
    bgColor: '#ffe6e6',
  },
  Online: {
    icon: RiCheckboxCircleFill,
    color: '#00a650',
    bgColor: '#e6f7ed',
  },
  Offline: {
    icon: RiCloseCircleFill,
    color: '#ff0000',
    bgColor: '#ffe6e6',
  },
  NA: {
    icon: '',
    color: '#4a4a4a',
    bgColor: '#f5f5f5',
  },
  notFound: {
    icon: RiCloseCircleFill,
    color: '#ff0000',
    bgColor: '#ffe6e6',
    label: 'Not Found',
  },
  Expired: {
    icon: RiCloseCircleFill,
    label: 'Expired',
    color: '#ff0000',
    bgColor: '#ffe6e6',
  },
  Sync: {
    icon: RiRefreshLine,
    color: '#022e0eff',
    bgColor: '#c6f4d9ff',
  },
};

interface ChipWithIconProps extends Omit<ChipProps, 'icon'> {
  status: VehicleStatus;
}

const ChipWithIcon: React.FC<ChipWithIconProps> = ({ status, ...chipProps }) => {
  const config = statusConfig[status] ?? {
    icon: RiCheckboxCircleFill,
    color: '#ff0000',
    bgColor: '#ffe6e6',
  };
  const Icon = config.icon;

  return (
    <Chip
      icon={
        status !== 'NA' ? (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
            <Icon size={16} color={config.color} />
          </Box>
        ) : undefined
      }
      label={config?.label || status}
      sx={{
        width: '100px',
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}`,
        borderRadius: '12px',
        fontWeight: '500',
        fontSize: '0.75rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 0,
        '& .MuiChip-icon': {
          marginLeft: '4px',
          marginRight: '0px',
        },
      }}
      {...chipProps}
    />
  );
};

export default ChipWithIcon;
