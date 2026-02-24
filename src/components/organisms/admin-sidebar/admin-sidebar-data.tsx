import users from '../../../assets/icons/users.png';
import settings from '../../../assets/icons/settings-icon.png';
import insurance from '../../../assets/icons/insurance.png';
import fleets from '../../../assets/icons/fleets.png';
import vehicle from '../../../assets/icons/total-vehicles.png';
import devices from '../../../assets/icons/total-devices.png';
import driver from '../../../assets/icons/driver.png';
import trips from '../../../assets/icons/trips.png';

export const homeList = [
  {
    key: 'admin/user-management',
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
    text: 'Users',
  },

  {
    key: 'admin/insurance',
    icon: <img src={insurance} height={30} width={30} color="white" className="users-icon" />,
    selectedIcon: (
      <img
        src={insurance}
        height={30}
        width={30}
        color="black"
        className="users-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Insurance',
  },
  {
    key: 'admin/fleets',
    icon: <img src={fleets} height={30} width={30} color="white" className="users-icon" />,
    selectedIcon: (
      <img
        src={fleets}
        height={30}
        width={30}
        color="black"
        className="users-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Fleets',
  },
  {
    key: 'admin/vehicles',
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
    key: 'admin/drivers',
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
    key: 'admin/devices',
    icon: <img src={devices} height={30} width={30} color="white" className="users-icon" />,
    selectedIcon: (
      <img
        src={devices}
        height={30}
        width={30}
        color="black"
        className="users-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Devices',
  },
  {
    key: 'admin/trips',
    icon: <img src={trips} height={30} width={30} color="white" className="users-icon" />,
    selectedIcon: (
      <img
        src={trips}
        height={30}
        width={30}
        color="black"
        className="users-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    text: 'Trips',
  },
  {
    key: 'admin/settings',
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
];

export const categories = [
  {
    title: 'Home',
    defaultRoute: 'admin/user-management',
    icon: <img src={users} height={30} width={30} color="white" className="home-icon" />,
    selectedIcon: (
      <img
        src={users}
        height={30}
        width={30}
        color="black"
        className="home-icon"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    ),
    content: homeList,
  },
];
