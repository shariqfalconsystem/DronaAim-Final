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
import Loader from '../../../components/molecules/loader';
import { paths } from '../../../common/constants/routes';

function OverviewDetails({
  vehiclesInformation,
  driversInformation,
  devicesInformation,
  onRefresh,
  isVehiclesLoading,
  isDriversLoading,
  isDevicesLoading,
}: any) {
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

  const driversDataLabels = ['vehicle assign', 'vehicle unassign'];
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
          padding: 2,
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
          borderRadius: '0 0 10px 10px',
        }}
      >
        <Grid container spacing={0}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                height: '400px',
                width: '100%',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={handleVehiclesOverviewClick}
            >
              <Box
                sx={{
                  borderBottom: '1px solid #ccc',
                  padding: 1.25,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  transition: 'background-color 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#a8d1e3',
                  },
                }}
              >
                <Box sx={{ ml: 1, display: 'flex' }}>
                  <img src={BlueTruckIcon} alt="vehicles-overview" height={20} />
                </Box>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  VEHICLES
                </Typography>
              </Box>
              {isVehiclesLoading ? (
                <Loader />
              ) : (
                <OverviewPieChart
                  count={vehiclesInformation?.totalNoOfVehicles}
                  label="Total Vehicles"
                  dataLabels={vehicleDataLabels}
                  data={vehicleData}
                />
              )}
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
              }}
              onClick={handleDriversOverviewClick}
            >
              <Box
                sx={{
                  borderBottom: '1px solid #ccc',
                  padding: 1.25,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  transition: 'background-color 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#a8d1e3',
                  },
                }}
              >
                <Box sx={{ ml: 1, display: 'flex' }}>
                  <img src={DriverIdIcon} alt="driver-id" height={20} />
                </Box>

                <Typography variant="body2" sx={{ ml: 1 }}>
                  DRIVERS
                </Typography>
              </Box>
              {isDriversLoading ? (
                <Loader />
              ) : (
                <OverviewPieChart
                  count={driversInformation?.totalNoOfDrivers}
                  label="Total Drivers"
                  dataLabels={driversDataLabels}
                  data={driversData}
                />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: '#FF5C00',
                  fontSize: '0.65rem',
                  textAlign: 'center',
                  px: 2,
                  overflow: 'hidden',
                }}
              >
                * The numbers shown are subject to vary against actuals depending on the assignment of vehicles to
                drivers on the driver app
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
              }}
              onClick={handleDevicesOverviewClick}
            >
              <Box
                sx={{
                  borderBottom: '1px solid #ccc',
                  padding: 1.25,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  transition: 'background-color 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#a8d1e3',
                  },
                }}
              >
                <Box sx={{ ml: 1, display: 'flex' }}>
                  <img src={BlueDevicesIcon} alt="devices" height={20} />
                </Box>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  DEVICES
                </Typography>
              </Box>
              {isDevicesLoading ? (
                <Loader />
              ) : (
                <OverviewPieChart
                  count={devicesInformation?.totalNoOfDevices}
                  label="Total Devices"
                  dataLabels={devicesDataLabels}
                  data={deviceData}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default OverviewDetails;
