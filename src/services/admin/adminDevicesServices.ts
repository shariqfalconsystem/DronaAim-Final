
import { get, getToken, post, deleteRequestWithBody } from '../apiService';
import environment from '../../environments/environment';

export async function getDevicesDetailsAdmin(postData: any, page: any, limit: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(`${environment.baseAPIX}devices/devices`, postData, token);
}

export async function addDevice(
  currentLoggedInUserId: string,
  imei: string,
  deviceProvider: string,
  fleetId: string,
  fleetName: string,
  insuredId: string,
  insurerId: string,
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const requestBody = {
    currentLoggedInUserId,
    imei,
    deviceProvider,
    fleetId,
    fleetName,
    insuredId,
    insurerId,
  };

  try {
    const response = await post(`${environment.baseAPI}lonestar/devices/addDevice`, requestBody, token);

    return response;
  } catch (error) {
    console.error('Error in addDevice function:', error);
    throw error;
  }
}

export async function delinkDevice(
  fleetId: string,
  deviceId: string,
  currentUserId: string,
  insurerId: string,
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }

  const requestBody = {
    fleetId,
    deviceId,
    currentLoggedInUserId: currentUserId,
    insurerId
  };
  return await post(`${environment.baseAPI}lonestar/fleet/delink/device`, requestBody, token);
}

export async function linkDevice(
  fleetId: string,
  deviceId: string,
  currentUserId: string,
  insurerId: string,
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }

  const requestBody = {
    fleetId,
    deviceId,
    currentLoggedInUserId: currentUserId,
    insurerId,
  };
  return await post(`${environment.baseAPI}lonestar/fleet/link/device`, requestBody, token);
}

export async function deleteDevice(deviceData: {
  deviceId: string;
  fleetId: string;
  currentLoggedInUserId: string;
  insurerId: string;
}): Promise<{ status: number; data: any }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await deleteRequestWithBody(`${environment.baseAPI}lonestar/devices/deleteDevice`, deviceData, token);
}
