import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Grid,
  IconButton,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import Sidebar from '../components/organisms/sidebar/sidebar';
import { signOut } from 'aws-amplify/auth';
import { IoIosLogOut, IoIosNotificationsOutline } from 'react-icons/io';
import InsurerSidebar from '../components/organisms/insurer-sidebar';
import AdminSidebar from '../components/organisms/admin-sidebar';
import DriverRoleRestrictionDialog from '../components/modals/driver-restriction-dialog';
import PolicyExpirationDialog from '../common/components/login-restriction';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthState, loginSuccess, fetchUserInfo, refreshUserInfo } from '../redux/auth/authSlice';
import { paths } from '../common/constants/routes';
import { useNotifications } from '../common/contexts/notificationContext';
import { clearFilterCriteria as clearIEventsMile } from '../redux/insurer/dashboard/iEventsMileSlice';
import { clearFilterCriteria as clearIFleetList } from '../redux/insurer/fleet-list/iFleetListSlice';
import { clearFilterCriteria as clearIDashboard } from '../redux/insurer/dashboard/idashboardSlice';
import { clearFilterCriteria as clearDocuments } from '../redux/documents/documentsSlice';
import { clearFilterCriteria as clearDrivers } from '../redux/drivers/driversSlice';
import { clearFilterCriteria as clearEvents } from '../redux/events/eventsSlice';
import { clearFilterCriteria as clearTrips } from '../redux/trips/tripsSlice';
import { clearFilterCriteria as clearVehicles } from '../redux/vehicles/vehicleSlice';
import { clearFilterCriteria as clearUsermanagement } from '../redux/admin/usermanagement/usersSlice';
import { clearFilterCriteria as clearAdminDrivers } from '../redux/admin/drivers/driverSlice';
import { clearFilterCriteria as clearAdminDevices } from '../redux/admin/devices/devicesSlice';
import { clearFilterCriteria as clearFnolEvents } from '../redux/insurer/fnol/fnolSlice';
import { roleLabels } from '../common/constants/general';
import { toast } from 'react-toastify';
import restrictLogin from '../assets/img/driver-restrict.png';
import Logo from '../assets/img/logo.png';
import NotificationBell from '../assets/icons/notification-bell.png';

interface AuthState {
  currentUserRole: string;
  userData: any;
  currentUserId: string;
  userInfo: {
    orgRoleAndScoreMapping: any[];
    profilePicUrl: string | null;
    fullName: string | null;
    emailId: string | null;
    primaryPhone: string | null;
    primaryPhoneCtryCd: string | null;
  } | null;
  fetchingUserInfo: boolean;
}

interface RootState {
  auth: AuthState;
}

interface PolicyDetail {
  isActive: boolean;
  message?: string;
  warning?: string;
}

interface OrgRoleMapping {
  role: string;
  lonestarId?: string;
  insurerId?: string;
  dronaaimId?: string;
  name?: string;
  policyDetails?: PolicyDetail[];
  orgName?: any;
}

// Constants
const DETAIL_ROUTES = [
  'trips-details',
  'vehicles-details',
  'events-details',
  'drivers-details',
  'fleets-details',
  'fnol-details',
  'notifications',
  'change-password',
  'report',
  'help-center',
  'video-management',
];

const FLEET_MANAGER_ROLES = ['fleetManager', 'fleetManagerSuperUser'];
const INSURER_ROLES = ['insurer', 'insurerSuperUser'];

export default function MainRoutes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const location = useLocation();

  // Redux selectors
  const userRole = useSelector((state: RootState) => state.auth.currentUserRole);
  const userData = useSelector((state: RootState) => state.auth?.userData);
  const currentUserRole = useSelector((state: RootState) => state.auth.currentUserRole);
  const currentUserId = useSelector((state: RootState) => state.auth.currentUserId);
  const currentLonestarId = useSelector((state: RootState) => state.auth.userData?.currentLonestarId);
  const currentInsurerId = useSelector((state: RootState) => state.auth.userData?.currentInsurerId);
  const currentDronaaimId = useSelector((state: RootState) => state.auth.userData?.currentDronaaimId);

  // User info from Redux
  const userInfo: any = useSelector((state: RootState) => state.auth.userInfo);
  const fetchingUserInfo: any = useSelector((state: RootState) => state.auth.fetchingUserInfo);

  // Derived values from Redux state
  const userFullName = userInfo?.fullName || userData?.fullName;
  const userEmail = userInfo?.emailId || userData?.emailId;
  const profilePicUrl: any = userInfo?.profilePicUrl;
  const orgRoleAndScoreMapping = userInfo?.orgRoleAndScoreMapping || userData?.orgRoleAndScoreMapping || [];

  const { unreadNotifications, resetNotifications } = useNotifications();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [roleConfirmDialog, setRoleConfirmDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<OrgRoleMapping | null>(null);
  const [driverRestrictionDialog, setDriverRestrictionDialog] = useState(false);
  const [policyBlockerDialog, setPolicyBlockerDialog] = useState(false);
  const [blockedRole, setBlockedRole] = useState<OrgRoleMapping | null>(null);

  const appBarHeight = useMemo(() => theme.mixins.toolbar.minHeight, [theme]);
  const currentPath = useMemo(() => location.pathname, [location.pathname]);
  const isDetailRoute = useMemo(() => DETAIL_ROUTES.some((route) => currentPath.includes(route)), [currentPath]);
  const isNotifications = useMemo(() => currentPath.includes('notifications'), [currentPath]);

  // Fetch user info on component mount and when currentUserId changes
  useEffect(() => {
    if (!userInfo) {
      dispatch(fetchUserInfo() as any);
    }
  }, [userInfo, dispatch]);

  // Force refresh user info function
  const handleRefreshUserInfo = useCallback(() => {
    dispatch(refreshUserInfo() as any);
  }, [dispatch]);

  const clearNotificationDropdownStates = () => {
    // Get all keys from sessionStorage
    const keys = Object.keys(sessionStorage);

    // Filter and remove only dropdown state keys
    keys.forEach((key) => {
      if (key.startsWith('dropdown_')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const clearAllReduxState = useCallback(() => {
    const clearActions = [
      clearAuthState,
      clearIEventsMile,
      clearIFleetList,
      clearIDashboard,
      clearDocuments,
      clearDrivers,
      clearEvents,
      clearTrips,
      clearVehicles,
      clearUsermanagement,
      clearAdminDrivers,
      clearAdminDevices,
      clearFnolEvents,
    ];

    clearActions.forEach((action) => dispatch(action()));
  }, [dispatch]);

  const handleProfileClick = useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      setIsPopoverOpen(true);

      handleRefreshUserInfo();
    },
    [handleRefreshUserInfo]
  );

  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
    setIsPopoverOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      clearAllReduxState();
      sessionStorage.clear();
      resetNotifications();
      await signOut();
      navigate(paths.LOGIN);
    } catch (error) {
      console.error('Error signing out: ', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, clearAllReduxState, resetNotifications, navigate]);

  const handleNavigateToNotification = useCallback(() => {
    if (FLEET_MANAGER_ROLES.includes(userRole)) {
      navigate(paths.NOTIFICATIONSCREEN);
    } else if (INSURER_ROLES.includes(userRole)) {
      navigate(paths.INSURERNOTIFICATIONS);
    }
  }, [userRole, navigate]);

  const handleNavigateToProfile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(paths.PROFILE);
    },
    [navigate]
  );

  const isRoleActive = useCallback(
    (orgRole: OrgRoleMapping) => {
      const roleMatches = orgRole.role === currentUserRole;

      let organizationMatches = false;

      if (orgRole.role === 'admin') {
        organizationMatches = true;
      } else if (orgRole.lonestarId) {
        organizationMatches = orgRole.lonestarId === currentLonestarId;
      } else if (orgRole.insurerId) {
        organizationMatches = orgRole.insurerId === currentInsurerId;
      } else if (orgRole.dronaaimId) {
        organizationMatches = orgRole.dronaaimId === currentDronaaimId;
      }

      return roleMatches && organizationMatches;
    },
    [currentUserRole, currentLonestarId, currentInsurerId, currentDronaaimId]
  );

  // Check if policy is active
  const checkPolicyStatus = useCallback(
    (orgRole: OrgRoleMapping): { hasInactive: boolean; inactivePolicies: PolicyDetail[] } => {
      if (!orgRole.policyDetails || orgRole.policyDetails.length === 0) {
        // If no policy details, allow access
        return { hasInactive: false, inactivePolicies: [] };
      }

      const inactive = orgRole.policyDetails.filter((policy) => policy.isActive === false);

      return {
        hasInactive: inactive.length > 0,
        inactivePolicies: inactive,
      };
    },
    []
  );

  const handleRoleSelection = useCallback(
    async (orgRole: OrgRoleMapping) => {
      if (orgRole.role === 'driver') {
        setDriverRestrictionDialog(true);
        handlePopoverClose();
        return;
      }

      // Refresh user info before role selection
      handleRefreshUserInfo();

      // Check policy status
      const { hasInactive, inactivePolicies } = checkPolicyStatus(orgRole);

      if (hasInactive) {
        setBlockedRole(orgRole);
        setPolicyBlockerDialog(true);
        handlePopoverClose();
        return;
      }

      setSelectedRole(orgRole);
      setRoleConfirmDialog(true);
      handlePopoverClose();
    },
    [handlePopoverClose, handleRefreshUserInfo, checkPolicyStatus]
  );

  const confirmRoleSwitch = useCallback(() => {
    if (!selectedRole) return;

    const clearActions = [
      clearIEventsMile,
      clearIFleetList,
      clearIDashboard,
      clearDocuments,
      clearDrivers,
      clearEvents,
      clearTrips,
      clearVehicles,
      clearUsermanagement,
      clearAdminDrivers,
      clearAdminDevices,
      clearFnolEvents,
    ];

    clearActions.forEach((action) => dispatch(action()));
    clearNotificationDropdownStates();

    const userDataWithSelectedRole = {
      ...userData,
      selectedRole: selectedRole,
      currentUserRole: selectedRole.role,
      currentOrganization:
        selectedRole.name ||
        selectedRole?.orgName ||
        selectedRole.lonestarId ||
        selectedRole.insurerId ||
        selectedRole.dronaaimId,
      currentLonestarId: selectedRole.lonestarId || null,
      currentInsurerId: selectedRole.insurerId || null,
      currentDronaaimId: selectedRole.dronaaimId || null,
    };

    dispatch(loginSuccess(userDataWithSelectedRole));

    const { role: newRole } = selectedRole;

    setRoleConfirmDialog(false);
    setSelectedRole(null);

    setTimeout(() => {
      navigate('/', { replace: true });
      setTimeout(() => {
        if (newRole === 'fleetManager' || newRole === 'fleetManagerSuperUser') {
          navigate(paths.DASHBOARD, { replace: true });
        } else if (newRole === 'insurer' || newRole === 'insurerSuperUser') {
          navigate(paths.INSURERDASHBOARD, { replace: true });
        } else if (newRole === 'admin') {
          navigate(paths.ADMIN, { replace: true });
        }
      }, 50);
    }, 1000);
    toast.success(`Successfully switched to ${roleLabels[newRole] || newRole} role`);
  }, [selectedRole, userData, dispatch, navigate]);

  const cancelRoleSwitch = useCallback(() => {
    setRoleConfirmDialog(false);
    setSelectedRole(null);
  }, []);

  const handleDriverRestrictionClose = useCallback(() => {
    setDriverRestrictionDialog(false);
  }, []);

  const handlePolicyBlockerClose = useCallback(() => {
    setPolicyBlockerDialog(false);
    setBlockedRole(null);
    // Reopen the popover to show other roles
    setTimeout(() => {
      const profileElement = document.querySelector('[data-profile-button]');
      if (profileElement) {
        setAnchorEl(profileElement as HTMLElement);
        setIsPopoverOpen(true);
      }
    }, 100);
  }, []);

  const renderSidebar = useCallback(() => {
    switch (userRole) {
      case 'admin':
        return <AdminSidebar />;
      case 'fleetManager':
      case 'fleetManagerSuperUser':
        return <Sidebar />;
      default:
        return <InsurerSidebar />;
    }
  }, [userRole]);

  const renderNotificationIcon = useCallback(() => {
    if (userRole === 'admin') return null;

    return (
      <IconButton color="inherit" onClick={handleNavigateToNotification} disabled={isLoading}>
        {isNotifications ? (
          <img src={NotificationBell} width={25} height={25} alt="Notifications" />
        ) : (
          <Badge badgeContent={unreadNotifications} color="primary">
            <IoIosNotificationsOutline />
          </Badge>
        )}
      </IconButton>
    );
  }, [userRole, isNotifications, unreadNotifications, handleNavigateToNotification, isLoading]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #FFFFFF 0%, #D4EAFF 25%, #6D8FB0 50.02%, #3F5C78 74.92%, #2C3E50 100%)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src={Logo}
              alt="Company Logo"
              style={{
                width: 150,
                height: 40,
                marginBottom: 10,
                marginTop: 10,
              }}
            />
          </Box>

          {renderNotificationIcon()}

          <Box
            onClick={handleProfileClick}
            data-profile-button
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '30px',
              padding: '6px 12px',
              marginLeft: 2,
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              color: 'white',
              '&:hover': {
                backgroundColor: '#ffffff',
                color: 'black',
                '& .text-content': {
                  color: 'black',
                },
              },
            }}
          >
            <Avatar alt="Profile Pic" sx={{ width: 40, height: 40, marginRight: 0.3 }} src={profilePicUrl} />
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="600">
                  {userFullName}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="200" sx={{ mx: 1, fontSize: '2rem', lineHeight: '2rem' }}>
                |
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" fontWeight="600" sx={{ color: '#00a650' }}>
                  {userData?.selectedRole?.name || userData?.selectedRole?.orgName || 'DronaAIm'}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {userRole === 'admin' ? 'Admin' : roleLabels[userRole]}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Popover
            open={isPopoverOpen}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              mt: 1,
            }}
            disableRestoreFocus
            disableAutoFocus
            disableEnforceFocus
          >
            <Box sx={{ p: 1.5, minWidth: 300 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleNavigateToProfile}>
                <Avatar sx={{ width: 70, height: 70, margin: '0 auto', mr: 1 }} src={profilePicUrl} />
                <Box>
                  <Box fontWeight="bold">{userFullName || ''}</Box>
                  <Box fontSize="small">{userEmail || ''}</Box>
                  <Box fontSize="small">
                    {userData?.primaryPhone ? `(${userData?.primaryPhoneCtryCd}) ${userData.primaryPhone}` : 'NA'}
                  </Box>
                </Box>
              </Box>
              <Box mt={2}>
                {orgRoleAndScoreMapping?.map((item: OrgRoleMapping, idx: number) => {
                  const isActive = isRoleActive(item);

                  return (
                    <Box
                      key={`${item?.role}-${idx}`}
                      sx={{
                        mt: 1,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: isActive ? '#E6FFF1' : '#f0f4f8',
                        border: isActive ? '1px solid #18b47c' : '1px solid #ccc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: theme.shadows[2],
                        },
                      }}
                      onClick={() => handleRoleSelection(item)}
                    >
                      <Box fontSize="small">
                        <strong>Organization Name:</strong>{' '}
                        {item?.name ||
                          item?.orgName ||
                          item?.lonestarId ||
                          item?.insurerId ||
                          item?.dronaaimId ||
                          'org Name'}
                      </Box>
                      <Box fontSize="small">
                        <strong>Role:</strong> {roleLabels[item?.role] || item?.role}
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
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Popover>

          <Tooltip title="Logout" placement="bottom" arrow>
            <IconButton edge="end" color="inherit" onClick={handleLogout} disabled={isLoading}>
              <IoIosLogOut />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Grid
        container
        spacing={isDetailRoute ? 0 : 2}
        sx={{
          width: '100%',
          margin: 0,
          background: theme.palette.primary.light,
        }}
      >
        <Grid
          item
          xs={12}
          md={isMobile ? 12 : 2}
          sx={{
            position: 'fixed',
            zIndex: 5,
            overflowY: 'auto',
            height: `calc(100vh - ${appBarHeight}px)`,
            top: `${appBarHeight}px`,
          }}
        >
          {renderSidebar()}
        </Grid>

        <Grid
          item
          xs={12}
          md={isMobile ? 12 : 12}
          sx={{
            marginLeft: isMobile ? 0 : '14%',
            marginTop: isMobile ? `${appBarHeight}px` : 0,
          }}
        >
          <Outlet />
        </Grid>
      </Grid>

      {/* Role Switch Confirmation Dialog */}
      <Dialog
        open={roleConfirmDialog}
        onClose={cancelRoleSwitch}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
            Are you sure you want to switch to the following role?
          </Typography>

          {selectedRole && (
            <Box
              sx={{
                bgcolor: '#F8F9FA',
                border: '1px solid #E0E0E0',
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4CAF50' }}>
                Organization:{' '}
                {selectedRole.name ||
                  selectedRole.orgName ||
                  selectedRole.lonestarId ||
                  selectedRole.insurerId ||
                  selectedRole.dronaaimId}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Role: {roleLabels[selectedRole.role] || selectedRole.role}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pt: 1 }}>
          <Button
            onClick={cancelRoleSwitch}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmRoleSwitch}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              ml: 2,
              textTransform: 'none',
            }}
          >
            Switch Role
          </Button>
        </DialogActions>
      </Dialog>

      <PolicyExpirationDialog
        userInfo={userInfo}
        isOpen={policyBlockerDialog}
        message={blockedRole?.policyDetails?.[0]?.message}
        warning={blockedRole?.policyDetails?.[0]?.warning}
        showOtherRolesButton={true}
        onOtherRolesClick={handlePolicyBlockerClose}
      />

      <DriverRoleRestrictionDialog
        open={driverRestrictionDialog}
        onClose={handleDriverRestrictionClose}
        logoSrc={Logo}
        restrictionImageSrc={restrictLogin}
      />
    </Box>
  );
}
