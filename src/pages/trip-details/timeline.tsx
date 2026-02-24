import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { RiAlertLine, RiCheckboxBlankCircleLine, RiPauseCircleLine } from '@remixicon/react';
import { useRef, useState, useMemo } from 'react';
import { MdOutlineSpeed, MdWarning } from 'react-icons/md';
import BrakeIcon from '../../assets/icons/brake.png';
import EndIcon from '../../assets/icons/end-pin.png';
import EstEndIcon from '../../assets/icons/est-end-pin.png';
import EstStartIcon from '../../assets/icons/est-start-pin.png';
import HarshAcclerateIcon from '../../assets/icons/harshAcclerate.png';
import HarshCorneringIcon from '../../assets/icons/harshCornering.png';
import SevereShockIcon from '../../assets/icons/severeShock.png';
import ShockIcon from '../../assets/icons/shock.png';
import SpeedIcon from '../../assets/icons/speed.png';
import StartIcon from '../../assets/icons/start-pin.png';
import SOS from '../../assets/icons/sos.png';
import {
  convertSpeedToMph,
  formatLocalizedDateWithMonth,
  formatUserDateWithMonth,
  getAssociatedLabel,
  splitAddressInTwoLines,
} from '../../utility/utilities';
import EventPopup from './event-popup';
import TripDetailsMap from './trip-details-map';

const TripDetailsTimeline = ({ tripEvents, liveTrackDetails }: any) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  let { startLatitude, startLongitude, endLatitude, endLongitude } = liveTrackDetails;

  const { vehicleLiveTracks, startAddress, endAddress, tripStatus } = liveTrackDetails;

  const isStartLocationEstimated = !startLatitude || !startLongitude;
  const isEndLocationEstimated = !endLatitude || !endLongitude;

  const startLocation = useMemo(() => {
    const lat = isStartLocationEstimated
      ? vehicleLiveTracks?.[vehicleLiveTracks.length - 1]?.latitude
      : startLatitude;
    const lng = isStartLocationEstimated
      ? vehicleLiveTracks?.[vehicleLiveTracks.length - 1]?.longitude
      : startLongitude;
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  }, [isStartLocationEstimated, vehicleLiveTracks, startLatitude, startLongitude]);

  const endLocation = useMemo(() => {
    const lat = isEndLocationEstimated ? vehicleLiveTracks?.[0]?.latitude : endLatitude;
    const lng = isEndLocationEstimated ? vehicleLiveTracks?.[0]?.longitude : endLongitude;
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  }, [isEndLocationEstimated, vehicleLiveTracks, endLatitude, endLongitude]);

  const startTime = liveTrackDetails?.startLocalizedTsInMilliSeconds
    ? formatLocalizedDateWithMonth(
      liveTrackDetails?.startLocalizedTsInMilliSeconds,
      liveTrackDetails?.startTzAbbreviation
    ).dateWithTmz
    : formatUserDateWithMonth(liveTrackDetails?.startDate)?.date;

  const endTime = liveTrackDetails?.endLocalizedTsInMilliSeconds
    ? formatLocalizedDateWithMonth(liveTrackDetails?.endLocalizedTsInMilliSeconds, liveTrackDetails?.endTzAbbreviation)
      .dateWithTmz
    : formatUserDateWithMonth(liveTrackDetails?.endDate)?.date;

  const eventIcons: any = {
    Start: <img src={StartIcon} alt="start" style={{ width: 24, height: 24 }} />,
    End: <img src={EndIcon} alt="end" style={{ width: 24, height: 24 }} />,
    Accelerate: <img src={HarshAcclerateIcon} alt="harshAccelerate" style={{ width: 24, height: 24 }} />,
    Brake: <img src={BrakeIcon} alt="Brake" style={{ width: 24, height: 24 }} />,
    Turn: <img src={HarshCorneringIcon} alt="Turn" style={{ width: 24, height: 24 }} />,
    Speed: <img src={SpeedIcon} alt="Speed" style={{ width: 24, height: 24 }} />,
    Shock: <img src={ShockIcon} alt="Shock" style={{ width: 24, height: 24 }} />,
    SevereShock: <img src={SevereShockIcon} alt="Severe Shock" style={{ width: 24, height: 24 }} />,
    PanicButton: <img src={SOS} alt="PanicButton" style={{ width: 24, height: 24 }} />,
    alert: <RiAlertLine />,
    pause: <RiPauseCircleLine />,
    check: <RiCheckboxBlankCircleLine />,
    estimatedStart: <img src={EstStartIcon} alt="estimated-start" style={{ width: 24, height: 24 }} />,
    estimatedEnd: <img src={EstEndIcon} alt="estimated-end" style={{ width: 24, height: 24 }} />,
  };

  const filteredEvents =
    tripEvents?.allEvents
      ?.filter((event: any) => !['ManualBackup', 'IgnitionOff', 'IgnitionOn'].includes(event.eventType))
      ?.sort((a: any, b: any) => a?.tsInMilliSeconds - b?.tsInMilliSeconds) || [];

  const timelineItems = [
    startLocation && {
      title: 'Start Location',
      location: startLocation,
      address: startAddress,
      time: startTime,
      icon: eventIcons.Start,
      dotColor: 'secondary',
    },
    ...filteredEvents.map((event: any) => ({
      eventId: event?.eventId,
      title: getAssociatedLabel(event.eventType) || 'Event',
      address: event?.address,
      location: {
        lat: event?.gnssInfo?.latitude,
        lng: event?.gnssInfo?.longitude,
      },
      time: event?.localizedTsInMilliSeconds
        ? formatLocalizedDateWithMonth(event?.localizedTsInMilliSeconds, event?.tzAbbreviation).dateWithTmz
        : formatUserDateWithMonth(event?.tsInMilliSeconds)?.date,
      icon: eventIcons[event.eventType] || eventIcons.alert,
      dotColor: 'secondary',
      speed: event?.gnssInfo?.speed,
      isValid: event?.gnssInfo?.isValid,
    })),
    tripStatus === 'Completed' &&
    endLocation && {
      title: 'End Location',
      location: endLocation,
      address: endAddress,
      time: endTime,
      icon: eventIcons.End,
      dotColor: 'secondary',
    },
  ].filter(Boolean);

  const handleEventClick = (event: any, index: any) => {
    setSelectedEvent(selectedEvent && selectedEvent.index === index ? null : { ...event, index, id: event.id });
  };

  console.log('start location: ', startLocation);
  console.log('end location: ', endLocation);
  console.log('filtered events: ', filteredEvents);

  return (
    <Box
      sx={{
        height: 'auto',
        bgcolor: '#fff',
        padding: '20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Trip Details
      </Typography>

      {startLocation && endLocation ? (
        <Box sx={{ position: 'relative', mb: 2 }} ref={mapRef}>
          <TripDetailsMap
            startLocation={startLocation}
            endLocation={endLocation}
            eventLocations={useMemo(
              () =>
                filteredEvents
                  .filter((event: any) => event?.gnssInfo?.latitude && event?.gnssInfo?.longitude)
                  .map((event: any) => ({
                    lat: Number(event?.gnssInfo?.latitude),
                    lng: Number(event?.gnssInfo?.longitude),
                    id: event?.eventId,
                  })),
              [filteredEvents]
            )}
            highlightedLocationIndex={highlightedIndex}
            liveTrackDetails={liveTrackDetails}
            onEventClick={handleEventClick}
          />
          {selectedEvent && (
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <EventPopup
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                filteredEvents={filteredEvents}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Map data not available
        </Typography>
      )}

      <Timeline sx={{ padding: 0, margin: 0 }}>
        {timelineItems.length > 0 ? (
          timelineItems.map((item: any, index: any) => (
            <TimelineItem
              key={index}
              sx={{ minHeight: '80px', '&:before': { display: 'none' }, cursor: 'pointer' }}
              onClick={() => {
                setHighlightedIndex(index);
                if (mapRef.current) {
                  mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <TimelineSeparator>
                <TimelineDot color={item.dotColor} variant="filled" sx={{ boxShadow: 'none' }}>
                  {item.icon}
                </TimelineDot>
                {index !== timelineItems.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Grid container>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="body2" display="flex">
                      {item.title}{' '}
                      {item.title !== 'Start Location' && item.title !== 'End Location' ? `(${item?.eventId})` : ''}
                      {item.title !== 'Start Location' && item.title !== 'End Location' && !item.isValid && (
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                          <Tooltip title="Estimated Address">
                            <span>
                              <MdWarning color="orange" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                            </span>
                          </Tooltip>
                        </Box>
                      )}
                    </Typography>
                    {splitAddressInTwoLines(item?.address).map((line: string, index: number) => (
                      <Typography variant="caption" display="block" key={index}>
                        {line}
                      </Typography>
                    ))}

                    {item.title !== 'Start Location' && item.title !== 'End Location' && item.speed !== null && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 1,
                          bgcolor: '#e9eef5',
                          color: '#2b3a4a',
                          fontWeight: 'bold',
                          padding: '2px',
                          fontSize: '0.7rem',
                          borderRadius: '8px',
                          border: '1px solid #cdd4da',
                          gap: '6px',
                          maxWidth: '100px',
                        }}
                      >
                        <MdOutlineSpeed style={{ fontSize: '1rem', color: '#2b3a4a' }} />
                        {`${convertSpeedToMph(item.speed)} mph`}
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', textWrap: 'nowrap' }}>
                      {item.time}
                    </Typography>
                  </Grid>
                </Grid>
              </TimelineContent>
            </TimelineItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No events available
          </Typography>
        )}
      </Timeline>
    </Box>
  );
};

export default TripDetailsTimeline;
