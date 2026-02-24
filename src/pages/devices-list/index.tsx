import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Typography } from '@mui/material';
import SegmentControlDesktop from '../../components/molecules/segment-control-desktop';
import LoadingScreen from '../../components/molecules/loading-screen';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../redux/trips/tripsSlice';
import DevicesListTable from './devices-list-table';
import { getDeviceList } from '../../services/fleetManager/devicesService';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FilterDevicesDialog } from '../../components/modals/filter-admin-devices';

const DeviceList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filterCriteria = useSelector(selectFilterCriteria);

  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const [deviceInformation, setDeviceInformation] = useState<any>(null);
  const [allDeviceList, setAllDeviceList] = useState<any[]>([]);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(() => {
    const page = urlSearchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({
    key: 'lastStatusPing',
    order: 'DESC',
  });
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [deviceFootageData, setDeviceFootageData] = useState<any>(null);
  const [mode, setMode] = useState<'add' | 'link' | 'footage'>('add');

  const isUserSearchRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const lonestarId = 'LS1093'; // Temporarily hardcoded for devices

  const itemsPerPage = 10;

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
      try {
        let updatedSortKey = sortParams.key;
        if (sortParams.key === 'lastStatusPing') {
          updatedSortKey = 'statusTsInMilliseconds';
        } else if (sortParams.key === 'lastLocationPing') {
          updatedSortKey = 'lastLiveTrack.tsInMilliSeconds';
        }

        const requestBody: any = {
          ...params,
          ...(filterCriteria?.status && {
            status: Object.entries(filterCriteria.status)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'online' ? 'Online' : 'Offline')),
          }),
          ...(filterCriteria?.isLastPingStatusFourteenDaysAgo !== null &&
            filterCriteria?.isLastPingStatusFourteenDaysAgo !== undefined && {
            isLastPingStatusFourteenDaysAgo: filterCriteria.isLastPingStatusFourteenDaysAgo,
          }),
          ...(updatedSortKey && {
            sortKey: updatedSortKey,
            sortOrder: sortParams.order,
          }),
          ...(searchParamsState && { ...searchParamsState }),
        };

        const { data } = await getDeviceList(lonestarId, page, itemsPerPage, requestBody);
        setDeviceInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setDeviceInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [lonestarId, itemsPerPage, filterCriteria, sortParams, searchParamsState]
  );

  useEffect(() => {
    const page = parseInt(urlSearchParams.get('page') || '1', 10);
    setCurrentPage(page);
    fetchData(page, searchParamsState);

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [urlSearchParams, fetchData]);

  useEffect(() => {
    if (!isInitialLoadRef.current) {
      if (isUserSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentPage(1);
          setUrlSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            return newParams;
          });
          isUserSearchRef.current = false;
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchParamsState, setUrlSearchParams]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setUrlSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      return newParams;
    });
  };

  const handleSearch = (searchQueries: any) => {
    isUserSearchRef.current = true;
    setSearchParamsState(searchQueries);
    setSearchQueries(searchQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
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
    setCurrentPage(1);
    setUrlSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '1');
      return newParams;
    });
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    setCurrentPage(1);
    setUrlSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '1');
      return newParams;
    });
    fetchData(1, searchParamsState);
  };

  const handleDeviceVideoClick = (deviceData: any) => {
    setMode('footage');
    setDeviceFootageData(deviceData);
    if (deviceData && deviceData?.deviceId) {
      navigate(`/fm/devices/video-management/${deviceData.deviceId}`, { state: { deviceData } });
    } else {
      console.error('deviceId not found in deviceData');
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
            <Card sx={{ borderRadius: '10px' }}>
              <CardContent sx={{ padding: '0px', fontSize: '0.875rem' }}>
                <Divider />
                <SegmentControlDesktop
                  handleFilterIconClick={handleFilterIconClick}
                  leftText="All Devices"
                  isFMDevice={true}
                />
                {loading ? (
                  <LoadingScreen />
                ) : (
                  <DevicesListTable
                    deviceInformation={deviceInformation}
                    onPageChange={handlePageChange}
                    processedData={processedData}
                    onSearch={handleSearch}
                    onSort={handleSort}
                    currentPage={currentPage}
                    filterCriteria={filterCriteria}
                    searchQueries={searchQueries}
                    setSearchQueries={setSearchQueries}
                    setSortColumn={setSortColumn}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    onDeviceVideo={handleDeviceVideoClick}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterDevicesDialog
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

export default DeviceList;
