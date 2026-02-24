import { Grid, Card, CardContent, Divider, Box, Container, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingScreen from '../../../components/molecules/loading-screen';
import { getFleetDetails, getFleetStats } from '../../../services/insurer/IdashboardService';
import StatusCard from './status-card';
import totalFleets from '../../../assets/icons/totalFleet.png';
import totalDrivers from '../../../assets/icons/totalDrivers.png';
import totalVehicles from '../../../assets/icons/totalVehicles.png';
import FleetPerformanceTable from './fleet-performance';
import DriversOverviewTable from './drivers-overview';
import EventsTable from './events-table';
import VehiclesOverviewTable from './vehicles-overview';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../../redux/insurer/dashboard/idashboardSlice';
import { FleetPerformanceModal } from '../../../components/modals/iFleet-performance-dialog';
import portfolio from '../../../assets/img/portfolio.png';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PolicyExpirationDialog from '../../../common/components/login-restriction';

interface FleetData {
  fleetCompanies: any[];
  pageDetails: { totalRecords: number };
}

interface Stats {
  totalFleets: number;
  totalDrivers: number;
  totalVehicles: number;
}

const ITEMS_PER_PAGE = 10;

const Dashboard = () => {
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const filterCriteria = useSelector(selectFilterCriteria);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [fleetData, setFleetData] = useState<FleetData>({
    fleetCompanies: [],
    pageDetails: { totalRecords: 0 },
  });
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<Record<string, any>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, any>>({});
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [filterButtonPosition, setFilterButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);

  const fetchFleetStats = useCallback(async () => {
    try {
      const response = await getFleetStats(insurerId);
      setStats(response?.data);
    } catch (error) {
      console.error('Error fetching fleet stats:', error);
      setStats(null);
    }
  }, [insurerId]);

  const fetchFleetDetails = useCallback(
    async (page: number, params: any = {}) => {
      try {
        const requestBody = {
          insurerId,
          ...(filterCriteria && {
            lastThirtyDayTotalDistanceInMilesRange: filterCriteria.milesRange,
            fleetScoreRange: filterCriteria.scoreRange,
            eventsPerMileRange: filterCriteria.eventsPerMile,
          }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...params,
          ...(params.name && { fleetName: params.name }),
        };

        const { data } = await getFleetDetails(requestBody, page, ITEMS_PER_PAGE);
        setFleetData(data);
      } catch (error) {
        console.error('Error fetching fleet details:', error);
        setFleetData({ fleetCompanies: [], pageDetails: { totalRecords: 0 } });
      }
    },
    [filterCriteria, sortParams, ITEMS_PER_PAGE, insurerId]
  );

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchFleetDetails(currentPage, searchParamsState);
  }, [currentPage, filterCriteria, sortParams, searchParamsState, fetchFleetDetails]);

  useEffect(() => {
    fetchFleetStats();
  }, [fetchFleetStats]);

  const handleSearch = (queries: Record<string, any>) => {
    setSearchParamsState(queries);
    setSearchQueries(queries);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortParams({ key: column, order: direction });
    setCurrentPage(1);
    setSearchParams({ page: '1' });
  };

  const handleFilterIconClick = (event: React.MouseEvent<HTMLElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setFilterButtonPosition({
      top: buttonRect.bottom,
      left: buttonRect.left,
    });
    setFilterPopupOpen(true);
  };

  const handleFilterPopupClose = () => setFilterPopupOpen(false);

  const handleFilterApply = (filters: any) => {
    dispatch(setFilterCriteria(filters));
    setCurrentPage(1);
    setSearchParams({ page: '1' });
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    setCurrentPage(1);
    setSearchParams({ page: '1' });
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <Container maxWidth={false}>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <StatusCard icon={totalFleets} title="Total Fleets" value={stats?.totalFleets} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatusCard icon={totalDrivers} title="Total Drivers" value={stats?.totalDrivers} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatusCard icon={totalVehicles} title="Total Vehicles" value={stats?.totalVehicles} />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: '100%',
              borderRadius: '20px',
              backgroundColor: '#fff',
            }}
          >
            <Card sx={{ borderRadius: '10px', overflowX: 'auto' }}>
              <CardContent sx={{ padding: '0px', fontSize: '0.875rem' }}>
                <Divider />
                <SegmentControlDesktop
                  handleFilterIconClick={handleFilterIconClick}
                  handleSearchChange={(e: any) => handleSearch({ name: e.target.value })}
                  leftText={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img src={portfolio} alt="portfolio" width={31} height={32} />
                      <Typography sx={{ fontSize: '0.875rem', ml: 2 }}>Portfolio Performance</Typography>
                    </Box>
                  }
                />
                <FleetPerformanceTable
                  fleets={fleetData}
                  onPageChange={handlePageChange}
                  onSort={handleSort}
                  onSearch={handleSearch}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  searchQueries={searchQueries}
                  filterCriteria={filterCriteria}
                  setSearchQueries={setSearchQueries}
                  setSortColumn={setSortColumn}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  setSortDirection={setSortDirection}
                />
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <FleetPerformanceModal
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />

        <Grid item xs={12}>
          <EventsTable insurerId={insurerId} />
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={3} mb={2}>
            <Grid item xs={12} md={6}>
              <DriversOverviewTable insurerId={insurerId} />
            </Grid>
            <Grid item xs={12} md={6}>
              <VehiclesOverviewTable insurerId={insurerId} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
