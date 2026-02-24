import { useState, useEffect, useMemo, useCallback } from 'react';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { CircularProgress, Typography } from '@mui/material';
import EventIcon from '../../../assets/icons/location-pin.png';
import StartIcon from '../../../assets/icons/start-pin.png';
import EndIcon from '../../../assets/icons/end-pin.png';
import { formatUserDateWithMonth } from '../../../utility/utilities';

const useDirectionsService = () => {
  const map = useMap();
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (map) {
      const service = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // Suppress default markers
      });

      setDirectionsService(service);
      setDirectionsRenderer(renderer);
    }
  }, [map]);

  return { directionsService, directionsRenderer };
};

const EventsMapComponent = ({
  eventLocation,
  liveTrackDetails,
  startAddress,
  endAddress,
  eventAddress,
  eventDate,
}: any) => {
  const [mapCenter, setMapCenter] = useState(new google.maps.LatLng(eventLocation.lat, eventLocation.lng));
  const [zoom, setZoom] = useState(10);
  const [infoWindowPosition, setInfoWindowPosition] = useState<any>(null);
  const [infoWindowContent, setInfoWindowContent] = useState<any>(null);

  const [infoWindowData, setInfoWindowData] = useState<{
    position: google.maps.LatLngLiteral | null;
    content: string | null;
  }>({ position: null, content: null });

  const handleInfoWindowClose = useCallback(() => {
    setInfoWindowData({ position: null, content: null });
  }, []);

  const [isDirectionsLoading, setIsDirectionsLoading] = useState<any>(false);

  const { directionsService, directionsRenderer }: any = useDirectionsService();

  const handleCameraChange = useCallback((event: any) => {
    const { center, zoom } = event.detail;
    setMapCenter(center);
    setZoom(zoom);
  }, []);

  const calculateDirections = useCallback(() => {
    if (liveTrackDetails?.vehicleLiveTracks && directionsService && directionsRenderer) {
      const tracks = liveTrackDetails.vehicleLiveTracks;

      if (tracks.length < 2) {
        console.error('Not enough tracking points to create a route');
        return;
      }

      setIsDirectionsLoading(true);

      const origin = new google.maps.LatLng(tracks[tracks.length - 1].latitude, tracks[tracks.length - 1].longitude);
      const destination = new google.maps.LatLng(tracks[0].latitude, tracks[0].longitude);

      // Helper function to calculate distance between two points in meters
      const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      const reduceWaypoints = (points: any, maxWaypoints: number) => {
        if (points.length <= maxWaypoints) return points;

        const interval = Math.ceil(points.length / maxWaypoints);
        return points.filter((_: any, index: number) => index % interval === 0);
      };

      const reducedTracks = reduceWaypoints(tracks.slice(1, -1), 25);

      // Filter out waypoints that are too close to origin or destination
      const MIN_DISTANCE = 50; // Minimum 50 meters
      const filteredTracks = reducedTracks.filter((track: any) => {
        const distToOrigin = getDistance(
          track.latitude,
          track.longitude,
          tracks[tracks.length - 1].latitude,
          tracks[tracks.length - 1].longitude
        );
        const distToDestination = getDistance(track.latitude, track.longitude, tracks[0].latitude, tracks[0].longitude);
        return distToOrigin >= MIN_DISTANCE && distToDestination >= MIN_DISTANCE;
      });

      const waypoints = filteredTracks
        .map((track: any) => ({
          location: new google.maps.LatLng(track.latitude, track.longitude),
          stopover: false,
        }))
        .reverse();

      directionsRenderer?.setDirections({ routes: [] }); // Clear previous routes

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer?.setDirections(result);
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
          setIsDirectionsLoading(false);
        }
      );
    } else {
      directionsRenderer?.setDirections({ routes: [] });
    }
  }, [liveTrackDetails, directionsService, directionsRenderer]);

  const handleMarkerClick = useCallback((position: google.maps.LatLng, content: string) => {
    setInfoWindowPosition(position);
    setInfoWindowContent(content);
  }, []);

  const eventMarker = useMemo(
    () => (
      <AdvancedMarker position={new google.maps.LatLng(eventLocation.lat, eventLocation.lng)}>
        <img
          src={EventIcon}
          width={50}
          height={50}
          style={{
            pointerEvents: 'auto',
            borderRadius: '50%',
          }}
          onMouseOver={() => {
            setInfoWindowData({
              position: {
                lat: eventLocation.lat,
                lng: eventLocation.lng,
              },
              content: `Location: ${eventAddress}
                          <br>Date: ${eventDate}`,
            });
          }}
          onMouseOut={handleInfoWindowClose}
        />
      </AdvancedMarker>
    ),
    [eventLocation, handleInfoWindowClose]
  );

  const startMarker = useMemo(
    () =>
      liveTrackDetails?.vehicleLiveTracks ? (
        <AdvancedMarker
          position={
            new google.maps.LatLng(
              liveTrackDetails?.vehicleLiveTracks[liveTrackDetails.vehicleLiveTracks.length - 1]?.latitude || 0,
              liveTrackDetails?.vehicleLiveTracks[liveTrackDetails.vehicleLiveTracks.length - 1]?.longitude || 0
            )
          }
        >
          <img
            src={StartIcon}
            width={40}
            height={40}
            alt="Start Location"
            style={{
              pointerEvents: 'auto',
              borderRadius: '50%',
            }}
            onMouseOver={() => {
              setInfoWindowData({
                position: {
                  lat:
                    liveTrackDetails?.vehicleLiveTracks[liveTrackDetails.vehicleLiveTracks.length - 1]?.latitude || 0,
                  lng:
                    liveTrackDetails?.vehicleLiveTracks[liveTrackDetails.vehicleLiveTracks.length - 1]?.longitude || 0,
                },
                content: `Location: ${startAddress}
                          <br>Date: ${formatUserDateWithMonth(liveTrackDetails?.startDate)?.date}`,
              });
            }}
            onMouseOut={handleInfoWindowClose}
          />
        </AdvancedMarker>
      ) : null,
    [liveTrackDetails]
  );

  const endMarker = useMemo(
    () =>
      liveTrackDetails?.vehicleLiveTracks ? (
        <AdvancedMarker
          position={
            new google.maps.LatLng(
              liveTrackDetails?.vehicleLiveTracks[0]?.latitude || 0,
              liveTrackDetails?.vehicleLiveTracks[0]?.longitude || 0
            )
          }
        >
          <img
            src={EndIcon}
            width={40}
            height={40}
            alt="End Location"
            style={{
              pointerEvents: 'auto',
              borderRadius: '50%',
            }}
            onMouseOver={() => {
              setInfoWindowData({
                position: {
                  lat: liveTrackDetails?.vehicleLiveTracks[0]?.latitude || 0,
                  lng: liveTrackDetails?.vehicleLiveTracks[0]?.longitude || 0,
                },
                content: `Location: ${endAddress}
                          <br>Date: ${formatUserDateWithMonth(liveTrackDetails?.endDate)?.date}`,
              });
            }}
            onMouseOut={handleInfoWindowClose}
          />
        </AdvancedMarker>
      ) : null,
    [liveTrackDetails]
  );

  useEffect(() => {
    calculateDirections();
  }, [calculateDirections]);

  return (
    <Map
      center={mapCenter}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      gestureHandling="greedy"
      onCameraChanged={handleCameraChange}
      mapId="d4c5cb7dcfc885fe"
    >
      {eventMarker}
      {startMarker}
      {endMarker}

      {infoWindowData.position && infoWindowData.content && (
        <InfoWindow
          position={infoWindowData.position}
          onClose={handleInfoWindowClose}
          pixelOffset={[0, -45]}
          headerDisabled={true}
          style={{
            backgroundColor: '#2c3e50',
            color: '#fff',
            padding: '15px',
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: infoWindowData.content }} />
        </InfoWindow>
      )}

      {infoWindowPosition && (
        <InfoWindow
          position={infoWindowPosition}
          onCloseClick={() => setInfoWindowPosition(null)}
          headerDisabled={true}
          style={{
            backgroundColor: '#2c3e50',
            color: '#fff',
            padding: '15px',
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: infoWindowContent }} />
        </InfoWindow>
      )}

      {isDirectionsLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
          <Typography variant="body1" style={{ marginLeft: '10px' }}>
            Loading route...
          </Typography>
        </div>
      )}
    </Map>
  );
};

export default EventsMapComponent;
