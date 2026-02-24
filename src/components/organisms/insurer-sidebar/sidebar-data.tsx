import fnolw from '../../../assets/icons/fnol white.png';
import reports from '../../../assets/icons/reports.png';
import support from '../../../assets/icons/support.png';
import trips from '../../../assets/icons/trips.png';
import devices from '../../../assets/icons/total-devices.png';
import fleets from '../../../assets/icons/total-vehicles.png';
import dashboard from '../../../assets/icons/dashboard.png';
import users from '../../../assets/icons/users.png';
import settings from '../../../assets/icons/settings-icon.png';

export const insurerList = [
  {
    key: 'insurer/dashboard',
    icon: <img src={dashboard} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={dashboard}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Dashboard',
  },
  {
    key: 'insurer/fleets',
    icon: <img src={fleets} height={30} width={30} color="white" className="fleet-tracking-icon" />,
    selectedIcon: (
      <img
        src={fleets}
        height={30}
        width={30}
        color="black"
        className="fleet-tracking-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Fleets',
  },
  {
    key: 'insurer/devices',
    icon: <img src={devices} height={30} width={30} color="white" className="devices-icon" />,
    selectedIcon: (
      <img
        src={devices}
        height={30}
        width={30}
        color="black"
        className="devices-icon"
        style={{ filter: 'invert(1) brightness(2) ' }}
      />
    ),
    text: 'Devices',
  },
  {
    key: 'insurer/trips',
    icon: <img src={trips} className="trips-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={trips}
        color="black"
        className="trips-icon"
        width={30}
        height={30}
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Trips',
  },
  {
    key: 'insurer/fnol',
    icon: <img src={fnolw} className="fnol-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={fnolw}
        className="fnol-icon"
        color="black"
        style={{ filter: 'invert(1) brightness(2)' }}
        width={30}
        height={30}
      />
    ),
    text: 'FNOL',
  },
  {
    key: 'insurer/support',
    icon: <img src={support} className="support-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={support}
        className="support-icon"
        color="black"
        style={{ filter: 'invert(1) brightness(2)' }}
        width={30}
        height={30}
      />
    ),
    text: 'Support',
  },
  {
    key: 'insurer/reports',
    icon: <img src={reports} className="reports-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={reports}
        className="reports-icon"
        color="black"
        style={{ filter: 'invert(1) brightness(2)' }}
        width={30}
        height={30}
      />
    ),
    text: 'Reports',
  },
];

export const superInsurerList = [
  {
    key: 'insurer/dashboard',
    icon: <img src={dashboard} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={dashboard}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Dashboard',
  },
  {
    key: 'insurer/fleets',
    icon: <img src={fleets} height={30} width={30} color="white" className="fleet-tracking-icon" />,
    selectedIcon: (
      <img
        src={fleets}
        height={30}
        width={30}
        color="black"
        className="fleet-tracking-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Fleets',
  },
  {
    key: 'insurer/devices',
    icon: <img src={devices} height={30} width={30} color="white" className="devices-icon" />,
    selectedIcon: (
      <img
        src={devices}
        height={30}
        width={30}
        color="black"
        className="devices-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Devices',
  },
  {
    key: 'insurer/trips',
    icon: <img src={trips} className="trips-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={trips}
        color="black"
        className="trips-icon"
        width={30}
        height={30}
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Trips',
  },
  {
    key: 'insurer/fnol',
    icon: <img src={fnolw} className="fnol-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={fnolw}
        className="fnol-icon"
        color="black"
        style={{ filter: 'invert(1) brightness(2)' }}
        width={30}
        height={30}
      />
    ),
    text: 'FNOL',
  },
  {
    key: 'insurer/support',
    icon: <img src={support} className="support-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={support}
        className="support-icon"
        color="black"
        style={{ filter: 'invert(1) brightness(2)' }}
        width={30}
        height={30}
      />
    ),
    text: 'Support',
  },
  {
    key: 'insurer/reports',
    icon: <img src={reports} className="reports-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={reports}
        className="reports-icon"
        color="black"
        style={{ filter: 'invert(1) brightness(2)' }}
        width={30}
        height={30}
      />
    ),
    text: 'Reports',
  },
  {
    key: 'insurer/user-management',
    icon: <img src={users} className="users-icon" color="white" width={30} height={30} />,
    selectedIcon: (
      <img
        src={users}
        className="users-icon"
        color="black"
        style={{ filter: 'invert(1) brightness(2)' }}
        width={30}
        height={30}
      />
    ),
    text: 'User Management',
  },
  {
    key: 'insurer/settings',
    icon: <img src={settings} height={30} width={30} color="white" className="settings-icon" />,
    selectedIcon: (
      <img
        src={settings}
        height={30}
        width={30}
        color="black"
        className="settings-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Settings',
  },
];

export const categories = [
  {
    title: 'Home',
    defaultRoute: '/dashboard',
    icon: <img src={dashboard} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={dashboard}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    content: insurerList,
  },
];

export const SuperInsurerCategories = [
  {
    title: 'Home',
    defaultRoute: '/dashboard',
    icon: <img src={dashboard} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={dashboard}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    content: superInsurerList,
  },
];
