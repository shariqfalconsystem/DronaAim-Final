import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Person, Lock } from '@mui/icons-material';

interface SidebarItem {
  text: string;
  icon: React.ReactNode;
  active: boolean;
}

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, setActiveTab }) => {
  const sidebarItems: SidebarItem[] = [
    { text: 'Profile', icon: <Person />, active: activeTab === 'Profile' },
    { text: 'Change password', icon: <Lock />, active: activeTab === 'Change password' },
  ];

  return (
    <List sx={{ backgroundColor: '#DFE8F0', p: 3, borderRadius: 2, ml: 2, mt: 4 }}>
      {sidebarItems.map((item, index) => (
        <ListItem
          key={index}
          sx={{
            mb: 3,
            mx: 1,
            borderRadius: 2,
            bgcolor: item.active ? '#247FAD' : 'transparent',
            color: item.active ? '#fff' : 'grey.700',
            '&:hover': {
              bgcolor: item.active ? 'primary.50' : 'grey.100',
            },
            cursor: 'pointer',
          }}
          onClick={() => setActiveTab(item.text)}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ProfileSidebar;
