import { get, getToken, post } from '../apiService';
import environment from '../../environments/environment';

export async function getTenant(): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Invalid Token');

  return await get(`${environment.baseAPI}fleetTelematics/tenant`, token);
}

export async function getFleetScore(lonestarId: string, fromDate: number, toDate: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(
    `${environment.scoreAPI}/analytics/v1/scores/tenant/${lonestarId}?toDate=${toDate}&fromDate=${fromDate}`,
    token
  );
}

export async function getFleetEvents(lonestarId: string, fromDate: number, toDate: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(
    `${environment.baseAPI}lonestar/${lonestarId}/incidents/metadata?startTs=${fromDate}&endTs=${toDate}`,
    token
  );
}

export async function getTripsByStatus(
  lonestarId: string,
  page: number,
  limit: number,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const queryParams = new URLSearchParams({
    tripStatus: 'completed',
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/${lonestarId}/tripsByStatus?${queryParams}`;
  return await post(url, requestBody, token);
}

export async function getVehicleStatus(lonestarId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/${lonestarId}/vehiclesStatus`, token);
}

export async function getDriverStatus(lonestarId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/${lonestarId}/driverStatus`, token);
}

export async function getDeviceStatus(lonestarId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/${lonestarId}/devicesStatus`, token);
}
