import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container, Grid } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import VehicleDetailsHeader from './vehicle-details-header';
import VehicleOverview from './vehicles-overview-card';
import VehicleTripOverview from './vehicle-trip-overview';
import VehicleTripDetails from './vehicle-trip-details';
import VehicleScoreChart from './vehicle-score-chart';
import DriverOverview from '../trip-details/driverOverview';
import EventOverview from './event-overview';
import LoadingScreen from '../../components/molecules/loading-screen';
import { getVehicleStats, postVehiclesTripsList } from '../../services/fleetManager/vehiclesService';
import { getLiveTrackingByTripId } from '../../services/fleetManager/liveTrackingService';
import { getDriversLatestTripsList, getUserById } from '../../services/fleetManager/driverServices';
import { useSelector } from 'react-redux';

const ITEMS_PER_PAGE = 10;
const MAX_RECORDS = 50000;

const VehicleDetails: React.FC = () => {
  const [vehicleTripsInformation, setVehicleTripsInformation] = useState<any>([]);
  const [allVehicleTrips, setAllVehicleTrips] = useState<any[]>([]);
  const [liveTrackingData, setLiveTrackingData] = useState<any>([]);
  const [vehicleStats, setVehicleStats] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const [tripsLoading, setTripsLoading] = useState(false);
  const [liveTrackingLoading, setLiveTrackingLoading] = useState(false);
  const [vehicleStatsLoading, setVehicleStatsLoading] = useState(false);
  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const currentRoleCheck: string = useSelector((state: any) => state.auth.currentUserRole);

  const [currentPage, setCurrentPage] = useState(1);

  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParams, setSearchParams] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [filterCriteria, setFilterCriteria] = useState<any>(null);
  const [totalDriverTrips, setTotalDriverTrips] = useState<any>(null);

  const { vin } = useParams<{ vin: string }>();
  const { state } = useLocation();

  const { vehicleId, latestTrip, tripStatus, lookup_devices, deviceId, make, model, year, vehicleStatus, driverId } =
    state || {};

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  const itemsPerPage = 6;

  const fetchTripData = useCallback(
    async (page: number, params: any = {}) => {
      try {
        const defaultSortParams = {
          key: 'tripId',
          order: 'DESC',
        };

        const requestBody: any = {
          ...params,
          ...(currentRoleCheck !== 'admin' && { lonestarId }),
          ...(filterCriteria?.toDate && { toDate: filterCriteria?.toDate }),
          ...(filterCriteria?.fromDate && { fromDate: filterCriteria?.fromDate }),
          ...(sortParams?.key
            ? {
              sortKey: sortParams.key,
              sortOrder: sortParams.order,
            }
            : {
              sortKey: defaultSortParams.key,
              sortOrder: defaultSortParams.order,
            }),
          ...(searchParams && { ...searchParams }),
          ...(searchParams.startDate && { fromDate: searchParams.startDate }),
          ...(searchParams.endDate && { toDate: searchParams.endDate }),
        };

        const { data } = await postVehiclesTripsList(vehicleId, page, itemsPerPage, requestBody);
        setVehicleTripsInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setVehicleTripsInformation([]);
      }
    },
    [vehicleId, itemsPerPage, sortParams, searchParams, filterCriteria]
  );

  const fetchLiveTrackingData = useCallback(async () => {
    if (!latestTrip?.tripId) return;
    setLiveTrackingLoading(true);
    try {
      const { data } = await getLiveTrackingByTripId(latestTrip?.tripId);
      console.log('data', data);

      setLiveTrackingData(data);
    } catch (error) {
      console.error('Error fetching live tracking data:', error);
    } finally {
      setLiveTrackingLoading(false);
    }
  }, [latestTrip?.tripId]);

  const fetchVehicleDetails = useCallback(async () => {
    if (!vehicleId) return;
    setVehicleStatsLoading(true);
    try {
      const { data } = await getVehicleStats(vehicleId);
      setVehicleStats(data);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    } finally {
      setVehicleStatsLoading(false);
    }
  }, [vehicleId]);
  console.log('driverID', driverId);
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { status, data } = await getUserById(driverId);
        setUserInfo(data);
      } catch (error) {
        console.error('Failed to fetch vehicle details:', error);
      }
    };

    if (driverId) {
      fetchUserInfo();
    }
  }, [driverId]);

  const fetchLatestTripData = useCallback(async () => {
    try {
      const requestBody: any = {
        ...(currentRoleCheck !== 'admin' && { lonestarId }),
      };
      const { status, data } = await getDriversLatestTripsList(driverId, requestBody, 1, 1);
      setTotalDriverTrips(data?.pageDetails?.totalRecords);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setTotalDriverTrips('NA');
      } else {
        console.error('Error fetching tenant information:', error);
      }
    }
  }, [driverId]);

  useEffect(() => {
    if (driverId) {
      fetchLatestTripData();
    }
  }, [fetchLatestTripData, driverId]);

  useEffect(() => {
    fetchTripData(currentPage);
  }, [currentPage, fetchTripData]);

  useEffect(() => {
    fetchLiveTrackingData();
  }, [fetchLiveTrackingData]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  const handleSearch = (searchQueries: any) => {
    setSearchParams(searchQueries);
    setCurrentPage(1);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

  if (tripsLoading || liveTrackingLoading || vehicleStatsLoading) {
    return <LoadingScreen />;
  }
  console.log('vehicle status', vehicleTripsInformation?.[0]?.vehicleStatus);

  return (
    <>
      <Box
        mb={1}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <VehicleDetailsHeader vin={vin} state={state} />
      </Box>
      <Container maxWidth={false}>
        <Grid container spacing={2.5} sx={{ marginTop: 0.5 }}>
          <Grid item md={12}>
            <VehicleOverview
              Vin={vin}
              lookup_devices={lookup_devices}
              deviceId={deviceId}
              vehicleStats={vehicleStats}
              make={make}
              model={model}
              year={year}
              tagLicencePlateNumber={state?.tagLicencePlateNumber || 'NA'}
            />
          </Grid>
          <Grid item md={6}>
            <VehicleTripOverview Vin={vin} liveTrackingData={liveTrackingData} latestTrip={latestTrip} />
          </Grid>
          <Grid item md={6}>
            <DriverOverview
              trips={state}
              height={300}
              tripsData={liveTrackingData}
              userInfo={userInfo}
              totalDriverTrips={totalDriverTrips}
            />
          </Grid>
          <Grid item md={12}>
            <VehicleScoreChart vehicleId={vehicleId} />
          </Grid>
          <Grid item md={12}>
            <EventOverview vehicleId={vehicleId} />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ marginTop: 1 }}>
          <Grid item md={12} id="vehicle-trip-details" sx={{ width: '80vw' }}>
            <VehicleTripDetails
              tripsInformation={vehicleTripsInformation}
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
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default VehicleDetails;
