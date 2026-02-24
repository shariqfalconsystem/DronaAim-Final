import { get, getToken, postWithHeaders } from '../apiService';
import environment from '../../environments/environment';

export async function getLiveTrackingList(
  lonestarId: string,
  page: number = 1,
  limit: number = 10,
  vehicleStatuses?: string[],
  vehicleId?: string
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const payload: any = {};

  if (vehicleStatuses && vehicleStatuses.length > 0) {
    payload.vehicleStatuses = vehicleStatuses;
  }

  if (vehicleId && vehicleId.trim()) {
    payload.vehicleId = vehicleId.trim();
  }

  return await postWithHeaders(
    `${environment.baseAPI}lonestar/${lonestarId}/vehicles/livetrack?${queryParams}`,
    payload,
    token,
    headers
  );
}

export async function getLiveTrackingByDeviceId(deviceId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(`${environment.baseAPI}lonestar/devices/${deviceId}/trip/livetrack`, token);
}

export async function getLiveTrackingByTripId(tripId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(`${environment.baseAPI}lonestar/vehicles/trip/${tripId}/livetrack`, token);
}
