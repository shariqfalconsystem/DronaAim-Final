import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container, Grid } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';

import DriverDetailsHeader from './driver-details-header';
import DriverOverview from './driver-overview';
import DriverTripsOverview from './driver-trips-overview';
import DriverVehicleOverview from './driver-vehicle-overview';
import DriverTripsList from './driver-trips-list';
import {
  getDriverDocuments,
  getDriversLatestTripsList,
  getUserById,
  postVehiclesTripsList,
} from '../../services/fleetManager/driverServices';
import DriverScoreChart from './driver-score-chart';
import DriverEventsChart from './driver-events-chart';
import { getVehicleDetails, getVehicleStats } from '../../services/fleetManager/vehiclesService';
import DriverDocumentList from './driver-document-list';
import { useSelector } from 'react-redux';

const ITEMS_PER_PAGE = 10;
const MAX_RECORDS = 50000;

const DriversDetails: React.FC = () => {
  const { driverId } = useParams<{ driverId: any }>();
  const { state } = useLocation();
  const [tripsLoading, setTripsLoading] = useState(true);
  const [driverTripsInformation, setDriverTripsInformation] = useState<any>([]);
  const [allDriverTrips, setAllDriverTrips] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleStats, setVehicleStats] = useState<any>(null);
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [vehicleStatsLoading, setVehicleStatsLoading] = useState(true);
  const [latestTrip, setLatestTrip] = useState<any>({});
  const [totalDriverTrips, setTotalDriverTrips] = useState<any>(null);
  const [documentsInformation, setDocumentsInformation] = useState<any>([]);
  const [allDocuments, setAllDocuments] = useState<any>([]);

  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParams, setSearchParams] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [filterCriteria, setFilterCriteria] = useState<any>(null);
  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const currentRoleCheck: string = useSelector((state: any) => state.auth.currentUserRole);

  const itemsPerPage = 6;

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

  const fetchTripData = useCallback(
    async (page: number, params: any = {}) => {
      try {
        const convertedTripDistance = searchParams.tripDistance
          ? parseFloat((searchParams.tripDistance * 1.609344).toString())
          : undefined;

        const requestBody: any = {
          ...params,
          ...(currentRoleCheck !== 'admin' && { lonestarId }),
          ...(filterCriteria?.toDate && { toDate: filterCriteria?.toDate }),
          ...(filterCriteria?.fromDate && { fromDate: filterCriteria?.fromDate }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParams && { ...searchParams }),
          ...(searchParams.tripDistance && { tripDistance: convertedTripDistance }),
          ...(searchParams.startDate && { fromDate: searchParams.startDate }),
          ...(searchParams.endDate && { toDate: searchParams.endDate }),
        };

        const { data } = await postVehiclesTripsList(driverId, page, itemsPerPage, requestBody);
        setDriverTripsInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setDriverTripsInformation([]);
      }
    },
    [driverId, itemsPerPage, sortParams, searchParams, filterCriteria]
  );

  const fetchVehicleStats = useCallback(async (vehicleId: string) => {
    if (!vehicleId) return;
    setVehicleStatsLoading(true);
    try {
      const { data } = await getVehicleStats(vehicleId);
      setVehicleStats(data);
    } catch (error) {
      console.error('Failed to fetch vehicle stats:', error);
    } finally {
      setVehicleStatsLoading(false);
    }
  }, []);

  const fetchVehicleDetails = useCallback(async (vehicleId: string) => {
    if (!vehicleId) return;
    try {
      const { data } = await getVehicleDetails(vehicleId);
      setVehicleDetails(data);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    if (!driverId) return;
    try {
      const { data } = await getUserById(driverId);
      setUserInfo(data);

      const filteredOrgData = data?.orgRoleAndScoreMapping?.find((org: any) => org.lonestarId === lonestarId);

      const vehicleIdToUse = filteredOrgData?.vehicleId || data?.vehicleId;
      if (vehicleIdToUse) {
        fetchVehicleStats(vehicleIdToUse);
        fetchVehicleDetails(vehicleIdToUse);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  }, [driverId, lonestarId, fetchVehicleStats, fetchVehicleDetails]);

  const fetchLatestTripData = useCallback(async () => {
    try {
      const requestBody: any = {
        ...(currentRoleCheck !== 'admin' && { lonestarId }),
      };
      const { status, data } = await getDriversLatestTripsList(driverId, requestBody, 1, 1);
      setLatestTrip(data?.trips[0]);
      setTotalDriverTrips(data?.pageDetails?.totalRecords);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setLatestTrip([]);
      } else {
        console.error('Error fetching tenant information:', error);
      }
    }
  }, [driverId]);

  const fetchDriverDocuments = useCallback(async () => {
    setTripsLoading(true);
    try {
      const { data } = await getDriverDocuments(driverId, lonestarId);
      setDocumentsInformation(data?.userDocuments);

      if (data?.userDocuments?.length < MAX_RECORDS) {
        const allData = await getDriverDocuments(driverId, lonestarId);
        setAllDocuments(allData?.data?.userDocuments || []);
      } else {
        setAllDocuments([]);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setDriverTripsInformation([]);
        setAllDriverTrips([]);
      } else {
        console.error('Error fetching tenant information:', error);
      }
    } finally {
      setTripsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchTripData(currentPage);
  }, [fetchTripData, currentPage]);

  useEffect(() => {
    fetchLatestTripData();
  }, [fetchLatestTripData]);

  useEffect(() => {
    fetchUserInfo();
    fetchDriverDocuments();
  }, [fetchUserInfo, fetchDriverDocuments]);

  const filteredUserInfo = userInfo?.orgRoleAndScoreMapping?.find((org: any) => org.lonestarId === lonestarId);

  const firstName = state?.firstName || userInfo?.firstName;
  const lastName = state?.lastName || userInfo?.lastName;
  const vehicleId = state?.roleAndScoreMapping?.vehicleId || filteredUserInfo?.vehicleId;
  const meanScore = state?.roleAndScoreMapping?.meanScore || filteredUserInfo?.meanScore;
  const driverLonestarId = state?.roleAndScoreMapping?.lonestarId || lonestarId;

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

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
        <DriverDetailsHeader
          driverId={driverId}
          state={{ firstName, lastName, vehicleId, meanScore }}
          latestTrip={latestTrip}
          totalDriverTrips={totalDriverTrips}
        />
      </Box>
      <Container maxWidth={false}>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item md={12}>
            <DriverOverview userInfo={userInfo} />
          </Grid>
          <Grid item md={7}>
            <DriverTripsOverview latestTrip={latestTrip} />
          </Grid>
          <Grid item md={5}>
            <DriverVehicleOverview vehicleStats={vehicleStats} vehicleDetails={vehicleDetails} />
          </Grid>
          <Grid item md={12}>
            <DriverScoreChart driverId={driverId} driverLonestarId={driverLonestarId} />
          </Grid>
          <Grid item md={12}>
            <DriverEventsChart driverId={driverId} driverLonestarId={driverLonestarId} />
          </Grid>
          <Grid item md={12} sx={{ width: '80vw' }}>
            <DriverTripsList
              tripsInformation={driverTripsInformation}
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
          <Grid item md={12}>
            <DriverDocumentList
              documentsInformation={documentsInformation}
              documentsList={allDocuments}
              fetchData={fetchDriverDocuments}
              driverId={driverId}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default DriversDetails;
