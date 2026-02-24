import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilterCriteria, setFilterCriteria } from '../../../redux/insurer/fnol/fnolSlice';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import LoadingScreen from '../../../components/molecules/loading-screen';
import FnolListTable from './fnol-list-table';
import { getFnolList, fnolExport } from '../../../services/fleetManager/eventsService';
import { useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import FilterSearchDateDialog from '../../../components/modals/filter-fnol-dialog';
import { getDefaultDateRange } from '../../../../src/utility/utilities';

const FnolList: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const filterCriteria = useSelector(selectFilterCriteria);
  const [searchParams, setSearchParams] = useSearchParams();

  const [fnolInformation, setFnolInformation] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [fnolLimit, setFnolLimit] = useState<number>(10000);

  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);

  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);
  const itemsPerPage = 10;
  const lonestarId = 'LS1013'; // Temporarily hardcoded

  // Initialize default date range in Redux on component mount
  useEffect(() => {
    if (!filterCriteria?.fromDate || !filterCriteria?.toDate) {
      const defaultDates = getDefaultDateRange();
      dispatch(
        setFilterCriteria({
          fromDate: defaultDates.fromDate,
          toDate: defaultDates.toDate,
        })
      );
    }
  }, [dispatch]);

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
      try {
        const transformedSearchParams = { ...params };
        const defaultDates = getDefaultDateRange();
        const fromDate = filterCriteria?.fromDate || defaultDates.fromDate;
        const toDate = filterCriteria?.toDate || defaultDates.toDate;
        const sendClaims = filterCriteria?.sendClaims;
        const requestBody: any = {
          ...params,
          insurerId,
          fromDate,
          toDate,
          ...(sendClaims && sendClaims.length > 0 && { sendClaims }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(transformedSearchParams && { ...transformedSearchParams }),
        };
        if (transformedSearchParams?.tsInMilliSeconds) {
          requestBody.dateAndTime = Number(transformedSearchParams?.tsInMilliSeconds);
          delete requestBody.tsInMilliSeconds;
        }
        if (transformedSearchParams?.uiEventType) {
          requestBody.eventType = transformedSearchParams?.uiEventType;
          delete requestBody.uiEventType;
        }
        if (transformedSearchParams?.speedInMph) {
          requestBody.speed = transformedSearchParams?.speedInMph;
          delete requestBody.speedInMph;
        }
        const { data } = await getFnolList(page, itemsPerPage, requestBody);
        setFnolInformation(data);
        setFnolLimit(data.pageDetails.totalRecords);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setFnolInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, filterCriteria, sortParams]
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

  useEffect(() => {
    if (location.state?.refetch) {
      fetchData(currentPage, searchParamsState);
      // Clear the refetch flag so it doesn't refetch infinitely
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    fetchData(1, filters);
  };

  const handleClearFilter = () => {
    const defaultDates = getDefaultDateRange();
    dispatch(
      setFilterCriteria({
        fromDate: defaultDates.fromDate,
        toDate: defaultDates.toDate,
      })
    );
    setCurrentPage(1);
    fetchData(1, searchParamsState);
  };

  const handleSearch = (searchQueries: any) => {
    setSearchParamsState(searchQueries);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    fetchData(1, searchQueries);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortParams({ key: column, order: direction });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleExport = async (fileType: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    if (!currentUserId || !insurerId) {
      toast.error('Insurer ID or User ID not found. Please try logging in again.');
      return;
    }

    setIsDownloading(true);
    try {
      const transformedSearchParams = { ...searchParamsState };
      const defaultDates = getDefaultDateRange();
      const fromDate = filterCriteria?.fromDate || defaultDates.fromDate;
      const toDate = filterCriteria?.toDate || defaultDates.toDate;
      const sendClaims = filterCriteria?.sendClaims;

      const requestBody: any = {
        ...searchParamsState,
        insurerId,
        fromDate,
        toDate,
        ...(sendClaims && sendClaims.length > 0 && { sendClaims }),
        ...(sortParams.key && {
          sortKey: sortParams.key,
          sortOrder: sortParams.order,
        }),
        ...(transformedSearchParams && { ...transformedSearchParams }),
      };

      // Add status filters if they exist
      if (filterCriteria?.statuses && filterCriteria.statuses.length > 0) {
        requestBody.statuses = filterCriteria.statuses;
      }

      if (transformedSearchParams?.tsInMilliSeconds) {
        requestBody.dateAndTime = Number(transformedSearchParams?.tsInMilliSeconds);
        delete requestBody.tsInMilliSeconds;
      }
      if (transformedSearchParams?.uiEventType) {
        requestBody.eventType = transformedSearchParams?.uiEventType;
        delete requestBody.uiEventType;
      }
      if (transformedSearchParams?.speedInMph) {
        requestBody.speed = transformedSearchParams?.speedInMph;
        delete requestBody.speedInMph;
      }

      const response = await fnolExport(insurerId, currentUserId, fileType, fnolLimit, requestBody);

      if (response?.status === 200 && response?.data?.signedUrl) {
        console.log('data', response?.data);
        const fileResponse = await fetch(response.data.signedUrl);
        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
        }

        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const filename = `FNOL_Events_${year}_${month}_${day}.${fileType}`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('FNOL_Events exported successfully');
      } else {
        throw new Error('Download URL not received from server');
      }
    } catch (error: any) {
      console.error('Error exporting fnol:', error);
      toast.error(error.message || 'Failed to export FNOL_Events');
    } finally {
      setIsDownloading(false);
    }
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
            <Card sx={{ borderRadius: '10px', overflowX: 'auto' }}>
              <CardContent sx={{ padding: '0px', fontSize: '0.875rem' }}>
                <Divider />

                <SegmentControlDesktop
                  isFnol={true}
                  handleExport={handleExport}
                  isDownloading={isDownloading}
                  handleFilterIconClick={handleFilterIconClick}
                  leftText={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: '500', ml: 1 }}>
                        First-Notice-of-Loss (FNOL)
                      </Typography>
                    </Box>
                  }
                />
                {loading ? (
                  <LoadingScreen />
                ) : (
                  <FnolListTable
                    fnolInformation={fnolInformation}
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
                    fetchData={fetchData}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterSearchDateDialog
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

export default FnolList;
