import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Switch,
  Avatar,
  Collapse,
  IconButton,
  Checkbox,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { putNotificationSettings } from '../../services/insurer/settingsServices';
import { useSelector } from 'react-redux';
import DefaultIcon from '../../assets/icons/NotificationIcon.png';

const FM_DISABLED_FORMAT_NAMES = [
  'DRIVER_ONBOARDING_COMPLETE',
  'VEHICLE_ONBOARDING',
  'DEVICE_ONBOARDING',
  'DRIVER_DOCUMENT_NEARING_EXPIRY',
  'FLEET_SCORE_PERIODIC_UPDATES',
  'FLEET_SCORE_POOR',
  'FLEET_SCORE_MEDIAN',
  'VEHICLE_SCORE_POOR',
  'TRIP_EVENTS_SUMMARY',
  'VEHICLE_SCORE_MEDIAN',
  'DRIVER_SCORE_POOR',
  'DRIVER_SCORE_MEDIAN',
  'IMPACT_ALERT',
  'SEVERE_IMPACT_ALERT',
  'DRIVER_UNASSIGNED_TRIP',
  'DRIVER_ASSEST_DELETED',
  'VEHICLE_ASSEST_DELETED',
  'DEVICE_CONNECTION_LOST',
  'VEHICLE_MAINTENANCE_DUE',
];

const DRIVER_DISABLED_FORMAT_NAMES = [
  'TRIP_SCORE',
  'TRIP_EVENTS_SUMMARY',
  'SPEED_ALERT',
  'IMPACT_ALERT',
  'SEVERE_IMPACT_ALERT',
  'HARSH_CORNERING_ALERT',
  'HARSH_ACCELERATE_ALERT',
  'HARSH_BRAKE_ALERT',
  'DRIVER_SCORE_POOR',
  'DRIVER_SCORE_PERIODIC_UPDATES',
  'DRIVER_SCORE_MEDIAN',
  'DRIVER_PROFILE_UPDATE_REMINDER',
  'DRIVER_DOCUMENT_NEARING_EXPIRY',
];

interface NotificationManagerUIProps {
  notificationData: any[];
  loading: boolean;
  error: string | null;
  persona: string;
  loggedInUserId: string;
  iconBaseUrl: string;
  onDataUpdate?: () => void;
  activeTab: 'FM' | 'Driver';
  setActiveTab: (tab: 'FM' | 'Driver') => void;
}

const NotificationRow: React.FC<{
  notification: any;
  persona: string;
  loggedInUserId: string;
  iconBaseUrl: string;
  onDataUpdate?: () => void;
  activeTab: 'FM' | 'Driver';
}> = ({ notification, persona, loggedInUserId, iconBaseUrl, onDataUpdate, activeTab }) => {
  const orgId: any = 'LS1013'; // Temporarily hardcoded

  const getCurrentOrgSettings = () => {
    return notification.customOrgSettings?.find((org: any) => org.orgId === orgId);
  };

  const getEnabledState = () => {
    const settings = getCurrentOrgSettings();
    if (!settings) return true;
    return !settings.disabled;
  };

  const [enabled, setEnabled] = useState(() => getEnabledState());

  useEffect(() => {
    const newEnabledState = getEnabledState();
    if (newEnabledState !== enabled) {
      setEnabled(newEnabledState);
    }
  }, [notification.customOrgSettings, orgId, notification.disabled]);

  const getEmailNotificationEnabled = () => {
    const settings = getCurrentOrgSettings();
    if (settings?.notifyByEmailFlag === true) {
      return true;
    }
    return false;
  };

  const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(() => getEmailNotificationEnabled());

  useEffect(() => {
    const newEmailNotificationEnabled = getEmailNotificationEnabled();
    if (newEmailNotificationEnabled !== emailNotificationEnabled) {
      setEmailNotificationEnabled(newEmailNotificationEnabled);
    }
  }, [notification.customOrgSettings, orgId]);

  const dropdownStateKey = `dropdown_${notification.messageFormatUid}_${orgId}`;
  const [expanded, setExpanded] = useState(() => {
    const savedState = sessionStorage.getItem(dropdownStateKey);
    return savedState === 'true';
  });

  const handleExpandToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    sessionStorage.setItem(dropdownStateKey, newExpanded.toString());
  };

  const makeAPICall = async (updatedEnabled: boolean, updatedEmailNotificationEnabled: boolean) => {
    const payload: any = {
      persona,
      loggedInUserId,
      messageFormatUid: notification.messageFormatUid,
      customOrgSetting: {
        orgId: orgId,
        disabled: !updatedEnabled,
        notifyByEmailFlag: updatedEmailNotificationEnabled,
      },
    };

    try {
      const response = await putNotificationSettings(payload);
      if (onDataUpdate) {
        onDataUpdate();
      }
      return response;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  };

  const handleToggleEmailNotification = async () => {
    const newEmailNotificationEnabled = !emailNotificationEnabled;
    const previousEmailNotificationEnabled = emailNotificationEnabled;
    setEmailNotificationEnabled(newEmailNotificationEnabled);

    try {
      await makeAPICall(enabled, newEmailNotificationEnabled);
    } catch (error) {
      setEmailNotificationEnabled(previousEmailNotificationEnabled);
    }
  };

  const handleToggleSwitch = async () => {
    const newEnabled = !enabled;
    const previousEnabled = enabled;
    setEnabled(newEnabled);

    try {
      await makeAPICall(newEnabled, emailNotificationEnabled);
    } catch (error) {
      setEnabled(previousEnabled);
    }
  };

  const iconUrl = notification.icon ? `${iconBaseUrl}${notification.icon}` : DefaultIcon;

  return (
    <Box key={notification.messageFormatUid} mb={2}>
      <Box
        sx={{
          background: 'linear-gradient(90deg, #E9F8FF 0%, #FFFFFF 100%)',
          border: '1px solid #D0D7E2',
          borderRadius: 2,
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar
              src={iconUrl}
              alt="notification icon"
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#E6F4F1',
                '& img': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '2px',
                },
              }}
              variant="rounded"
            />
            <Box>
              <Typography fontWeight={600} fontSize="14px" color="#0D3C61">
                {notification.messageFormatName.replace(/_/g, ' ')}
              </Typography>
              <Typography fontSize="13px" color="#6B7280">
                {notification.purpose}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={enabled}
              onChange={handleToggleSwitch}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#1D9BF0',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#1D9BF0',
                },
              }}
            />
            {activeTab === 'FM' && (
              <IconButton onClick={handleExpandToggle} size="small">
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {activeTab === 'FM' && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box
            sx={{
              mt: 2,
              background: 'linear-gradient(90deg, #E9F8FF 0%, #FFFFFF 100%)',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 3,
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography fontWeight={500} fontSize="14px" color="#0D3C61">
                Notify by Email
              </Typography>
              <Checkbox
                checked={emailNotificationEnabled}
                onChange={handleToggleEmailNotification}
                sx={{
                  color: '#0D3C61',
                  '&.Mui-checked': { color: '#0D3C61' },
                  padding: '4px',
                }}
              />
            </Box>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const toggleBtnStyle = {
  height: '32px',
  minWidth: '180px',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 500,
  color: '#fff',
  backgroundColor: 'transparent',
  '&.Mui-selected': {
    color: '#383E4B',
    backgroundColor: '#fff',
  },
  '&:hover': {
    backgroundColor: '#EDF2F7',
    color: '#000',
  },
};

const NotificationManagerUI: React.FC<NotificationManagerUIProps> = ({
  notificationData,
  loading,
  error,
  persona,
  loggedInUserId,
  iconBaseUrl,
  onDataUpdate,
  activeTab,
  setActiveTab,
}) => {
  const filteredNotifications = useMemo(() => {
    const personaFiltered = notificationData.filter(
      (n: any) => n.applicablePersona?.toLowerCase() === (activeTab === 'FM' ? 'fleetmanager' : 'driver')
    );

    const disabledList = activeTab === 'FM' ? FM_DISABLED_FORMAT_NAMES : DRIVER_DISABLED_FORMAT_NAMES;

    return personaFiltered.filter((notification) => !disabledList.includes(notification.messageFormatName));
  }, [notificationData, activeTab]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress size={40} sx={{ color: '#1D9BF0' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography fontSize="16px" color="#0D3C61">
          {activeTab === 'FM' ? 'FM Notification Manager' : 'Driver Notification Manager'}
        </Typography>

        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(_, value) => value && setActiveTab(value)}
          sx={{
            backgroundColor: '#3F5C78',
            padding: '4px',
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
            gap: '4px',
          }}
        >
          <ToggleButton value="FM" sx={toggleBtnStyle}>
            FM Notification Manager
          </ToggleButton>
          <ToggleButton value="Driver" sx={toggleBtnStyle}>
            Driver Notification Manager
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ borderBottom: '2px solid #D0D7E2', mb: 2 }} />
      {activeTab === 'Driver' && (
        <>
          <Typography fontSize="14px" color="#6B7280" mb={1}>
            Manage in-app notifications for drivers, delivered via the mobile app.
          </Typography>
          <Typography fontSize="14px" color="#000" fontWeight={600} mb={1}>
            Apply to all drivers
          </Typography>
          <Box sx={{ borderBottom: '2px solid #D0D7E2', mb: 2 }} />
        </>
      )}

      {filteredNotifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="#6B7280" fontSize="14px">
            No notifications found
          </Typography>
        </Box>
      ) : (
        filteredNotifications.map((notification) => (
          <NotificationRow
            key={notification.messageFormatUid}
            notification={notification}
            persona={persona}
            loggedInUserId={loggedInUserId}
            iconBaseUrl={iconBaseUrl}
            onDataUpdate={onDataUpdate}
            activeTab={activeTab}
          />
        ))
      )}
    </Box>
  );
};

export default NotificationManagerUI;
