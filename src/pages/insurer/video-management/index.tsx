import React, { useCallback, useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, Divider, Button } from '@mui/material';
import LoadingScreen from '../../../components/molecules/loading-screen';
import VideoManagementHeader from './video-mangement-header';
import { useSelector } from 'react-redux';
import { selectFilterCriteria } from '../../../redux/insurer/dashcam/dashcamSlice';
import VideoHistoryTable from './video-history-table';
import { DatePicker, Typography } from 'antd';
import { RiCalendar2Line } from '@remixicon/react';
import { getVideoHistory } from '../../../services/insurer/IdevicesService';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import RequestVideoDialog from '../../../components/modals/request-video-dialog';

const VideoManagement: React.FC = () => {
  const location = useLocation();
  const filterCriteria = useSelector(selectFilterCriteria);
  const [searchParams, setSearchParams] = useSearchParams();

  const [videoHistoryData, setVideoHistoryData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [openRequestVideo, setOpenRequestVideo] = useState<any>(false);

  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [displayStartDate, setDisplayStartDate] = useState<any>(null);
  const [displayEndDate, setDisplayEndDate] = useState<any>(null);

  const itemsPerPage = 10;
  const navigationState = location?.state;

  // Get device data from navigation state or localStorage
  const getDeviceData = useCallback(() => {
    // If we have navigation state, store it in localStorage
    if (navigationState?.deviceData) {
      localStorage.setItem('videoManagementDeviceData', JSON.stringify(navigationState.deviceData));
      return navigationState.deviceData;
    }

    // If no navigation state, try to get from localStorage
    try {
      const savedData = localStorage.getItem('videoManagementDeviceData');
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error parsing device data from localStorage:', error);
      return {};
    }
  }, [navigationState]);

  const deviceData = getDeviceData();
  const imeiNumberFromNavigation = deviceData?.imei || null;
  const fleetId = deviceData?.lonestarId || null;
  const deviceId = deviceData?.deviceId || null;

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      // Only fetch if we have the required device information
      if (!deviceId && !fleetId && !imeiNumberFromNavigation) {
        console.error('Missing required device information');
        setVideoHistoryData([]);
        return;
      }

      setLoading(true);
      try {
        const statusTypeFilter: Record<string, string> = {
          completed: 'completed',
          inProgress: 'inProgress',
          isNotFound: 'notFound',
        };

        const statusFilter = Object.keys(filterCriteria)
          .filter((key) => statusTypeFilter[key] && filterCriteria[key])
          .map((key) => statusTypeFilter[key]);

        const { fromDate, toDate, ...rest } = params;

        const requestBody: any = {
          ...rest,
          ...searchQueries,
          ...(fromDate && { startTimeFilter: fromDate }),
          ...(toDate && { endTimeFilter: toDate }),
          deviceId,
          fleetId,
          imei: imeiNumberFromNavigation,
          ...(statusFilter.length > 0 && { statusFilter }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
        };
        const { data } = await getVideoHistory(page, itemsPerPage, requestBody);
        setVideoHistoryData(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setVideoHistoryData([]);
      } finally {
        setLoading(false);
      }
    },
    [
      deviceId,
      fleetId,
      imeiNumberFromNavigation,
      filterCriteria,
      searchParamsState,
      sortParams.key,
      sortParams.order,
      searchQueries,
    ]
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
  }, [currentPage, filterCriteria, sortParams, searchQueries]);

  const handleRequestVideoClose = () => {
    setOpenRequestVideo(false);
  };

  const handleRequestVideoOpen = () => {
    setOpenRequestVideo(true);
  };

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

  const handleSearch = () => {
    const newSearchParams = {
      ...(startDate && { fromDate: startDate }),
      ...(endDate && { toDate: endDate }),
    };
    setSearchParamsState(newSearchParams);
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    fetchData(1, newSearchParams);
  };

  const handleTableSearch = (searchQueries: any) => {
    setSearchQueries(searchQueries);
    setCurrentPage(1);
    setSearchParams({ page: '1' }, { replace: true });
  };

  const handleStartDateChange = (date: any) => {
    setStartDate(date);
    setDisplayStartDate(date);
  };

  const handleEndDateChange = (date: any) => {
    setEndDate(date);
    setDisplayEndDate(date);
  };

  const handleRefresh = () => {
    fetchData(currentPage);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  console.log('filter criteria : ', filterCriteria);

  return (
    <>
      <Box
        mb={2}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <VideoManagementHeader onRequestVideoClick={handleRequestVideoOpen} onRefresh={handleRefresh} />
      </Box>

      <Container maxWidth={false}>
        <Box
          sx={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '48%' }}>
              <Typography.Text strong style={{ marginBottom: '8px', display: 'block' }}>
                From *
              </Typography.Text>
              <DatePicker
                showTime
                format="MM/DD/YY hh:mm a"
                placeholder="Start Date & Time"
                onChange={handleStartDateChange}
                style={{ width: '100%' }}
                suffixIcon={<RiCalendar2Line size={14} />}
                value={displayStartDate}
              />
            </div>
            <div style={{ width: '48%' }}>
              <Typography.Text strong style={{ marginBottom: '8px', display: 'block' }}>
                To *
              </Typography.Text>
              <DatePicker
                showTime
                format="MM/DD/YY hh:mm a"
                placeholder="End Date & Time"
                onChange={handleEndDateChange}
                style={{ width: '100%' }}
                suffixIcon={<RiCalendar2Line size={14} />}
                value={displayEndDate}
              />
            </div>
            <Button
              variant="contained"
              onClick={handleSearch}
              size="small"
              style={{
                marginTop: '24px',
                backgroundColor: '#2C3E50',
                borderRadius: '4px',
                color: '#fff',
                fontSize: 'small',
                textTransform: 'none',
              }}
            >
              Search
            </Button>
          </Box>
        </Box>

        <Typography.Text strong style={{ marginBottom: '16px', display: 'block' }}>
          Video History (IMEI Number: {imeiNumberFromNavigation})
        </Typography.Text>

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
              {loading ? (
                <LoadingScreen />
              ) : (
                <VideoHistoryTable
                  videoHistoryData={videoHistoryData}
                  onPageChange={handlePageChange}
                  onSearch={handleTableSearch}
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
                  fetchData={fetchData}
                />
              )}
            </CardContent>
          </Card>
        </Box>
        <RequestVideoDialog
          open={openRequestVideo}
          handleClose={handleRequestVideoClose}
          fleetId={fleetId}
          deviceId={deviceId}
          imeiNumber={imeiNumberFromNavigation}
        />
      </Container>
    </>
  );
};

export default VideoManagement;
