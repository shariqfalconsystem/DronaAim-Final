import { deleteRequest, get, getToken, post, put } from '../apiService';
import environment from '../../environments/environment';

export async function postVehicleList(requestBody: any = {}, page: number, limit: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Only include page and limit as query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/vehicles?${queryParams}`;

  // Send request body as POST data
  return await post(url, requestBody, token);
}

export async function addVehicleUser(dronaaimId: string, currentUserId: string, data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  console.log('data from api', data);
  return await post(
    `${environment.baseAPI}lonestar/fleet/${dronaaimId}/insertvehicle?currentLoggedInUserId=${currentUserId}`,
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
