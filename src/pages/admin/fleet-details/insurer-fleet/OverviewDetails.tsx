import { Box, Grid } from '@mui/material';
import { Typography } from '@mui/material';
import BlueDevicesIcon from '../../../assets/icons/blue-devices.png';
import BlueTruckIcon from '../../../assets/icons/blue-truck.png';
import DriverIdIcon from '../../../assets/icons/drivers-id.png';
import { useNavigate } from 'react-router-dom';
import OverviewPieChart from './overview-piechart';
import { FaChartPie } from 'react-icons/fa';
import { RiRefreshLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import { paths } from '../../../../common/constants/routes';

function OverviewDetails({ vehiclesInformation, driversInformation, devicesInformation, onRefresh }: any) {
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  const navigate = useNavigate();

  const handleVehiclesOverviewClick = () => {
    navigate(paths.VEHICLES);
  };

  const handleDriversOverviewClick = () => {
    navigate(paths.DRIVERSLIST);
  };

  const handleDevicesOverviewClick = () => {
    navigate(paths.DEVICESLSIT);
  };

  const vehicleDataLabels = ['Active', 'Inactive'];
  const vehicleData = [vehiclesInformation?.totalActiveVehicles, vehiclesInformation?.totalInActiveVehicles];

  const driversDataLabels = ['On Trip', 'Off Trip'];
  const driversData = [driversInformation?.totalDriverOnTrip, driversInformation?.totalDriverOffTrip];

  const devicesDataLabels = ['Online', 'Offline', 'Unassigned'];
  const deviceData = [
    devicesInformation?.totalDevicesOnline,
    devicesInformation?.totalDevicesOffline,
    devicesInformation?.totalDevicesUnassigned,
  ];

  const getCurrentDateTime = () => {
    const now = new Date();
    const options: any = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return now.toLocaleDateString('en-US', options);
  };

  const handleRefresh = () => {
    onRefresh();
    setLastUpdateTime(new Date());
  };

  useEffect(() => {
    setLastUpdateTime(new Date());
  }, [vehiclesInformation, driversInformation, devicesInformation]);

  return (
    <Box
      sx={{
        borderTop: '1px solid #ccc',
        marginTop: 1,
        backgroundColor: '#fff',
        borderRadius: '10px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          padding: 1,
          borderBottom: '1px solid #ccc',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
            <FaChartPie color="#4C6784" />
          </Box>
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
            <Typography>Overview</Typography>
          </Box>
        </Box>

        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.8rem', textWrap: 'nowrap', alignItems: 'center', justifyContent: 'center' }}>
            Last Update:{' '}
            <Typography
              component="span"
              sx={{
                fontSize: '0.8rem',
                color: '#247fad',
                textWrap: 'nowrap',
                mr: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getCurrentDateTime()}
            </Typography>
          </Typography>
          <Box onClick={handleRefresh} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <RiRefreshLine size={15} />
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          height: {
            xs: 'auto',
            md: 'auto',
          },
          backgroundColor: (theme) => theme.palette.common.white,
          marginBottom: 8,
        }}
      >
        <Grid container spacing={0} sx={{}}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                height: '400px',
                width: '100%',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                paddingTop: 2,
              }}
              onClick={handleVehiclesOverviewClick}
            >
              <Box
                sx={{
                  borderBottom: '1px solid #ccc',
                  padding: 1,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <Box sx={{ ml: 1 }}>
                  <img src={BlueTruckIcon} alt="vehicles-overview" height={20} />
                </Box>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  VEHICLES
                </Typography>
              </Box>
              <OverviewPieChart
                count={vehiclesInformation?.totalNoOfVehicles || '0'}
                label="Total Vehicles"
                dataLabels={vehicleDataLabels}
                data={vehicleData}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                height: '400px',
                width: '100%',
                borderRadius: 0,
                borderLeft: '1px solid #ccc',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                paddingTop: 2,
              }}
              onClick={handleDriversOverviewClick}
            >
              <Box
                sx={{
                  borderBottom: '1px solid #ccc',
                  padding: 1,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <Box sx={{ ml: 1 }}>
                  <img src={DriverIdIcon} alt="driver-id" height={20} />
                </Box>

                <Typography variant="body2" sx={{ ml: 1 }}>
                  DRIVERS
                </Typography>
              </Box>
              <OverviewPieChart
                count={driversInformation?.totalNoOfDrivers || '0'}
                label="Total Drivers"
                dataLabels={driversDataLabels}
                data={driversData}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#FF5C00',
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  px: 2,
                }}
              >
                * On Trip and Off Trip status is dependent on drivers sending "On Trip" and "Off Trip" in Driver app
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                height: '400px',
                width: '100%',
                borderLeft: '1px solid #ccc',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                paddingTop: 2,
              }}
              onClick={handleDevicesOverviewClick}
            >
              <Box
                sx={{
                  borderBottom: '1px solid #ccc',
                  padding: 1,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <Box sx={{ ml: 1 }}>
                  <img src={BlueDevicesIcon} alt="devices" height={20} />
                </Box>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  DEVICES
                </Typography>
              </Box>
              <OverviewPieChart
                count={devicesInformation?.totalNoOfDevices || 0}
                label="Total Devices"
                dataLabels={devicesDataLabels}
                data={deviceData}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default OverviewDetails;
