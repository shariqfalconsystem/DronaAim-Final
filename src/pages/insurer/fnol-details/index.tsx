import { useCallback, useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, IconButton } from '@mui/material';
import { IoArrowBack } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import VideoSection from './video-section';
import { getLiveTrackingByTripId } from '../../../services/fleetManager/liveTrackingService';
import { getFalsePositiveFnol } from '../../../services/fleetManager/eventsService';
import { getShortUrl } from '../../../services/fleetManager/shareService';
import Gas from '../../../assets/icons/gas.png';
import { LuRefreshCcw } from 'react-icons/lu';
import {
  convertSpeedToMph,
  formatLocalizedDateWithMonth,
  formatTime,
  formatUserDateWithMonth,
  splitAddressInTwoLines,
} from '../../../utility/utilities';
import EventsMapComponent from './fnol-map-component';
import SendClaims from '../../insurer/fnol-list/sendToClaims-dialog';
import environment from '../../../environments/environment';

const FnolDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [liveTrackingData, setLiveTrackingData] = useState([]);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [notifyOpen, setNotifyOpen] = useState(false);

  // Initialize with the current state, and manage it locally
  const [isFalsePositive, setIsFalsePositive] = useState<boolean | null>(state?.isFalsePositive ?? null);
  const [loading, setLoading] = useState(false);

  const currentLoggedInUserId = useSelector((state: any) => state.auth.currentUserId);
  const baseUrl = environment?.mediaBaseUrl;

  const { eventId, tripId, imei, gnssInfo, media, tsInMilliSeconds, address } = state;

  // Update local isFalsePositive when navigation state changes
  useEffect(() => {
    if (state?.isFalsePositive !== undefined) {
      setIsFalsePositive(state.isFalsePositive);
    }
  }, [state?.isFalsePositive]);

  const fetchLiveTrackingData = useCallback(async () => {
    if (tripId) {
      try {
        const { data } = await getLiveTrackingByTripId(tripId);
        setLiveTrackingData(data);

        let { startLatitude, startLongitude, endLatitude, endLongitude, vehicleLiveTracks, startAddress, endAddress } =
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

  const getMediaWithShortUrls = async (media: any): Promise<any> => {
    if (!media || media.length === 0) {
      return [];
    }

    const mp4Media = media.filter((item: any) => item.type === 'mp4');
    const mediaWithShortUrls = [];

    for (const item of mp4Media) {
      try {
        const fullUrl = baseUrl + item.url;
        const response = await getShortUrl(fullUrl);

        if (response.status === 200) {
          mediaWithShortUrls.push({
            type: item.type,
            camera: item.camera,
            startTsInMilliseconds: item.startTsInMilliseconds,
            endTsInMilliseconds: item.endTsInMilliseconds,
            url: response.data.alias_url,
          });
        } else {
          mediaWithShortUrls.push({
            type: item.type,
            camera: item.camera,
            startTsInMilliseconds: item.startTsInMilliseconds,
            endTsInMilliseconds: item.endTsInMilliseconds,
            url: fullUrl,
          });
        }
      } catch (error) {
        console.error('Error shortening media URL:', error);
        // Use full URL as fallback on error
        mediaWithShortUrls.push({
          type: item.type,
          camera: item.camera,
          startTsInMilliseconds: item.startTsInMilliseconds,
          endTsInMilliseconds: item.endTsInMilliseconds,
          url: baseUrl + item.url,
        });
      }
    }

    return mediaWithShortUrls;
  };

  const callFalsePositiveAPI = async (value: string, note?: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const mediaWithShortUrls = await getMediaWithShortUrls(state.media);

      const requestBody = {
        currentLoggedInUserId: currentLoggedInUserId,
        eventId: state.eventId,
        vendorEventId: state.vendorEventId,
        tsInMilliSeconds: state.tsInMilliSeconds?.toString(),
        isFalsePositive: value === 'No',
        imei: state.imei,
        eventType: state.eventType || state.uiEventType,
        media: mediaWithShortUrls,
        ...(note && { note }),
      };

      const response = await getFalsePositiveFnol(requestBody);

      if (response?.status === 200) {
        toast.success(value === 'Yes' ? 'Event sent to claims successfully' : 'Event marked as false positive');

        setIsFalsePositive(value === 'No');
      } else {
        toast.error(response?.data?.details || 'Failed to update event');
      }
    } catch (error: any) {
      console.error('Error updating FNOL event:', error);
      toast.error(error?.message || 'Error occurred while updating event');
    } finally {
      setLoading(false);
    }
  };

  const handleYesClick = () => {
    if (isFalsePositive === false) return;
    setNotifyOpen(true);
  };

  const handleNoClick = async () => {
    if (isFalsePositive === true || isFalsePositive === false) return;
    await callFalsePositiveAPI('No');
  };

  const handleConfirmSendClaims = (note?: string) => {
    callFalsePositiveAPI('Yes', note);
  };

  const formattedTime = formatTime(tsInMilliSeconds);
  const showMap = gnssInfo?.latitude !== 0 && gnssInfo?.longitude !== 0;
  const speedInMph = convertSpeedToMph(gnssInfo?.speed);

  const isYesSelected = isFalsePositive === false;
  const isNoSelected = isFalsePositive === true;

  return (
    <>
      <Box
        mb={4}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side - Back and Event ID */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)}>
            <IoArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {eventId}
          </Typography>

          <IconButton onClick={fetchLiveTrackingData} sx={{ ml: 2 }}>
            <LuRefreshCcw color="#247FAD" size={20} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#1E2A3B',
            }}
          >
            Send to Claims?
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #E0E0E0',
              borderRadius: '30px',
              px: 0.5,
              py: 0.5,
              backgroundColor: '#fff',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Box
              onClick={handleYesClick}
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                backgroundColor: isYesSelected ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                color: isYesSelected ? '#2E7D32' : '#666',
                fontWeight: isYesSelected ? 700 : 600,
                fontSize: '0.85rem',
                border: isYesSelected ? '2px solid rgba(76, 175, 80, 0.5)' : '1px solid transparent',
                cursor: loading || isYesSelected ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                mr: 1,
                '&:hover': {
                  backgroundColor: loading || isYesSelected ? undefined : 'rgba(76, 175, 80, 0.25)',
                },
              }}
            >
              Yes
            </Box>

            <Box
              onClick={handleNoClick}
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                backgroundColor: isNoSelected ? 'rgba(244, 67, 54, 0.2)' : 'transparent',
                color: isNoSelected ? '#C62828' : '#666',
                fontWeight: isNoSelected ? 700 : 600,
                fontSize: '0.85rem',
                border: isNoSelected ? '2px solid rgba(244, 67, 54, 0.5)' : '1px solid transparent',
                cursor: loading || isNoSelected || isYesSelected ? 'not-allowed' : 'pointer',
                opacity: loading || isYesSelected ? 0.6 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: loading || isNoSelected || isYesSelected ? undefined : 'rgba(244, 67, 54, 0.25)',
                },
              }}
            >
              No
            </Box>
          </Box>
        </Box>
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
                      {state.uiEventType || 'NA'}
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
                    Trip ID :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {tripId || 'NA'}
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Insured ID :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state.lookup_fleetcompanies?.[0]?.insuredId || 'NA'}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Fleet Name :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state.lookup_fleetcompanies?.[0]?.name || 'NA'}
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
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Driver :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state.lookup_users?.[0]?.firstName && state.lookup_users?.[0]?.lastName
                        ? `${state.lookup_users[0].firstName} ${state.lookup_users[0].lastName}`
                        : 'NA'}
                    </Typography>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                    Phone Number :{' '}
                    <Typography component="span" sx={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                      {state.phoneNo ? `${state.phoneNo}` : 'NA'}
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
                  Speed at the time of event
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

      <SendClaims open={notifyOpen} onClose={() => setNotifyOpen(false)} onConfirm={handleConfirmSendClaims} />
    </>
  );
};

export default FnolDetails;
