import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Typography, Button } from '@mui/material';
import TripListTable from './trip-list-table';
import UninsuredTripListTable from './uninsured-trips-list';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../../redux/trips/tripsSlice';
import { getTrips } from '../../../services/fleetManager/tripsService';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import LoadingScreen from '../../../components/molecules/loading-screen';
import { FilterListDialog } from '../../../components/modals/filter-list-dialog';
import { TenantInformation } from '../../../models/TenantInformation';
import { getInsurerTrips } from '../../../services/admin/adminTripsServices';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const TripsList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const filterCriteria = useSelector(selectFilterCriteria);
  const [searchParams, setSearchParams] = useSearchParams();

  const [tripsInformation, setTripsInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const getInitialSelectedButton = (): 'insuredTrips' | 'uninsuredTrips' => {
    const view = searchParams.get('view');
    return view === 'uninsuredTrips' || view === 'insuredTrips' ? view : 'insuredTrips';
  };
  const [selectedButton, setSelectedButton] = useState<'insuredTrips' | 'uninsuredTrips'>(getInitialSelectedButton);
  const [insuredLoading, setInsuredLoading] = useState<boolean>(false);
  const [uninsuredLoading, setUninsuredLoading] = useState<boolean>(false);

  const [uninsuredTripsInformation, setUninsuredTripsInformation] = useState<any>(null);
  const [currentUninsuredPage, setCurrentUninsuredPage] = useState(1);
  const [sortUninsuredParams, setSortUninsuredParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchUninsuredParams, setSearchUninsuredParams] = useState<any>({});
  const [searchUninsuredQueries, setSearchUninsuredQueries] = useState<any>({});
  const [sortUninsuredColumn, setSortUninsuredColumn] = useState<string>('');
  const [sortUninsuredDirection, setSortUninsuredDirection] = useState<'ASC' | 'DESC'>('ASC');

  const itemsPerPage = 10;
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const subscriptionId = selectedButton === 'insuredTrips' ? 'SUB0001' : 'SUB0002';

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setInsuredLoading(true);
      try {
        const tripTypeStatus: Record<string, string> = {
          completed: 'Completed',
          inProgress: 'Started',
          isTruncate: 'orphaned',
        };

        const tripStatus = Object.keys(filterCriteria)
          .filter((key) => tripTypeStatus[key] && filterCriteria[key])
          .map((key) => tripTypeStatus[key]);
        const requestBody: any = {
          ...params,
          subscriptionId,
          ...(filterCriteria.toDate && { toDate: filterCriteria.toDate }),
          ...(filterCriteria.fromDate && { fromDate: filterCriteria.fromDate }),
          ...(filterCriteria.scoreRange && { tripScoreRange: filterCriteria.scoreRange }),

          ...(tripStatus.length > 0 && { tripStatus: tripStatus }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParamsState && { ...searchParamsState }),
          ...(searchParamsState.startDate && { fromDate: searchParamsState.startDate }),
          ...(searchParamsState.endDate && { toDate: searchParamsState.endDate }),
        };

        const { data } = await getInsurerTrips(requestBody, page, itemsPerPage);
        setTripsInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setTripsInformation([]);
      } finally {
        setInsuredLoading(false);
      }
    },
    [subscriptionId, itemsPerPage, filterCriteria, sortParams, searchParamsState]
  );

  const fetchUninsuredData = useCallback(
    async (page: number, params: any = {}) => {
      setUninsuredLoading(true);
      try {
        const tripTypeStatus: Record<string, string> = {
          completed: 'Completed',
          inProgress: 'Started',
          isTruncate: 'orphaned',
        };

        const tripStatus = Object.keys(filterCriteria)
          .filter((key) => tripTypeStatus[key] && filterCriteria[key])
          .map((key) => tripTypeStatus[key]);
        const requestBody: any = {
          ...params,
          subscriptionId,
          ...(filterCriteria.toDate && { toDate: filterCriteria.toDate }),
          ...(filterCriteria.fromDate && { fromDate: filterCriteria.fromDate }),
          ...(filterCriteria.scoreRange && { tripScoreRange: filterCriteria.scoreRange }),

          ...(tripStatus.length > 0 && { tripStatus: tripStatus }),
          ...(sortUninsuredParams.key && {
            sortKey: sortUninsuredParams.key,
            sortOrder: sortUninsuredParams.order,
          }),
          ...(searchUninsuredParams && { ...searchUninsuredParams }),
          ...(searchUninsuredParams.startDate && { fromDate: searchUninsuredParams.startDate }),
          ...(searchUninsuredParams.endDate && { toDate: searchUninsuredParams.endDate }),
        };

        const { data } = await getInsurerTrips(requestBody, page, itemsPerPage);
        setUninsuredTripsInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setUninsuredTripsInformation([]);
      } finally {
        setUninsuredLoading(false);
      }
    },
    [subscriptionId, itemsPerPage, filterCriteria, sortUninsuredParams, searchUninsuredParams]
  );

  useEffect(() => {
    const view = searchParams.get('view') || 'insuredTrips';
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (view === 'insuredTrips') {
      setSelectedButton('insuredTrips');
      setCurrentPage(page);
      fetchData(page, searchParamsState);
    } else if (view === 'uninsuredTrips') {
      setSelectedButton('uninsuredTrips');
      setCurrentUninsuredPage(page);
      fetchUninsuredData(page, searchUninsuredParams);
    }
  }, [searchParams, fetchData, fetchUninsuredData, searchParamsState, searchUninsuredParams]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), view: 'insuredTrips' });
  };

  const handleUnassignedPageChange = (newPage: number) => {
    setCurrentUninsuredPage(newPage);
    setSearchParams({ page: newPage.toString(), view: 'uninsuredTrips' });
  };

  const handleSearch = (searchQueries: any) => {
    setSearchParamsState(searchQueries);
    setCurrentPage(1);
    setSearchParams({ page: '1', view: 'insuredTrips' });
    fetchData(1, searchQueries);
  };
  const handleUnassignedSearch = (searchQueries: any) => {
    setSearchUninsuredParams(searchQueries);
    setCurrentUninsuredPage(1);
    setSearchParams({ page: '1', view: 'uninsuredTrips' });
    fetchUninsuredData(1, searchQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

  const handleUnassignedSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortUninsuredParams(newSortParams);
  };

  const [filterPopupOpen, setFilterPopupOpen] = useState(false);

  const handleFilterIconClick = (event: any) => {
    const buttonRect: any = event?.currentTarget?.getBoundingClientRect();
    setFilterButtonPosition({
      top: buttonRect.bottom,
      left: buttonRect.left,
    });

    setFilterPopupOpen(true);
  };
  const handleFilterPopupClose = () => setFilterPopupOpen(false);

  const handleFilterApply = (filters: any) => {
    dispatch(setFilterCriteria(filters));
    if (selectedButton === 'insuredTrips') {
      setCurrentPage(1);
      setSearchParams({ page: '1', view: 'insuredTrips' });
    } else {
      setCurrentUninsuredPage(1);
      setSearchParams({ page: '1', view: 'uninsuredTrips' });
    }
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    if (selectedButton === 'insuredTrips') {
      setCurrentPage(1);
      setSearchParams({ page: '1', view: 'insuredTrips' });
      fetchData(1, searchParamsState);
    } else {
      setCurrentUninsuredPage(1);
      setSearchParams({ page: '1', view: 'uninsuredTrips' });
      fetchUninsuredData(1, searchUninsuredParams);
    }
  };

  const handleInsuredTripsListClick = () => {
    if (selectedButton !== 'insuredTrips') {
      dispatch(clearFilterCriteria());
      setSelectedButton('insuredTrips');
      setCurrentPage(1);
      setSearchParams({ view: 'insuredTrips', page: '1' });
    }
  };
  const handleUninsuredTripsClick = () => {
    if (selectedButton !== 'uninsuredTrips') {
      dispatch(clearFilterCriteria());
      setSelectedButton('uninsuredTrips');
      setCurrentUninsuredPage(1);
      setSearchParams({ view: 'uninsuredTrips', page: '1' });
    }
  };

  const isLoading = selectedButton === 'insuredTrips' ? insuredLoading : uninsuredLoading;

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2} sx={{ marginTop: 1 }}>
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: '100%',
              borderRadius: '20px',
              backgroundColor: '#fff',
            }}
          >
            <Card sx={{ borderRadius: '10px' }}>
              <CardContent sx={{ padding: '0px', fontSize: '0.875rem' }}>
                <Divider />
                <SegmentControlDesktop
                  handleFilterIconClick={handleFilterIconClick}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'insuredTrips' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleInsuredTripsListClick}
                      >
                        Trips (Insured Fleets)
                      </Button>
                      <Button
                        variant={selectedButton === 'uninsuredTrips' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleUninsuredTripsClick}
                      >
                        Trips (Uninsured Fleets)
                      </Button>
                    </Box>
                  }
                />

                {isLoading ? (
                  <LoadingScreen />
                ) : (
                  <>
                    {selectedButton === 'insuredTrips' && (
                      <TripListTable
                        tripsInformation={tripsInformation}
                        onPageChange={handlePageChange}
                        onSearch={handleSearch}
                        onSort={handleSort}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        filterCriteria={filterCriteria}
                        searchQueries={searchQueries}
                        setSearchQueries={setSearchQueries}
                        setSortColumn={setSortColumn}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                      />
                    )}
                    {selectedButton === 'uninsuredTrips' && (
                      <UninsuredTripListTable
                        tripsInformation={uninsuredTripsInformation}
                        onPageChange={handleUnassignedPageChange}
                        onSearch={handleUnassignedSearch}
                        onSort={handleUnassignedSort}
                        currentPage={currentUninsuredPage}
                        setCurrentPage={setCurrentUninsuredPage}
                        filterCriteria={filterCriteria}
                        searchQueries={searchUninsuredQueries}
                        setSearchQueries={setSearchUninsuredQueries}
                        setSortColumn={setSortUninsuredColumn}
                        sortColumn={sortUninsuredColumn}
                        sortDirection={sortUninsuredDirection}
                        setSortDirection={setSortUninsuredDirection}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterListDialog
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />
      </Grid>
    </Container>
  );
};

export default TripsList;
