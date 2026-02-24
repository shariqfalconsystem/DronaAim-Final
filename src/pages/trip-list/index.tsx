import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container } from '@mui/material';
import SegmentControlDesktop from '../../components/molecules/segment-control-desktop';
import TripListTable from './trip-list-table';
import { getFleetTrips } from '../../services/fleetManager/tripsService';
import { FilterListDialog } from '../../components/modals/filter-list-dialog';
import LoadingScreen from '../../components/molecules/loading-screen';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../redux/trips/tripsSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TripsList: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterCriteria = useSelector(selectFilterCriteria);

  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [tripsInformation, setTripsInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');

  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const itemsPerPage = 10;
  const lonestarId = 'LS1013'; // Temporarily hardcoded

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
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
          ...(filterCriteria.toDate && { toDate: filterCriteria.toDate }),
          ...(filterCriteria.fromDate && { fromDate: filterCriteria.fromDate }),
          ...(filterCriteria.scoreRange && { tripScoreRange: filterCriteria.scoreRange }),
          // ...(tripStatus.length > 0 &&
          //   !tripStatus.includes('orphaned') &&
          //   !tripStatus.includes('Started') &&
          //   filterCriteria.scoreRange && { tripScoreRange: filterCriteria.scoreRange }),

          ...(tripStatus && { tripStatus }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(params && { ...params }),
          ...(params.startDate && { fromDate: params.startDate }),
          ...(params.endDate && { toDate: params.endDate }),
        };

        const { data } = await getFleetTrips(lonestarId, page, itemsPerPage, requestBody);
        setTripsInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setTripsInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [lonestarId, itemsPerPage, filterCriteria, sortParams]
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

  useEffect(() => {
    fetchData(currentPage, searchParamsState);
  }, [currentPage, filterCriteria, sortParams]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

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
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    setCurrentPage(1);
  };

  const handleSearch = (searchQueries: any) => {
    setSearchParamsState(searchQueries);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    fetchData(1, searchQueries);
  };

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

                <SegmentControlDesktop handleFilterIconClick={handleFilterIconClick} leftText="All Trips" />

                {loading ? (
                  <LoadingScreen />
                ) : (
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
