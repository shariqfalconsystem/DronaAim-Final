import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper, Avatar } from '@mui/material';
import NotificationManagerUI from './notification-manager';
import ChangeSettingHeader from './notification-manager-header';
import NotificationIcon from '../../assets/icons/NotificationIcon.png';
import { useSelector } from 'react-redux';
import { getNotificationSettings } from '../../services/insurer/settingsServices';

const ChangeSetting = () => {
  const currentUserId: string = useSelector((state: any) => state.auth.currentUserId);
  const currentRole: string = useSelector((state: any) => state.auth.currentUserRole);
  //const currentRole='insurerSuperUser';

  const [notificationData, setNotificationData] = useState<any[]>([]);
  const [iconBaseUrl, setIconBaseUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(1000);
  const [activeTab, setActiveTab] = useState<'FM' | 'Driver'>('FM');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotificationSettings([currentRole], currentUserId, page, pageSize);
      setNotificationData(response?.data?.notificationSettings || []);
      setIconBaseUrl(response?.data?.notificationSettingsIconUrl || '');
    } catch (err: any) {
      console.error('Error fetching notification settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = async () => {
    try {
      await fetchData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    if (currentUserId && currentRole) {
      fetchData();
    }
  }, [currentUserId, currentRole, activeTab]);

  return (
    <Box>
      <ChangeSettingHeader />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F5F5', alignItems: 'flex-start', mt: 1 }}>
        <List sx={{ backgroundColor: '#DFE8F0', p: 3, borderRadius: 2, ml: 2, mt: 4 }}>
          <ListItem
            sx={{
              mb: 3,
              mx: 1,
              borderRadius: 2,
              bgcolor: '#247FAD',
              color: '#fff',
              '&:hover': { bgcolor: 'primary.50' },
              cursor: 'pointer',
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar src={NotificationIcon} sx={{ width: 24, height: 24 }} />
            </ListItemIcon>
            <ListItemText primary="Notification" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
          </ListItem>
        </List>

        <Paper
          sx={{
            position: 'relative',
            width: '960px',
            borderRadius: 4,
            boxShadow: 1,
            borderRight: '1px solid',
            borderColor: 'grey.200',
            minHeight: '100px',
            ml: 4,
            mr: 2,
            mt: 4,
            mb: 4,
            // overflowY: 'auto',
            p: 2,
          }}
        >
          <NotificationManagerUI
            notificationData={notificationData}
            loading={loading}
            error={error}
            persona={currentRole}
            loggedInUserId={currentUserId}
            iconBaseUrl={iconBaseUrl}
            onDataUpdate={handleDataUpdate}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default ChangeSetting;
