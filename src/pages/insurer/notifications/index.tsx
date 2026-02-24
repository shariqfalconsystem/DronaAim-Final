/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Container,
  Paper,
  Menu,
  MenuItem,
  Pagination,
  Checkbox,
} from '@mui/material';
import NotificationsHeader from './notification-header';
import { MoreVert } from '@mui/icons-material';
import { BiHide, BiShow } from 'react-icons/bi';
import { IoCheckmarkDoneOutline, IoClose, IoMailUnreadOutline } from 'react-icons/io5';
import shockIcon from '../../../assets/icons/shock-icon.png';
import vehicleIcon from '../../../assets/icons/vehicle.png';
import driverOnboardIcon from '../../../assets/icons/completed-trip-icon.png';
import { TbMailOpened } from 'react-icons/tb';
import { FaArrowCircleRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { RiCloseCircleFill } from '@remixicon/react';
import { useSelector } from 'react-redux';
import { getNotificationSettings } from '../../../services/insurer/settingsServices';

import {
  getAllNotifications,
  getAllNotificationsPost,
  markNotificationAsRead,
  markNotificationAsUnread,
} from '../../../services/insurer/notificationsService';
import { paths } from '../../../common/constants/routes';
import { formatDateToUSA, formatTimestamp } from '../../../utility/utilities';
import { useNotifications } from '../../../common/contexts/notificationContext';

const HIDDEN_NOTIFICATIONS_KEY = 'hiddenNotifications';

const formatMessage = (message: any) => {
  if (!message) return '';

  const timestampPattern = /\[UTC_TIMESTAMP\](.*?)\[\/UTC_TIMESTAMP\]/g;
  let formattedMessage = message?.replace(timestampPattern, (match: any, timestamp: any) => {
    try {
      return formatTimestamp(timestamp);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  });

  const videoLinkPattern = /Click here to view footage\.\[VIDEO_ID\].*?\[\/VIDEO_ID\] \[DEVICE_ID\].*?\[\/DEVICE_ID\]/g;
  formattedMessage = formattedMessage.replace(videoLinkPattern, '');

  return formattedMessage;
};

const extractVideoMetadata = (message: any) => {
  if (!message) return { videoId: null, deviceId: null };

  const videoIdMatch = /\[VIDEO_ID\](.*?)\[\/VIDEO_ID\]/g.exec(message);
  const deviceIdMatch = /\[DEVICE_ID\](.*?)\[\/DEVICE_ID\]/g.exec(message);

  return {
    deviceId: deviceIdMatch ? deviceIdMatch[1] : null,
    requestId: videoIdMatch ? videoIdMatch[1] : null,
  };
};

const NotificationScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notificationsData, setNotificationsData] = useState<any>([]);
  const [allData, setAllData] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);

  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const [hiddenNotifications, setHiddenNotifications] = useState<any>(() =>
    JSON.parse(localStorage.getItem('hiddenNotifications') || '[]')
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<any>(new Set());
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);
  const [showAllCheckboxes, setShowAllCheckboxes] = useState(false);

  const [notificationIconMapper, setNotificationIconMapper] = useState<any>({});
  const [iconBaseUrl, setIconBaseUrl] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);
  const currentRole: string = useSelector((state: any) => state.auth.currentUserRole);

  console.log('current role: ', currentRole);

  const uiPersona = currentRole === 'insurer' || currentRole === 'insurerSuperUser' ? 'INSURER' : undefined;

  const navigate = useNavigate();
  const { fetchAllNotifications: refreshNotificationCount } = useNotifications();

  const fetchNotificationSettings = useCallback(async () => {
    try {
      const response = await getNotificationSettings([currentRole], currentUserId, 1, 1000);
      const settings = response?.data?.notificationSettings || [];
      const baseUrl = response?.data?.notificationSettingsIconUrl || '';

      setIconBaseUrl(baseUrl);
      const iconMapper: any = {};
      settings.forEach((setting: any) => {
        const messageType = setting.messageFormatName || setting.messageType;
        iconMapper[messageType] = {
          icon: setting.icon ? `${baseUrl}${setting.icon}` : shockIcon,
          actionAble: setting.messageType === 'actionable',
          expandedText: setting.messageType === 'actionable' ? 'Click here to view details' : undefined,
        };
      });

      setNotificationIconMapper(iconMapper);
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  }, [currentRole, currentUserId]);

  useEffect(() => {
    if (currentUserId && currentRole) {
      fetchNotificationSettings();
    }
  }, [fetchNotificationSettings]);

  const fetchAll = useCallback(async () => {
    try {
      const { status, data } = await getAllNotificationsPost(
        insurerId,
        1,
        100000,
        {},
        currentUserId,
        currentRole,
        uiPersona
      );
      setAllData(data);
      const totalItems = data.pageDetails?.totalRecords || 0;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [insurerId, currentPage]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fetchAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let filters: any = {};

      if (selectedFilter === 'unread') {
        filters = { isRead: false };
      } else if (selectedFilter === 'actionNeeded') {
        filters = { isActioned: false, notificationType: 'actionable' };
      }

      const { data, status } = await getAllNotificationsPost(
        insurerId,
        currentPage,
        itemsPerPage,
        filters,
        currentUserId,
        currentRole,
        uiPersona
      );
      setNotificationsData(data);
      const totalItems = data.pageDetails?.totalRecords || 0;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotificationsData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [insurerId, currentPage, selectedFilter]);

  useEffect(() => {
    fetchAllNotifications();
  }, [fetchAllNotifications]);

  const handleSelectNotification = (e: any, messageId: string) => {
    e.stopPropagation();
    setSelectedNotifications((prev: any) => {
      const updatedSet = new Set(prev);
      if (updatedSet.has(messageId)) {
        updatedSet.delete(messageId);
      } else {
        updatedSet.add(messageId);
        setShowAllCheckboxes(true);
      }
      return updatedSet;
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    const messageIds = allData?.notifications?.map((notif: any) => notif.messageId);
    try {
      await markNotificationAsRead({ messageIds, readByUserId: currentUserId });
      setNotificationsData((prevData: any) => ({
        ...prevData,
        notifications: prevData?.notifications?.map((notification: any) => ({
          ...notification,
          isRead: true,
        })),
      }));
      fetchAll();
      await refreshNotificationCount();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleMarkAsRead = async (e: any, messageId: string) => {
    e.stopPropagation();

    const data = {
      messageIds: [messageId],
      readByUserId: currentUserId,
    };
    try {
      await markNotificationAsRead(data);
      setNotificationsData((prevData: any) => ({
        ...prevData,
        notifications: prevData?.notifications?.map((notification: any) =>
          notification.messageId === messageId ? { ...notification, isRead: true } : notification
        ),
      }));
      fetchAllNotifications();
      fetchAll();
      await refreshNotificationCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAsUnread = async (e: any, messageId: any) => {
    e.stopPropagation();

    const data = {
      messageIds: [messageId],
    };

    try {
      await markNotificationAsUnread(data);
      setNotificationsData((prevData: any) => ({
        ...prevData,
        notifications: prevData?.notifications?.map((notification: any) =>
          notification.messageId === messageId ? { ...notification, isRead: false } : notification
        ),
      }));
      fetchAllNotifications();
      fetchAll();
      await refreshNotificationCount();
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
    }
  };

  const handleExpandClick = (e: any, messageId: string) => {
    e.stopPropagation();
    handleMarkAsRead(e, messageId);
    setExpandedNotification((prev) => (prev === messageId ? null : messageId));
  };

  const handleRedirect = (notification: any) => {
    if (notification.messageType === 'DRIVER_ONBOARDING_NOTIFICATION') {
      const userId = notification?.metadata?.userId;
      if (userId) {
        navigate(`${paths.DRIVERSDETAILS}/${userId}`);
      }
    } else if (notification.messageType === 'VIDEO_FOOTAGE_REQUEST_COMPLETED') {
      const { deviceId, requestId } = extractVideoMetadata(notification?.message);

      if (deviceId && requestId) {
        navigate(`${paths.INSURERVIDEOMANAGEMENT}/${deviceId}/dashcam-footage/${requestId}`);
      }
    } else if (notification.messageType === 'INSURER_ONBOARDING_NOTIFICATION') {
      navigate(paths.INSURERUSERMANAGEMENT);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    setExpandedNotification(null);
  };

  const handleSelectAll = () => {
    const visibleIds = visibleNotifications.map((notif: any) => notif.messageId);

    if (selectedNotifications.size === visibleIds.length) {
      setSelectedNotifications(new Set()); // Deselect all
    } else {
      setSelectedNotifications(new Set(visibleIds)); // Select all
    }
  };

  // Mark selected notifications as read
  const handleMarkSelectedAsRead = async () => {
    const selectedIds = Array.from(selectedNotifications);

    try {
      await markNotificationAsRead({ messageIds: selectedIds, readByUserId: currentUserId });
      setNotificationsData((prev: any) => {
        if (!prev || !prev.notifications) return prev;

        return {
          ...prev,
          notifications: prev.notifications.map((notif: any) =>
            selectedIds.includes(notif.messageId) ? { ...notif, isRead: true } : notif
          ),
        };
      });
      setShowAllCheckboxes(false);
      setSelectedNotifications(new Set());
      fetchAllNotifications();
      fetchAll();
      await refreshNotificationCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_NOTIFICATIONS_KEY, JSON.stringify(hiddenNotifications));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [hiddenNotifications]);

  const handleHideNotification = (e: any, messageId: string) => {
    e.stopPropagation();

    // Add to hidden notifications
    setHiddenNotifications((prev: string[]) => {
      const updatedHidden = [...prev, messageId];
      localStorage.setItem(HIDDEN_NOTIFICATIONS_KEY, JSON.stringify(updatedHidden)); // Sync with localStorage
      return updatedHidden;
    });

    // Remove from visible notifications
    setNotificationsData((prevData: any) => ({
      ...prevData,
      notifications: prevData.notifications.filter((notif: any) => notif.messageId !== messageId),
    }));
    fetchAll();
  };

  const handleUnhideNotification = (e: any, messageId: string) => {
    e.stopPropagation();

    // Remove the notification ID from hidden notifications
    setHiddenNotifications((prevHiddenNotifications: string[]) => {
      const updatedHiddenNotifications = prevHiddenNotifications.filter((id) => id !== messageId);
      localStorage.setItem(HIDDEN_NOTIFICATIONS_KEY, JSON.stringify(updatedHiddenNotifications)); // Sync with localStorage
      return updatedHiddenNotifications;
    });

    // Optionally fetch notifications to refresh the list
    fetchAllNotifications();
    fetchAll();
  };

  // Hide selected notifications
  const handleHideSelected = () => {
    const selectedIds = Array.from(selectedNotifications);

    // Add to hidden notifications
    setHiddenNotifications((prev: string[]) => {
      const updatedHidden = [...prev, ...selectedIds];
      localStorage.setItem(HIDDEN_NOTIFICATIONS_KEY, JSON.stringify(updatedHidden)); // Sync with localStorage
      return updatedHidden;
    });

    // Remove from visible notifications
    setNotificationsData((prev: any) => {
      if (!prev || !prev.notifications) return prev;

      return {
        ...prev,
        notifications: prev.notifications.filter((notif: any) => !selectedIds.includes(notif.messageId)),
      };
    });
    fetchAll();
    setShowAllCheckboxes(false);

    setSelectedNotifications(new Set());
  };

  const handleUnhideSelected = () => {
    const updatedHiddenNotifications = hiddenNotifications.filter((id: string) => !selectedNotifications.has(id));

    // Sync state and localStorage
    setHiddenNotifications(updatedHiddenNotifications);
    localStorage.setItem(HIDDEN_NOTIFICATIONS_KEY, JSON.stringify(updatedHiddenNotifications));

    fetchAllNotifications();
    fetchAll();
    setShowAllCheckboxes(false);
    setSelectedNotifications(new Set());
  };

  const handleUnhideAll = () => {
    setHiddenNotifications([]);
    localStorage.setItem(HIDDEN_NOTIFICATIONS_KEY, '[]');
    fetchAllNotifications();
    fetchAll();
  };

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'hidden') {
      // Map hiddenNotifications to actual notification objects
      const hiddenList = hiddenNotifications
        .map((id: string) => allData?.notifications?.find((notification: any) => notification.messageId === id))
        .filter((notification: any) => notification); // Exclude undefined/null notifications

      return hiddenList;
    }

    // Use allData for "Unread" filter
    if (selectedFilter === 'unread') {
      return notificationsData?.notifications?.filter(
        (notification: any) => !notification?.isRead && !hiddenNotifications.includes(notification?.messageId)
      );
    }

    // Default to notificationsData for "All" and other filters
    return notificationsData?.notifications?.filter(
      (notification: any) =>
        (selectedFilter === 'all' || selectedFilter === 'actionNeeded') &&
        !hiddenNotifications.includes(notification?.messageId)
    );
  }, [notificationsData, allData.notifications, selectedFilter, hiddenNotifications]);

  const visibleNotifications = useMemo(
    () =>
      filteredNotifications?.filter(
        (notification: any) =>
          notification && (selectedFilter !== 'hidden' || hiddenNotifications.includes(notification.messageId))
      ),
    [filteredNotifications, hiddenNotifications, selectedFilter]
  );

  const visibleCounts = useMemo(() => {
    // Get all notifications from the API response
    const allNotifications = allData?.notifications || [];

    const allTotal = allData?.pageDetails?.totalRecords || 0;

    // Count hidden items that exist in the current data set
    const hiddenCount = hiddenNotifications.length;

    // Unread count from total records (not just current page)
    const unreadTotal = allNotifications.filter((notification: any) => !notification?.isRead).length;

    // Total unread minus hidden unread
    const hiddenUnreadCount = allNotifications.filter(
      (notification: any) => !notification?.isRead && hiddenNotifications.includes(notification.messageId)
    ).length;

    const visibleUnreadTotal = unreadTotal - hiddenUnreadCount;

    // Action needed count (excluding hidden)
    const actionNeededTotal = allNotifications.filter(
      (notification: any) =>
        !notification?.isActioned &&
        notification?.notificationType === 'actionable' &&
        !hiddenNotifications.includes(notification.messageId)
    ).length;

    return {
      all: allTotal - hiddenCount || 0,
      unread: visibleUnreadTotal || 0,
      actionNeeded: actionNeededTotal || 0,
      hidden: hiddenCount || 0,
    };
  }, [allData?.notifications, hiddenNotifications, allData?.pageDetails?.totalRecords]);

  return (
    <>
      <Box
        mb={4}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <NotificationsHeader />
      </Box>

      <Container maxWidth={false} sx={{ px: 2 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          {selectedNotifications.size === 0 &&
            (selectedFilter === 'hidden' ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>
                  Hidden Items
                </Typography>
                <IconButton onClick={() => setSelectedFilter('all')} sx={{ color: 'text.secondary' }}>
                  <IoClose size={24} />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    onClick={() => setSelectedFilter('all')}
                    variant={selectedFilter === 'all' ? 'contained' : 'outlined'}
                    color="primary"
                    sx={{ textTransform: 'none', borderRadius: 2, display: 'flex' }}
                  >
                    All
                    {selectedFilter === 'all' && (
                      <span
                        style={{
                          backgroundColor: '#019C95',
                          borderRadius: 20,
                          color: '#fff',
                          paddingLeft: '5px',
                          paddingRight: '5px',
                          marginLeft: 5,
                        }}
                      >
                        {loading ? '...' : visibleCounts.all}
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => setSelectedFilter('unread')}
                    variant={selectedFilter === 'unread' ? 'contained' : 'outlined'}
                    color="primary"
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Unread
                    {selectedFilter === 'unread' && (
                      <span
                        style={{
                          backgroundColor: '#019C95',
                          borderRadius: 20,
                          color: '#fff',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          marginLeft: 5,
                        }}
                      >
                        {loading ? '...' : visibleCounts.unread}
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => setSelectedFilter('actionNeeded')}
                    variant={selectedFilter === 'actionNeeded' ? 'contained' : 'outlined'}
                    color="primary"
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Action Needed
                    {selectedFilter === 'actionNeeded' && (
                      <span
                        style={{
                          backgroundColor: '#019C95',
                          borderRadius: 20,
                          color: '#fff',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          marginLeft: 5,
                        }}
                      >
                        {loading ? '...' : visibleCounts.actionNeeded}
                      </span>
                    )}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  <Button
                    variant="outlined"
                    sx={{
                      color: '#019C95',
                      border: '1px solid #019C95',
                      borderRadius: 2,
                      '&:hover': {
                        color: '#2C3E50',
                      },
                      cursor: 'pointer',
                    }}
                    onClick={handleMarkAllAsRead}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        cursor: 'pointer !important',
                        textDecoration: 'underline',
                        textTransform: 'capitalize',
                        color: '#019C95',
                        display: 'flex',
                      }}
                    >
                      <IoCheckmarkDoneOutline color="#019C95" size={20} /> Mark all as read
                    </Typography>
                  </Button>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton onClick={handleMenuOpen}>
                      <MoreVert sx={{ color: 'gray' }} />
                    </IconButton>
                    <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
                      <MenuItem
                        sx={{
                          ':hover': {
                            backgroundColor: '#2c3e50',
                            color: '#fff',
                          },
                        }}
                        onClick={handleUnhideAll}
                      >
                        Unhide All Notifications
                      </MenuItem>

                      <MenuItem
                        sx={{
                          ':hover': {
                            backgroundColor: '#2c3e50',
                            color: '#fff',
                          },
                        }}
                        onClick={() => {
                          setSelectedFilter('hidden');
                          handleMenuClose();
                        }}
                      >
                        Show Hidden Notifications
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
              </Box>
            ))}

          {selectedNotifications.size > 0 && (
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
              }}
            >
              {/* Left Section: Select All Checkbox */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox checked={selectedNotifications.size === visibleCounts.all} onChange={handleSelectAll} />
                <Typography>Select All</Typography>

                <IconButton onClick={handleMarkSelectedAsRead} sx={{ ml: 1 }}>
                  <IoCheckmarkDoneOutline />
                </IconButton>

                {selectedFilter === 'hidden' ? (
                  <IconButton onClick={handleUnhideSelected} sx={{ ml: 1 }}>
                    <BiShow />
                  </IconButton>
                ) : (
                  <IconButton onClick={handleHideSelected} sx={{ ml: 1 }}>
                    <BiHide />
                  </IconButton>
                )}
              </Box>

              {/* Right Section: Icons */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => {
                    setSelectedNotifications(new Set());
                    setShowAllCheckboxes(false);
                  }}
                  sx={{ ml: 1 }}
                >
                  <RiCloseCircleFill />
                </IconButton>
              </Box>
            </Box>
          )}

          <List sx={{ mx: 'auto', mt: 4 }}>
            {visibleNotifications?.length > 0 ? (
              visibleNotifications?.map((notification: any) => (
                <>
                  <ListItem
                    key={notification?.messageId}
                    onMouseEnter={() => setHoveredNotification(notification.messageId)}
                    onMouseLeave={() => setHoveredNotification(null)}
                    sx={{
                      borderRadius: 4,
                      background: !notification?.isRead
                        ? 'linear-gradient(90deg, #B7D7E7 0%, #E9F8FF 100%)'
                        : '#E9F8FF',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      '&:hover': { background: 'linear-gradient(90deg, #B7D7E7 0%, #E9F8FF 100%)' },
                    }}
                    onClick={(e: any) => handleExpandClick(e, notification?.messageId)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {(hoveredNotification === notification.messageId ||
                        selectedNotifications.has(notification.messageId) ||
                        showAllCheckboxes) && (
                        <Checkbox
                          checked={selectedNotifications.has(notification.messageId)}
                          onChange={(e: any) => {
                            handleSelectNotification(e, notification.messageId);
                          }}
                          onClick={(e: any) => e.stopPropagation()}
                          sx={{ position: 'absolute', left: 16 }}
                        />
                      )}
                      <ListItemIcon
                        sx={{
                          ml:
                            hoveredNotification === notification.messageId ||
                            selectedNotifications.has(notification.messageId) ||
                            showAllCheckboxes
                              ? 5
                              : 0,
                        }}
                      >
                        <img
                          src={notificationIconMapper[notification?.messageType]?.icon || shockIcon}
                          alt="notification-icon"
                          style={{
                            width: 30,
                            height: 30,
                            objectFit: 'contain',
                            boxSizing: 'border-box',
                          }}
                          onError={(e: any) => {
                            e.target.src = shockIcon;
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ maxWidth: '70%' }}
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            {notification?.messageType}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatMessage(notification?.message)}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatDateToUSA(notification?.createdTs)}
                        </Typography>
                        <Box>
                          {selectedFilter === 'hidden' ? (
                            <IconButton
                              size="small"
                              onClick={(e) => handleUnhideNotification(e, notification?.messageId)}
                            >
                              <BiShow />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={(e) => handleHideNotification(e, notification?.messageId)}
                            >
                              <BiHide />
                            </IconButton>
                          )}
                          {notification?.isRead ? (
                            <IconButton size="small" onClick={(e) => handleMarkAsUnread(e, notification?.messageId)}>
                              <TbMailOpened />
                            </IconButton>
                          ) : (
                            <IconButton size="small" onClick={(e) => handleMarkAsRead(e, notification?.messageId)}>
                              <IoMailUnreadOutline />
                            </IconButton>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </Box>
                  </ListItem>
                  {notificationIconMapper[notification?.messageType]?.actionAble &&
                    expandedNotification === notification?.messageId && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 4, width: '100%' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {notificationIconMapper[notification?.messageType].expandedText ||
                            'No additional details available.'}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRedirect(notification)}>
                          <FaArrowCircleRight />
                        </IconButton>
                      </Box>
                    )}
                </>
              ))
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                No data found
              </Typography>
            )}
          </List>
          {selectedFilter !== 'hidden' && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #eee',
                pt: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  notificationsData?.pageDetails?.totalRecords || 0
                )} of ${notificationsData?.pageDetails?.totalRecords || 1}`}
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default NotificationScreen;
