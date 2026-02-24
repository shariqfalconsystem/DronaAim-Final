import { deleteRequest, get, getToken, post, put } from '../apiService';
import environment from '../../environments/environment';

export async function getVehiclesPerTenant(lonestarId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(`${environment.baseAPI}fleetTelematics/tenant/${lonestarId}`, token);
}

export async function getVehiclesList(
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
    page: page.toString(),
    limit: limit.toString(),
  });

  return await post(`${environment.baseAPIX}vehicle/vehicleList/LS1093`, requestBody, token);
}

export async function getVehicleStats(vehicleId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/vehicles/${vehicleId}/stats`, token);
}

export async function postVehicleDeviceStats(payload: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(`${environment.baseAPI}lonestar/vehicles/trips/stats`, payload, token);
}

export async function getVehicleDetails(vehicleId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/vehicles/${vehicleId}`, token);
}

export async function getVehiclesTripsList(
  tripStatus: string,
  vehicleId: string,
  page: number,
  limit: number
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(
    `${environment.baseAPI}lonestar/vehicles/${vehicleId}/trips?tripStatus=${tripStatus}&page=${page}&limit=${limit}`,
    token
  );
}

export async function postVehiclesTripsList(
  vehicleId: string,
  page: number,
  limit: number,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const queryParams = new URLSearchParams({
    tripStatus: 'Completed',
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/vehicles/${vehicleId}/trips?${queryParams}`;
  return await post(url, requestBody, token);
}

export async function getVehicleScore(vehicleId: string, fromDate: number, toDate: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(
    `${environment.scoreAPI}/analytics/v1/scores/vehicle/${vehicleId}?toDate=${toDate}&fromDate=${fromDate}`,
    token
  );
}

export async function postVehicleList(
  lonestarId: string,
  page: number,
  limit: number,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}vehicle/vehicleList/LS1093`;
  return await post(url, requestBody, token);
}

export async function getUnassignedVehicles(
  lonestarId: string,
  requestBody: any = {}
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPIX}vehicle/unassignedVehicles`, requestBody, token);
}

export async function addVehicleUser(lonestarId: string, currentUserId: string, data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  console.log('data from api', data);
  return await post(
    `${environment.baseAPI}lonestar/fleet/${lonestarId}/insertvehicle?currentLoggedInUserId=${currentUserId}`,
    data,
    token
  );
}

export async function getUnlinkedIMEIs(lonestarId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(`${environment.baseAPI}lonestar/${lonestarId}/unlinkedimei`, token);
}

export async function editVehicleUser(
  lonestarId: string,
  vehicleId: string,
  currentUserId: string,
  data: any
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(
    `${environment.baseAPI}lonestar/fleet/${lonestarId}/editVehicle/${vehicleId}?currentLoggedInUserId=${currentUserId}`,
    data,
    token
  );
}

export async function delinkImei(
  lonestarId: string,
  vehicleId: string,
  currentUserId: string,
  imei: string
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }

  const requestBody = {
    lonestarId,
    vehicleId,
    imei,
    currentLoggedInUserId: currentUserId,
  };
  return await post(`${environment.baseAPI}lonestar/fleet/delink/vehicle`, requestBody, token);
}

export async function linkImei(
  lonestarId: string,
  vehicleId: string,
  currentUserId: string,
  imei: string
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }
  const requestBody = {
    lonestarId,
    vehicleId,
    imei,
    currentLoggedInUserId: currentUserId,
  };
  return await post(`${environment.baseAPI}lonestar/fleet/link/vehicle`, requestBody, token);
}

export async function deleteVehicle(vehicleId: string, lonestarId: string, currentUserId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await deleteRequest(
    `${environment.baseAPI}lonestar/fleet/${lonestarId}/deleteVehicle/${vehicleId}?currentLoggedInUserId=${currentUserId}`,
    token
  );
}
