import { get, getToken, post, deleteRequestWithBody } from '../apiService';
import environment from '../../environments/environment';

export async function getFleetStats(insurerId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/fleet/stats?insurerId=${insurerId}`, token);
}

export async function getFleetDetails(postData: any, page: any, limit: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(`${environment.baseAPIX}fleet/details`, postData, token);
}

export async function addFleetUser(fleetData: {
  insurerId: string;
  dotNumber: string;
  fleetName: string;
  garageAddress: string;
  mailingAddress: string;
  currentLoggedInUserId: string;
}): Promise<{ status: number; data: any }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/fleet/addfleet`, fleetData, token);
}

export async function editFleet(fleetData: {
  insurerId: string;
  dotNumber: string;
  fleetId: string;
  fleetName: string;
  garageAddress: string;
  mailingAddress: string;
  currentLoggedInUserId: string;
}): Promise<{ status: number; data: any }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/fleet/editfleet`, fleetData, token);
}

export async function deleteFleet(fleetData: {
  insurerId: string;
  fleetId: string;
  currentLoggedInUserId: string;
}): Promise<{ status: number; data: any }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await deleteRequestWithBody(`${environment.baseAPI}lonestar/fleet/deletefleet`, fleetData, token);
}

export async function getDriverOverview(postData: any, page: any, limit: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(
    `${environment.baseAPI}lonestar/fleet/driver-overview?page=${page}&limit=${limit}`,
    postData,
    token
  );
}

export async function getVehicleOverview(postData: any, page: any, limit: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(
    `${environment.baseAPI}lonestar/fleet/vehicle-overview?page=${page}&limit=${limit}`,
    postData,
    token
  );
}

export async function getFleetDetailsByLonestarId(lonestarId: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/fleet/${lonestarId}/details`, token);
}

export async function getFleetEventsOverview(data: any, page: any, limit: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(`${environment.baseAPI}lonestar/fleet/events-overview?page=${page}&limit=${limit}`, data, token);
}

export async function getFleetStatsByLonestarId(lonestarId: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/fleet/${lonestarId}/stats`, token);
}
