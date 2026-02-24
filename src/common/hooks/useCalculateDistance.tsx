import { useState, useCallback } from 'react';

export const useCalculateDistance = () => {
  const [distance, setDistance] = useState<string>('Calculating...');
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = useCallback(
    (startCoords: { latitude: number; longitude: number }, endCoords: { latitude: number; longitude: number }) => {
      if (startCoords && endCoords) {
        const origin = new google.maps.LatLng(startCoords.latitude, startCoords.longitude);
        const destination = new google.maps.LatLng(endCoords.latitude, endCoords.longitude);

        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (response: any, status: any) => {
            if (status === google.maps.DistanceMatrixStatus.OK) {
              const result = response?.rows[0]?.elements[0];
              if (result && result.distance && result.distance.value) {
                const distanceInMiles = (result.distance.value * 0.000621371).toFixed(2);
                setDistance(`${distanceInMiles} miles`);
              } else {
                setDistance('NA');
                console.error('Distance result or value is missing.');
              }
            } else {
              setDistance('NA');
              setError(`Error fetching distance: ${status}`);
              console.error(`Error fetching distance: ${status}`);
            }
          }
        );
      } else {
        setDistance('NA');
        setError('Invalid coordinates provided');
      }
    },
    []
  );

  return { distance, error, calculateDistance };
};
