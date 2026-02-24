import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Container, Box } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { getTripsEvents } from '../../../services/fleetManager/tripsService';
import LoadingScreen from '../../../components/molecules/loading-screen';
import { getLiveTrackingByTripId } from '../../../services/fleetManager/liveTrackingService';
import { postVehicleDeviceStats } from '../../../services/fleetManager/vehiclesService';
import { getDriversLatestTripsList, getUserById } from '../../../services/fleetManager/driverServices';
import TripFleetDetails from './trip-fleet-details';
import TripDetatilsHeader from '../../trip-details/trip-details-header';
import LocationOverview from '../../trip-details/location-overview';
import DriverOverview from '../../trip-details/driverOverview';
import SafetyScoreAnalysis from '../../trip-details/safety-score-analysis';
import IncidentReport from '../../trip-details/incident-report';
import TripDetailsTimeline from '../../trip-details/timeline';
import VehicleOverview from '../../trip-details/vehicle-overview';
import { useSelector } from 'react-redux';

const TripDetails: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tripEvents, setTripEvents] = useState<any>(null);
  const [liveTrackDetails, setLiveTrackDetails] = useState<any>([]);
  const [vehicleStats, setVehicleStats] = useState<any>([]);
  const [driverId, setDriverId] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalDriverTrips, setTotalDriverTrips] = useState<any>(null);
  const lonestarId = useSelector((state: any) => state?.auth?.userData?.currentLonestarId);
  const currentRoleCheck: string = useSelector((state: any) => state.auth.currentUserRole);

  const { tripId }: any = useParams<{ tripId: string }>();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const vin = searchParams.get('vin');

  const { state } = location;

  const vehicleId = state?.vehicleId;
  const deviceId = state?.deviceId;

  console.log('deviceId: ', deviceId);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await getTripsEvents(tripId);
        setTripEvents(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId, vin]);

  useEffect(() => {
    const fetchLiveTrackDetails = async () => {
      try {
        setIsLoading(true);
        const { status, data } = await getLiveTrackingByTripId(tripId);
        setLiveTrackDetails(data);
        setDriverId(data?.driverId);
      } catch (error) {
        console.error('Failed to fetch trip details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveTrackDetails();
  }, [tripId]);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setIsLoading(true);

        const payload: any = {
          vehicleId,
          deviceId,
        };

        const { status, data } = await postVehicleDeviceStats(payload);

        setVehicleStats(data);
      } catch (error) {
        console.error('Failed to fetch trip details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (vehicleId && deviceId) {
      fetchVehicleDetails();
    }
  }, [vehicleId, deviceId]);

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

  const eventCounts = tripEvents?.allEvents?.reduce((acc: any, event: any) => {
    if (acc[event.eventType]) {
      acc[event.eventType]++;
    } else {
      acc[event.eventType] = 1;
    }
    return acc;
  }, {});

  const totalCount = tripEvents?.pageDetails?.totalRecords;

  if (loading) {
    return <LoadingScreen />;
  }

  console.log('vehicle stats: ', vehicleStats);

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
        <TripDetatilsHeader tripId={tripId} trips={state} />
      </Box>

      <Container maxWidth={false} disableGutters={true}>
        <Grid container spacing={2} sx={{ px: 2 }}>
          <Grid item md={12}>
            <TripFleetDetails state={state} />
          </Grid>
          <Grid item md={12}>
            <LocationOverview
              tripsData={liveTrackDetails}
              vehicleStats={vehicleStats}
              totalCount={totalCount}
              state={state}
            />
          </Grid>

          <Grid item md={7}>
            <VehicleOverview vin={vin} trips={state} vehicleStats={vehicleStats} height={300} />
          </Grid>
          <Grid item md={5}>
            <DriverOverview
              trips={state}
              height={300}
              tripsData={liveTrackDetails}
              userInfo={userInfo}
              totalDriverTrips={totalDriverTrips}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Box>
              <SafetyScoreAnalysis trips={state} eventCounts={eventCounts} totalCount={totalCount} />
            </Box>
            <Box
              sx={{
                borderRadius: '10px',
                backgroundColor: '#fff',
                padding: '20px',
                mt: 2,
              }}
            >
              <IncidentReport tripEvents={tripEvents} />
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <TripDetailsTimeline tripEvents={tripEvents} liveTrackDetails={liveTrackDetails} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default TripDetails;
