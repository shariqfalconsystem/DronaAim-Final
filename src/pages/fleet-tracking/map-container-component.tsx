import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AdvancedMarker, InfoWindow, Map, useMap } from '@vis.gl/react-google-maps';
import boxTruck from '../../assets/img/box-truck.png';
import { CircularProgress, Typography } from '@mui/material';
import StartIcon from '../../assets/icons/start-pin.png';
import EndIcon from '../../assets/icons/end-pin.png';
import {
  formatDateTime,
  formatDateTimeAlpha,
  formatUserDateWithMonth,
  splitAddressInTwoLines,
} from '../../utility/utilities';
type GNSSInfo = {
  latitude: number;
  longitude: number;
};

type LastLiveTrack = {
  gnssInfo: GNSSInfo;
};

type Vehicle = {
  id: string;
  vehicleId: string;
  lastLiveTrack: LastLiveTrack;
  vehicleStatus?: string;
};

type LiveTrack = {
  lastLiveTrack: LastLiveTrack;
};

type MapContainerComponentProps = {
  selectedVehicle: Vehicle | null;
  highlightedVehicle: Vehicle | null;
  onVehicleClick: (vehicle: Vehicle) => void;
  setHighlightedVehicle: (vehicle: Vehicle | null) => void;
  liveTrackingListData: Vehicle[];
  selectedVehicleDetails: any;
  addresses: any;
};

const useDirectionsService = () => {
  const map = useMap();
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (map) {
      const service = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
      });

      setDirectionsService(service);
      setDirectionsRenderer(renderer);
    }
  }, [map]);

  return { directionsService, directionsRenderer };
};

const MapContainerComponent = ({
  selectedVehicle,
  highlightedVehicle,
  onVehicleClick,
  setHighlightedVehicle,
  liveTrackingListData,
  selectedVehicleDetails,
  addresses,
}: any) => {
  const [infoWindowData, setInfoWindowData] = useState<{
    position: google.maps.LatLngLiteral | null;
    content: string | null;
  }>({ position: null, content: null });

  console.log('selected vehicle : ', selectedVehicle);

  const vehicleAddress = useMemo(
    () => addresses[selectedVehicle?.deviceId] || 'Loading address...',
    [addresses, selectedVehicle?.deviceId]
  );

  const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 39.8283,
    lng: -98.5795,
  });
  const [zoom, setZoom] = useState(3);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const { directionsService, directionsRenderer }: any = useDirectionsService();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isDirectionsLoading, setIsDirectionsLoading] = useState(false); // Add a loading state

  const handleInfoWindowClose = useCallback(() => {
    setInfoWindowData({ position: null, content: null });
  }, []);

  useEffect(() => {
    if (highlightedVehicle) {
      setMapCenter({
        lat: highlightedVehicle.lastLiveTrack?.gnssInfo?.latitude,
        lng: highlightedVehicle.lastLiveTrack?.gnssInfo?.longitude,
      });
      setZoom(3);
      setInfoWindowPosition({
        lat: highlightedVehicle.lastLiveTrack?.gnssInfo?.latitude,
        lng: highlightedVehicle.lastLiveTrack?.gnssInfo?.longitude,
      });
      setInfoWindowShown(true);
    }
  }, [highlightedVehicle]);

  const handleVehicleClick = useCallback(
    (vehicle: Vehicle) => {
      onVehicleClick(vehicle);
      setMapCenter({ lat: vehicle.lastLiveTrack?.gnssInfo?.latitude, lng: vehicle.lastLiveTrack?.gnssInfo?.longitude });
      setZoom(5);
      setHighlightedVehicle(null);
    },
    [onVehicleClick, setHighlightedVehicle]
  );

  const handleClose = useCallback(() => {
    setInfoWindowShown(false);
    setInfoWindowPosition(null);
  }, []);

  const handleCameraChange = useCallback((ev: any) => {
    const { center, zoom } = ev.detail;
    setMapCenter(center);
    setZoom(zoom);
  }, []);

  const calculateDirections = useCallback(() => {
    if (selectedVehicleDetails?.vehicleLiveTracks && directionsService && directionsRenderer) {
      const tracks = selectedVehicleDetails?.vehicleLiveTracks;

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

      const reduceWaypoints = (points: LiveTrack[], maxWaypoints: number) => {
        if (points.length <= maxWaypoints) return points;

        const interval = Math.ceil(points.length / maxWaypoints);
        return points.filter((_, index) => index % interval === 0);
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
            setDirections(result);
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
          setTimeout(() => {
            setIsDirectionsLoading(false);
          }, 1000);
        }
      );
    } else {
      directionsRenderer?.setDirections({ routes: [] });
      setDirections(null);
    }
  }, [selectedVehicleDetails, directionsService, directionsRenderer]);

  useEffect(() => {
    if (mapReady) {
      calculateDirections();
    }
  }, [calculateDirections, mapReady]);

  const startMarker = useMemo(() => {
    if (!selectedVehicleDetails?.vehicleLiveTracks) return null;

    const startPoint: any = selectedVehicleDetails?.vehicleLiveTracks?.at(-1);
    if (!startPoint) return null;

    return (
      <AdvancedMarker
        position={{
          lat: startPoint?.latitude,
          lng: startPoint?.longitude,
        }}
      >
        <img
          src={StartIcon}
          width={40}
          height={40}
          alt="Start Location"
          style={{ pointerEvents: 'auto' }}
          onMouseOver={() => {
            setInfoWindowData({
              position: {
                lat: selectedVehicleDetails?.startLatitude || startPoint?.latitude,
                lng: selectedVehicleDetails?.startLongitude || startPoint?.longitude,
              },
              content: `Start Location: ${selectedVehicleDetails?.startAddress || 'NA'}
              <br>Date: ${formatUserDateWithMonth(selectedVehicleDetails?.startDate)?.date}`,
            });
          }}
          onMouseOut={handleInfoWindowClose}
        />
      </AdvancedMarker>
    );
  }, [selectedVehicleDetails, handleInfoWindowClose]);

  const endMarker = useMemo(() => {
    if (!selectedVehicleDetails?.vehicleLiveTracks) return null;

    const endPoint: any = selectedVehicleDetails?.vehicleLiveTracks?.at(0);
    if (!endPoint) return null;

    return (
      <AdvancedMarker
        position={{
          lat: endPoint?.latitude,
          lng: endPoint?.longitude,
        }}
      >
        <img
          src={EndIcon}
          width={40}
          height={40}
          alt="End Location"
          style={{ pointerEvents: 'auto' }}
          onMouseOver={() => {
            setInfoWindowData({
              position: {
                lat: endPoint.latitude,
                lng: endPoint.longitude,
              },
              content: `End Location: ${selectedVehicleDetails?.endAddress || 'NA'}
              <br>Date: ${formatUserDateWithMonth(selectedVehicleDetails?.endDate)?.date}`,
            });
          }}
          onMouseOut={handleInfoWindowClose}
        />
      </AdvancedMarker>
    );
  }, [selectedVehicleDetails, handleInfoWindowClose]);

  const markers = useMemo(
    () =>
      liveTrackingListData?.devices?.map((vehicle: any) => (
        <AdvancedMarker
          key={vehicle.id}
          position={{
            lat: vehicle.lastLiveTrack?.gnssInfo?.latitude,
            lng: vehicle?.lastLiveTrack?.gnssInfo?.longitude,
          }}
          onClick={() => handleVehicleClick(vehicle)}
        >
          <img
            src={boxTruck}
            width={50}
            height={50}
            style={{
              border:
                highlightedVehicle?.deviceId === vehicle.deviceId || selectedVehicle?.deviceId === vehicle.deviceId
                  ? '3px solid #4CAF50'
                  : 'none',
              borderRadius: '50%',
            }}
          />
        </AdvancedMarker>
      )),
    [liveTrackingListData, handleVehicleClick, highlightedVehicle, selectedVehicle]
  );

  return (
    <Map
      center={mapCenter}
      zoom={zoom}
      onCameraChanged={handleCameraChange}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      style={{ width: '100%', height: '100%' }}
      mapId="d4c5cb7dcfc885fe"
      onTilesLoaded={() => setMapReady(true)}
    >
      {selectedVehicle && (
        <AdvancedMarker
          key={selectedVehicle.deviceId}
          clickable={false}
          position={{
            lat: selectedVehicle.lastLiveTrack?.gnssInfo?.latitude,
            lng: selectedVehicle.lastLiveTrack?.gnssInfo?.longitude,
          }}
          onClick={() => handleVehicleClick(selectedVehicle)}
        >
          <img
            src={boxTruck}
            width={50}
            height={50}
            style={{
              border: '3px solid #4CAF50',
              borderRadius: '50%',
            }}
            onMouseOver={() => {
              setInfoWindowData({
                position: {
                  lat: selectedVehicle.lastLiveTrack?.gnssInfo?.latitude,
                  lng: selectedVehicle.lastLiveTrack?.gnssInfo?.longitude,
                },
                content: `Location: ${vehicleAddress}
                <br>Date: ${formatUserDateWithMonth(selectedVehicle?.lastLiveTrack?.tsInMilliSeconds)?.date}`,
              });
            }}
            onMouseOut={handleInfoWindowClose}
          />
        </AdvancedMarker>
      )}
      {startMarker}
      {endMarker}

      {!selectedVehicle && markers}

      {!selectedVehicle && highlightedVehicle && infoWindowPosition && (
        <InfoWindow
          headerDisabled={true}
          style={{
            backgroundColor: '#2c3e50',
            color: '#fff',
            padding: '15px',
          }}
          position={infoWindowPosition}
          onClose={handleClose}
          pixelOffset={[0, -45]}
        >
          <Typography variant="h6">{highlightedVehicle?.lookup_vehicles[0]?.vehicleId}</Typography>
        </InfoWindow>
      )}

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

      {isDirectionsLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <CircularProgress color="primary" size={60} />
            <Typography variant="h6" style={{ marginTop: '16px' }}>
              Calculating Route...
            </Typography>
          </div>
        </div>
      )}
    </Map>
  );
};

export default React.memo(MapContainerComponent);
