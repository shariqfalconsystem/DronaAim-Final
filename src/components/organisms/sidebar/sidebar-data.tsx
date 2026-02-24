import dashboard from '../../../assets/icons/dashboard.png';
import fleet from '../../../assets/icons/fleet-tracking.png';
import vehicle from '../../../assets/icons/total-vehicles.png';
import reports from '../../../assets/icons/reports.png';
import support from '../../../assets/icons/support.png';
import trips from '../../../assets/icons/trips.png';
import devices from '../../../assets/icons/total-devices.png';
import users from '../../../assets/icons/users.png';
import ifta from '../../../assets/icons/ifta.png';
import driver from '../../../assets/icons/driver.png';
import event from '../../../assets/icons/event.png';
import settings from '../../../assets/icons/settings-icon.png';
import documentCenter from '../../../assets/icons/documentCenter.png';

export const fmList = [
  {
    key: 'dashboard',
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
    key: 'fleet-tracking',
    icon: <img src={fleet} height={30} width={30} color="white" className="fleet-tracking-icon" />,
    selectedIcon: (
      <img
        src={fleet}
        height={30}
        width={30}
        color="black"
        className="fleet-tracking-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Fleet Tracking',
  },
  {
    key: 'vehicles',
    text: 'Vehicles',
    icon: <img src={vehicle} height={30} width={30} color="white" className="vehicles-icon" />,
    selectedIcon: (
      <img
        src={vehicle}
        height={30}
        width={30}
        color="black"
        className="vehicles-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
  },
  {
    key: 'devices',
    icon: <img src={devices} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={devices}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Devices',
  },
  {
    key: 'drivers',
    icon: <img src={driver} height={30} width={30} color="white" className="drivers-icon" />,
    text: 'Drivers',
    selectedIcon: (
      <img
        src={driver}
        height={30}
        width={30}
        color="black"
        className="drivers-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
  },
  {
    key: 'trips',
    icon: <img src={trips} height={30} width={30} color="white" className="trips-icon" />,
    selectedIcon: (
      <img
        src={trips}
        height={30}
        width={30}
        color="black"
        className="trips-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Trips',
  },
  {
    key: 'events',
    icon: <img src={event} height={30} width={30} color="white" className="events-icon" />,
    selectedIcon: (
      <img
        src={event}
        height={30}
        width={30}
        color="black"
        className="events-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Events',
  },
  {
    key: 'ifta',
    icon: <img src={ifta} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={ifta}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'IFTA',
  },
  {
    key: 'support',
    icon: <img src={support} height={30} width={30} color="white" className="support-icon" />,
    selectedIcon: (
      <img
        src={support}
        height={30}
        width={30}
        color="black"
        className="support-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Support',
  },
  {
    key: 'reports',
    icon: <img src={reports} height={30} width={30} color="white" className="report-icon" />,
    selectedIcon: (
      <img
        src={reports}
        height={30}
        width={30}
        color="black"
        className="report-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Reports',
  },
];

export const SuperFmList = [
  {
    key: 'dashboard',
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
    key: 'fleet-tracking',
    icon: <img src={fleet} height={30} width={30} color="white" className="fleet-tracking-icon" />,
    selectedIcon: (
      <img
        src={fleet}
        height={30}
        width={30}
        color="black"
        className="fleet-tracking-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Fleet Tracking',
  },
  {
    key: 'vehicles',
    text: 'Vehicles',
    icon: <img src={vehicle} height={30} width={30} color="white" className="vehicles-icon" />,
    selectedIcon: (
      <img
        src={vehicle}
        height={30}
        width={30}
        color="black"
        className="vehicles-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
  },
  {
    key: 'devices',
    icon: <img src={devices} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={devices}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Devices',
  },
  {
    key: 'drivers',
    icon: <img src={driver} height={30} width={30} color="white" className="drivers-icon" />,
    text: 'Drivers',
    selectedIcon: (
      <img
        src={driver}
        height={30}
        width={30}
        color="black"
        className="drivers-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
  },
  {
    key: 'trips',
    icon: <img src={trips} height={30} width={30} color="white" className="trips-icon" />,
    selectedIcon: (
      <img
        src={trips}
        height={30}
        width={30}
        color="black"
        className="trips-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Trips',
  },
  {
    key: 'events',
    icon: <img src={event} height={30} width={30} color="white" className="events-icon" />,
    selectedIcon: (
      <img
        src={event}
        height={30}
        width={30}
        color="black"
        className="events-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Events',
  },
  {
    key: 'ifta',
    icon: <img src={ifta} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={ifta}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'IFTA',
  },
  {
    key: 'support',
    icon: <img src={support} height={30} width={30} color="white" className="support-icon" />,
    selectedIcon: (
      <img
        src={support}
        height={30}
        width={30}
        color="black"
        className="support-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Support',
  },
  {
    key: 'reports',
    icon: <img src={reports} height={30} width={30} color="white" className="report-icon" />,
    selectedIcon: (
      <img
        src={reports}
        height={30}
        width={30}
        color="black"
        className="report-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Reports',
  },
  {
    key: 'user-management',
    icon: <img src={users} height={30} width={30} color="white" className="users-icon" />,
    selectedIcon: (
      <img
        src={users}
        height={30}
        width={30}
        color="black"
        className="users-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'User Management',
  },
  {
    key: 'settings',
    icon: <img src={settings} height={30} width={30} color="white" className="users-icon" />,
    selectedIcon: (
      <img
        src={settings}
        height={30}
        width={30}
        color="black"
        className="users-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Settings',
  },
  {
    key: 'documentcenter',
    icon: <img src={documentCenter} height={30} width={30} color="white" className="users-icon" />,
    selectedIcon: (
      <img
        src={documentCenter}
        height={30}
        width={30}
        color="black"
        className="users-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Document Centre',
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
    content: fmList,
  },
];

export const SuperCategories = [
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
    content: SuperFmList,
  },
];
