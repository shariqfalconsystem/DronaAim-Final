import { get, getToken } from '../apiService';
import environment from '../../environments/environment';

export async function getVehicleDetails(tripId: any, vin: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(`${environment.baseAPI}lonestar/vehicles/${vin}/trip/${tripId}`, token);
}

export async function getVehicleEvents(vehicleId: string, fromDate: number, toDate: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(
    `${environment.baseAPI}lonestar/vehicles/${vehicleId}/incidents/metadata?startTs=${fromDate}&endTs=${toDate}`,
    token
  );
}
