import { get, getToken, post } from '../apiService';
import environment from '../../environments/environment';

export async function getTrips(lonestarId: string, page: number, limit: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(
    `${environment.baseAPI}lonestar/${lonestarId}/trips?page=${page}&limit=${limit}`,
    { tripId: 'T' },
    token
  );
}

export async function getFleetTrips(
  lonestarId: string,
  page: number,
  limit: number,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Only include page and limit as query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/${lonestarId}/trips?${queryParams}`;

  // Send request body as POST data
  return await post(url, requestBody, token);
}

export async function getTripsEvents(tripId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(`${environment.baseAPI}lonestar/trip/${tripId}/incidents?page=1&limit=10000`, token);
}
