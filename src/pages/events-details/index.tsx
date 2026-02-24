import { useCallback, useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, IconButton } from '@mui/material';
import { IoArrowBack } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import VideoSection from './video-section';
import { getLiveTrackingByTripId } from '../../services/fleetManager/liveTrackingService';
import Gas from '../../assets/icons/gas.png';
import { LuRefreshCcw } from 'react-icons/lu';
import {
  convertSpeedToMph,
  formatLocalizedDateWithMonth,
  formatTime,
  formatUserDateWithMonth,
  getAssociatedLabel,
  splitAddressInTwoLines,
} from '../../utility/utilities';
import EventsMapComponent from './events-map-component';

const EventsDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [liveTrackingData, setLiveTrackingData] = useState([]);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');

  const {
    eventId,
    eventType,
    tripId,
    vehicleId,
    gnssInfo,
    formattedDate,
    media,
    driverId,
    tsInMilliSeconds,
    address,
    imei,
    vin,
  } = state;

  const fetchLiveTrackingData = useCallback(async () => {
    if (tripId) {
      try {
        const { data } = await getLiveTrackingByTripId(tripId);
        setLiveTrackingData(data);

        let { startLatitude, startLongitude, endLatitude, endLongitude, vehicleLiveTracks, startAddress, endAddress } =
          // eslint-disable-next-line no-unsafe-optional-chaining
          data;

        const isStartEstimated = !startLatitude || !startLongitude;
        const isEndEstimated = !endLatitude || !endLongitude;

        if (isStartEstimated) {
          startLatitude = vehicleLiveTracks?.[vehicleLiveTracks.length - 1]?.latitude;
          startLongitude = vehicleLiveTracks?.[vehicleLiveTracks.length - 1]?.longitude;
        }

        if (isEndEstimated) {
          endLatitude = vehicleLiveTracks?.[0]?.latitude;
          endLongitude = vehicleLiveTracks?.[0]?.longitude;
        }

        setStartAddress(startAddress);
        setEndAddress(endAddress);
      } catch (error) {
        console.error('Error fetching live tracking data:', error);
      }
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) {
      fetchLiveTrackingData();
    }
  }, [tripId, fetchLiveTrackingData]);

  const formattedTime = formatTime(tsInMilliSeconds);

  const showMap = gnssInfo?.latitude !== 0 && gnssInfo?.longitude !== 0;

  const speedInMph = convertSpeedToMph(gnssInfo?.speed);

  return (
    <>
      <Box
        mb={4}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid container spacing={2} display="flex" alignItems="center" justifyContent="space-between">
          <Grid item display="flex" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate(-1)}>
                  <IoArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {eventId}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <IconButton onClick={fetchLiveTrackingData} sx={{ display: 'flex', alignItems: 'center' }}>
                  <LuRefreshCcw color="#247FAD" size={20} />
                </IconButton>{' '}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Container maxWidth={false}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={7}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '10px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Event Type :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {getAssociatedLabel(eventType)}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Trip ID :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {tripId}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Date :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state?.localizedTsInMilliSeconds
                        ? formatLocalizedDateWithMonth(state?.localizedTsInMilliSeconds, state?.tzAbbreviation)
                            ?.onlyDate
                        : formatUserDateWithMonth(state?.tsInMilliSeconds).onlyDate}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Time :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state?.localizedTsInMilliSeconds
                        ? formatLocalizedDateWithMonth(state?.localizedTsInMilliSeconds, state?.tzAbbreviation)?.time
                        : formatUserDateWithMonth(state?.tsInMilliSeconds).time}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Location :{' '}
                    {address ? (
                      <span style={{ display: 'inline' }}>
                        {splitAddressInTwoLines(address).map((line: string, index: number) => (
                          <Typography
                            key={index}
                            component="span"
                            sx={{
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              color: '#333',
                              display: index === 0 ? 'inline' : 'block',
                            }}
                          >
                            {line}
                          </Typography>
                        ))}
                      </span>
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'inline' }}>
                        NA
                      </Typography>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Driver ID :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {driverId || 'NA'}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Driver Name :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state.driverFullName ? `${state.driverFullName}` : 'NA'}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Phone Number :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state.phoneNo ? `${state.phoneNo}` : 'NA'}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Vehicle ID :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {vehicleId || 'NA'}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    VIN :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state.lookup_vehicles?.[0]?.vin || 'NA'}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    IMEI Number :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {imei || 'NA'}
                    </Typography>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            <Paper
              elevation={3}
              sx={{
                textAlign: 'center',
                mt: 3,
                p: 1,
                borderRadius: '10px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                height: '600px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {showMap ? (
                <EventsMapComponent
                  eventLocation={{ lat: gnssInfo?.latitude, lng: gnssInfo?.longitude }}
                  liveTrackDetails={liveTrackingData}
                  startAddress={startAddress}
                  endAddress={endAddress}
                  eventAddress={address}
                  eventDate={
                    state?.localizedTsInMilliSeconds
                      ? formatLocalizedDateWithMonth(state?.localizedTsInMilliSeconds, state?.tzAbbreviation)?.date
                      : formatUserDateWithMonth(state?.tsInMilliSeconds).date
                  }
                />
              ) : (
                <Typography variant="h6" sx={{ color: '#888' }}>
                  Map Not Available
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={5} container direction="column">
            <Grid item>
              <Paper
                elevation={3}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: '10px',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  height: 200,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Box component="img" src={Gas} alt="Speedometer" sx={{ width: '80px', height: '80px', mr: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                    {speedInMph} mph
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Maximum Speed Recorded
                </Typography>
              </Paper>
            </Grid>

            <Grid item>
              <VideoSection
                media={media}
                eventData={state}
                eventDate={
                  state?.localizedTsInMilliSeconds
                    ? formatLocalizedDateWithMonth(state?.localizedTsInMilliSeconds, state?.tzAbbreviation)?.YYYYMMDD
                    : formatUserDateWithMonth(state?.tsInMilliSeconds).YYYYMMDD
                }
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default EventsDetails;
