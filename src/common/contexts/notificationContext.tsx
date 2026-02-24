import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getAllNotificationsPost as fleetManagerGetAllNotificationsPost } from '../../services/fleetManager/notificationsService';
import { getAllNotificationsPost as insurerGetAllNotificationsPost } from '../../services/insurer/notificationsService';
import { RootState } from '../../redux/store';

interface NotificationsContextType {
  unreadNotifications: number;
  fetchAllNotifications: () => Promise<void>;
  resetNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);
const HIDDEN_NOTIFICATIONS_KEY = 'hiddenNotifications';

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const [unreadNotifications, setUnreadNotifications] = useState<number>(
    Number(localStorage.getItem('totalUnreadNotifications')) || 0
  );

  const lonestarId: any = useSelector((state: RootState) => state?.auth?.userData?.currentLonestarId);
  const userRole: any = useSelector((state: RootState) => state?.auth?.userData?.currentUserRole);
  const insurerId: any = useSelector((state: RootState) => state?.auth?.userData?.currentInsurerId);
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);
  const currentRoleCheck: string = useSelector((state: any) => state.auth.currentUserRole);

  // Track previous role/org values to detect changes
  const prevRoleRef = useRef(userRole);
  const prevLonestarIdRef = useRef(lonestarId);
  const prevInsurerIdRef = useRef(insurerId);

  // Determine uiPersona based on user role
  const uiPersona = useMemo(() => {
    if (userRole === 'insurer' || userRole === 'insurerSuperUser') {
      return 'INSURER';
    } else if (userRole === 'fleetManager' || userRole === 'fleetManagerSuperUser') {
      return 'FLEETMANAGER';
    }
    return undefined;
  }, [userRole]);

  const fetchAllNotifications = useCallback(async () => {
    if (userRole === 'admin') return;

    if ((userRole === 'insurer' || userRole === 'insurerSuperUser') && (!insurerId || insurerId === 'null')) {
      // Reset to 0 if insurerId is missing
      localStorage.setItem('totalUnreadNotifications', '0');
      setUnreadNotifications(0);
      return;
    }

    if (
      (userRole === 'fleetManager' || userRole === 'fleetManagerSuperUser') &&
      (!lonestarId || lonestarId === 'null')
    ) {
      localStorage.setItem('totalUnreadNotifications', '0');
      setUnreadNotifications(0);
      return;
    }

    try {
      const filters = { isRead: false };
      let response;

      if (userRole === 'insurer' || userRole === 'insurerSuperUser') {
        response = await insurerGetAllNotificationsPost(
          insurerId,
          1,
          10000,
          filters,
          currentUserId,
          currentRoleCheck,
          uiPersona
        );
      } else {
        response = await fleetManagerGetAllNotificationsPost(
          lonestarId,
          1,
          10000,
          filters,
          currentUserId,
          currentRoleCheck,
          uiPersona
        );
      }

      const { data } = response;

      const hiddenNotifications: string[] = JSON.parse(localStorage.getItem(HIDDEN_NOTIFICATIONS_KEY) || '[]');

      const visibleUnreadCount =
        data.notifications?.filter((notification: any) => !hiddenNotifications.includes(notification.messageId))
          .length || 0;

      localStorage.setItem('totalUnreadNotifications', visibleUnreadCount.toString());
      setUnreadNotifications(visibleUnreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      localStorage.setItem('totalUnreadNotifications', '0');
      setUnreadNotifications(0);
    }
  }, [lonestarId, insurerId, userRole, currentUserId, currentRoleCheck, uiPersona]);

  // Function to reset notifications on logout
  const resetNotifications = useCallback(() => {
    localStorage.removeItem('totalUnreadNotifications');
    setUnreadNotifications(0);
  }, []);

  // Detect role or organization changes and refetch notifications
  useEffect(() => {
    const roleChanged = prevRoleRef.current !== userRole;
    const lonestarIdChanged = prevLonestarIdRef.current !== lonestarId;
    const insurerIdChanged = prevInsurerIdRef.current !== insurerId;

    if (roleChanged || lonestarIdChanged || insurerIdChanged) {
      // Update refs
      prevRoleRef.current = userRole;
      prevLonestarIdRef.current = lonestarId;
      prevInsurerIdRef.current = insurerId;

      // Reset and refetch notifications immediately
      localStorage.setItem('totalUnreadNotifications', '0');
      setUnreadNotifications(0);

      // Fetch new notifications after a brief delay to ensure Redux state is fully updated
      const timeoutId = setTimeout(() => {
        fetchAllNotifications();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [userRole, lonestarId, insurerId, fetchAllNotifications]);

  // Listen for changes to hidden notifications in localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === HIDDEN_NOTIFICATIONS_KEY) {
        fetchAllNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchAllNotifications]);

  // Poll Notifications Every Minute
  useEffect(() => {
    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 240000);
    return () => clearInterval(interval);
  }, [fetchAllNotifications]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'totalUnreadNotifications') {
        setUnreadNotifications(Number(localStorage.getItem('totalUnreadNotifications')) || 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contextValue = useMemo(
    () => ({ unreadNotifications, fetchAllNotifications, resetNotifications }),
    [unreadNotifications, fetchAllNotifications, resetNotifications]
  );

  return <NotificationsContext.Provider value={contextValue}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
