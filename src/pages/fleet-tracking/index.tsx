import { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Container, Grid } from '@mui/material';
import MapContainerComponent from './map-container-component';
import LiveTrackingDetails from './live-tracking-details';
import LiveTrackingList from './live-tracking-list';
import { getLiveTrackingByDeviceId, getLiveTrackingList } from '../../services/fleetManager/liveTrackingService';
import { getAddressFromCoordinatesGoogle } from '../../utility/utilities';
import LoadingScreen from '../../components/molecules/loading-screen';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

const FleetTracking = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);
  const [highlightedVehicle, setHighlightedVehicle] = useState<any | null>(null);
  const [liveTrackingListData, setLiveTrackingListData] = useState<any | null>(null);
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveTrackingDetailsLoading, setIsLiveTrackingDetailsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(() => {
    const pageFromUrl = searchParams.get('page');
    return pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
  });

  const itemsPerPage = 10;
  const lonestarId = 'LS1013'; // Temporarily hardcoded

  // Debounce search query
  useEffect(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    searchDebounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchQuery]);

  const fetchLiveTrackingByDevice = useCallback(async (deviceId: string) => {
    setIsLiveTrackingDetailsLoading(true);
    try {
      const { data } = await getLiveTrackingByDeviceId(deviceId);
      setSelectedVehicleDetails(data);
    } catch (error) {
      console.error('Error fetching live tracking data:', error);
    } finally {
      setIsLiveTrackingDetailsLoading(false);
    }
  }, []);

  const fetchLiveTrackingData = useCallback(
    async (page = 1, vehicleStatuses?: string[], vehicleId?: string) => {
      setIsLoading(true);
      try {
        const { data } = await getLiveTrackingList(lonestarId, page, itemsPerPage, vehicleStatuses, vehicleId);

        if (data?.devices) {
          const modifiedData = data.devices.map((vehicle: any) => ({
            ...vehicle,
            status: vehicle?.vehicleStatus === 'Completed' ? 'Inactive' : 'Active',
            speed: vehicle?.vehicleStatus === 'Completed' ? 0 : vehicle?.lastLiveTrack?.gnssInfo?.speed,
          }));

          setLiveTrackingListData({
            devices: modifiedData,
            pageDetails: data.pageDetails,
          });

          const newAddresses: Record<string, string> = {};
          for (const vehicle of modifiedData) {
            const address = await getAddressFromCoordinatesGoogle(
              vehicle?.lastLiveTrack?.gnssInfo?.latitude,
              vehicle?.lastLiveTrack?.gnssInfo?.longitude
            );
            newAddresses[vehicle?.deviceId] = address;
          }
          setAddresses(newAddresses);
        }
      } catch (error) {
        console.error('Error fetching live tracking data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [lonestarId, itemsPerPage]
  );

  // Fetch data when lonestarId, currentPage, selectedFilters, or debouncedSearchQuery changes
  useEffect(() => {
    if (lonestarId) {
      const vehicleStatuses = selectedFilters.length > 0 ? selectedFilters.map((f) => f.toLowerCase()) : undefined;
      const vehicleId = debouncedSearchQuery.trim() || undefined;

      fetchLiveTrackingData(currentPage, vehicleStatuses, vehicleId);
    }
  }, [lonestarId, currentPage, selectedFilters, debouncedSearchQuery, fetchLiveTrackingData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', newPage.toString());
      return params;
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', '1');
      if (query.trim()) {
        params.set('search', query.trim());
      } else {
        params.delete('search');
      }
      return params;
    });
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', '1');
      return params;
    });
  };

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    fetchLiveTrackingByDevice(vehicle.deviceId);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('deviceId', vehicle.deviceId);
      return params;
    });
  };

  const handleVehicleClose = () => {
    setSelectedVehicle(null);
    setSelectedVehicleDetails(null);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('deviceId');
      return newParams;
    });
  };

  const handleRefresh = () => {
    const vehicleStatuses = selectedFilters.length > 0 ? selectedFilters.map((f) => f.toLowerCase()) : undefined;
    const vehicleId = debouncedSearchQuery.trim() || undefined;

    fetchLiveTrackingData(currentPage, vehicleStatuses, vehicleId);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth={false} disableGutters sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Grid container sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', height: '100%' }}>
            <Grid item xs={3} sx={{ height: '100%', position: 'relative', overflowY: 'auto' }}>
              <Box sx={{ height: '100vh' }}>
                {selectedVehicle ? (
                  <LiveTrackingDetails
                    selectedVehicle={selectedVehicle}
                    onClose={handleVehicleClose}
                    addresses={addresses}
                    selectedVehicleDetails={selectedVehicleDetails}
                    fetchLiveTrackingByDevice={fetchLiveTrackingByDevice}
                    isLoading={isLiveTrackingDetailsLoading}
                  />
                ) : (
                  <LiveTrackingList
                    onVehicleSelect={handleVehicleSelect}
                    highlightedVehicle={highlightedVehicle}
                    liveTrackingListData={liveTrackingListData}
                    addresses={addresses}
                    onRefresh={handleRefresh}
                    setHighlightedVehicle={setHighlightedVehicle}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    searchQuery={searchQuery}
                    selectedFilters={selectedFilters}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={9} sx={{ padding: '0 !important', height: '100%' }}>
              <Box sx={{ height: '100%' }}>
                <MapContainerComponent
                  selectedVehicle={selectedVehicle}
                  highlightedVehicle={highlightedVehicle}
                  onVehicleClick={handleVehicleSelect}
                  setHighlightedVehicle={setHighlightedVehicle}
                  liveTrackingListData={liveTrackingListData}
                  selectedVehicleDetails={selectedVehicleDetails}
                  addresses={addresses}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default FleetTracking;
