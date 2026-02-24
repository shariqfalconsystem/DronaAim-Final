import { Container, Grid, Alert, Box } from '@mui/material';
import MyFleet from './myfleet/MyFleet';
import { useCallback, useEffect, useState } from 'react';
import OverviewDetails from './myfleet/OverviewDetails';
import TripsDashboardTable from './myfleet/trips-dashboard-table';
import {
  getDeviceStatus,
  getDriverStatus,
  getTripsByStatus,
  getVehicleStatus,
} from '../../services/fleetManager/dashboardService';
import { useSelector, useDispatch } from 'react-redux';
import PolicyExpirationDialog from '../../common/components/login-restriction';
import { useSearchParams } from 'react-router-dom';
import { fetchUserInfo } from '../../redux/auth/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [tripsInformation, setTripsInformation] = useState<any>(null);
  const [vehiclesInformation, setVehiclesInformation] = useState<any>(null);
  const [driversInformation, setDriversInformation] = useState<any>(null);
  const [devicesInformation, setDevicesInformation] = useState<any>(null);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState<boolean>(false);
  const [isDriversLoading, setIsDriversLoading] = useState<boolean>(false);
  const [isDevicesLoading, setIsDevicesLoading] = useState<boolean>(false);

  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [filterCriteria, setFilterCriteria] = useState<any>(null);

  const itemsPerPage = 6;

  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const policyDetails = useSelector((state: any) => state?.auth?.userData?.selectedRole?.policyDetails?.[0] || []);

  const userInfo = useSelector((state: any) => state?.auth?.userInfo);

  const isPolicyExpired = !policyDetails?.isActive;
  const showWarningBanner = policyDetails?.isActive && policyDetails?.warning;

  // Function to format the warning message with bold and underlined date
  const formatWarningMessage = (message: string) => {
    if (!message) return message;

    // Regex to match date patterns like "November 06, 2025" or "Nov 06, 2025" etc.
    const dateRegex = /([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/g;
    const parts = message.split(dateRegex);

    return parts.map((part, index) => {
      // If this part matches the date pattern, make it bold and underlined
      if (dateRegex.test(part)) {
        dateRegex.lastIndex = 0; // Reset regex
        return (
          <span key={index} style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const fetchTripData = useCallback(
    async (page: number, params: any = {}) => {
      setIsLoading(true);
      try {
        const requestBody: any = {
          ...params,
          ...(filterCriteria?.toDate && { toDate: filterCriteria?.toDate }),
          ...(filterCriteria?.fromDate && { fromDate: filterCriteria?.fromDate }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(params && { ...params }),
          ...(params.startDate && { fromDate: params.startDate }),
          ...(params.endDate && { toDate: params.endDate }),
        };

        const { data } = await getTripsByStatus(lonestarId, page, itemsPerPage, requestBody);
        setTripsInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setTripsInformation([]);
      } finally {
        setIsLoading(false);
      }
    },
    [lonestarId, itemsPerPage, sortParams, filterCriteria]
  );

  useEffect(() => {
    setSearchParams({ page: currentPage.toString() }, { replace: true });
  }, [currentPage, setSearchParams]);

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, []);

  const fetchVehiclesData = async () => {
    setIsVehiclesLoading(true);
    try {
      const vehiclesData = await getVehicleStatus(lonestarId);
      setVehiclesInformation(vehiclesData?.data);
    } catch (error) {
      console.error('Error fetching vehicles data:', error);
    } finally {
      setIsVehiclesLoading(false);
    }
  };

  const fetchDriversData = async () => {
    setIsDriversLoading(true);
    try {
      const driversData = await getDriverStatus(lonestarId);
      setDriversInformation(driversData?.data);
    } catch (error) {
      console.error('Error fetching drivers data:', error);
    } finally {
      setIsDriversLoading(false);
    }
  };

  const fetchDevicesData = async () => {
    setIsDevicesLoading(true);
    try {
      const devicesData = await getDeviceStatus(lonestarId);
      setDevicesInformation(devicesData?.data);
    } catch (error) {
      console.error('Error fetching devices data:', error);
    } finally {
      setIsDevicesLoading(false);
    }
  };

  const fetchDashboardData = () => {
    fetchVehiclesData();
    fetchDriversData();
    fetchDevicesData();
  };

  useEffect(() => {
    fetchTripData(currentPage, searchParamsState);
    fetchDashboardData();
  }, [currentPage, filterCriteria, sortParams, fetchTripData]);

  // Fetch user info from Redux on component mount
  useEffect(() => {
    if (!userInfo) {
      dispatch(fetchUserInfo() as any);
    }
  }, [dispatch, userInfo]);

  const handleSearch = (searchQueries: any) => {
    setSearchParamsState(searchQueries);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    fetchTripData(1, searchQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <Box sx={{ p: 0, m: 0 }}>
      {showWarningBanner && (
        <Alert
          severity="warning"
          icon={false}
          sx={{
            borderRadius: 0,
            margin: 0,
            padding: '18px 16px',
            color: '#D24537',
            backgroundColor: '#FFEEEC',
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            marginTop: 0,
            marginBottom: 0,
            '& .MuiAlert-message': {
              width: '100%',
              textAlign: 'center',
              padding: 0,
            },
            '& .MuiAlert-icon': {
              color: 'red',
            },
          }}
        >
          {formatWarningMessage(policyDetails?.warning)}
        </Alert>
      )}

      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          filter: !policyDetails?.isActive ? 'blur(1px)' : 'none',
          pointerEvents: !policyDetails?.isActive ? 'none' : 'auto',
          transition: 'filter 0.3s ease-in-out',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MyFleet />
          </Grid>
          <Grid item xs={12} sx={{ width: '80vw' }}>
            <TripsDashboardTable
              tripsInformation={tripsInformation}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              onSort={handleSort}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              searchQueries={searchQueries}
              setSearchQueries={setSearchQueries}
              setSortColumn={setSortColumn}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              filterCriteria={filterCriteria}
              setFilterCriteria={setFilterCriteria}
              isLoading={isLoading}
            />
          </Grid>
          <Grid item xs={12}>
            <OverviewDetails
              vehiclesInformation={vehiclesInformation}
              driversInformation={driversInformation}
              devicesInformation={devicesInformation}
              tripsInformation={tripsInformation}
              handleSearch={handleSearch}
              handlePageChange={handlePageChange}
              searchQuery={searchQuery}
              onRefresh={handleRefresh}
              isStatsLoading={isStatsLoading}
              isVehiclesLoading={isVehiclesLoading}
              isDriversLoading={isDriversLoading}
              isDevicesLoading={isDevicesLoading}
            />
          </Grid>
        </Grid>
        <PolicyExpirationDialog
          userInfo={userInfo}
          isOpen={isPolicyExpired}
          message={policyDetails?.message}
          warning={policyDetails?.warning}
        />
      </Container>
    </Box>
  );
};

export default Dashboard;
