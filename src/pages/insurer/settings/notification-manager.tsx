import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, Avatar, Collapse, IconButton, Checkbox, CircularProgress } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { putNotificationSettings } from '../../../services/insurer/settingsServices';
import { useSelector } from 'react-redux';
import DefaultIcon from '../../../assets/icons/NotificationIcon.png';

const DISABLED_FORMAT_NAMES = [
  'FLEET_ONBOARDING',
  'FLEET_ONBOARDING_COMPLETE',
  'VEHICLE_ONBOARDING',
  'DEVICE_ONBOARDING',
  'FLEET_SCORE_POOR',
  'FLEET_SCORE_MEDIAN',
  'FLEET_MILES_THRESHOLD_EXCEEDED',
  'FLEET_DETAIL_CHANGED',
  'IMPACT_ALERT',
  'SEVERE_IMPACT_ALERT',
  // 'DRIVER_ONBOARDING_NOTIFICATION',
  'DRIVER_ASSEST_DELETED',
  'VEHICLE_ASSEST_DELETED',
  'FM_ASSEST_DELETED',
  'DEVICE_CONNECTION_LOST',
];

interface NotificationManagerUIProps {
  notificationData: any[];
  loading: boolean;
  error: string | null;
  persona: string;
  loggedInUserId: string;
  iconBaseUrl: string;
  onDataUpdate?: () => void;
}

const NotificationRow: React.FC<{
  notification: any;
  persona: string;
  loggedInUserId: string;
  iconBaseUrl: string;
  onDataUpdate?: () => void;
}> = ({ notification, persona, loggedInUserId, iconBaseUrl, onDataUpdate }) => {
  const orgId: any = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);

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
    if (settings?.notifyByEmailFlag !== undefined) {
      return settings.notifyByEmailFlag;
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
            <IconButton onClick={handleExpandToggle} size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>
      </Box>

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
    </Box>
  );
};

const NotificationManagerUI: React.FC<NotificationManagerUIProps> = ({
  notificationData,
  loading,
  error,
  persona,
  loggedInUserId,
  iconBaseUrl,
  onDataUpdate,
}) => {
  const visibleNotifications = notificationData.filter(
    (notification) => !DISABLED_FORMAT_NAMES.includes(notification.messageFormatName)
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress size={40} sx={{ color: '#1D9BF0' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography fontSize="16px" color="#0D3C61" mb={2}>
        Insurer Notification Manager
      </Typography>
      <Box sx={{ borderBottom: '2px solid #D0D7E2', mb: 2 }} />

      {visibleNotifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="#6B7280" fontSize="14px">
            No notifications found.
          </Typography>
        </Box>
      ) : (
        visibleNotifications.map((notification) => (
          <NotificationRow
            key={notification.messageFormatUid}
            notification={notification}
            persona={persona}
            loggedInUserId={loggedInUserId}
            iconBaseUrl={iconBaseUrl}
            onDataUpdate={onDataUpdate}
          />
        ))
      )}
    </Box>
  );
};

export default NotificationManagerUI;
