import { get, getToken, post } from '../apiService';
import environment from '../../environments/environment';

export async function getAllNotifications(lonestarId: string, page: number = 1, limit: number = 20): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  if (lonestarId) {
    return await get(
      `${environment.baseAPI}lonestar/fleet/notification?lonestarId=${lonestarId}&page=${page}&limit=${limit}`,
      token
    );
  }
}

export async function getAllNotificationsPost(
  lonestarId: string,
  page: number = 1,
  limit: number = 20,
  filters?: { isActioned?: boolean; isRead?: boolean },
  currentLoggedInUserId?: string,
  currentLoggedInUserRole?: string,
  uiPersona?: string
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  if (lonestarId) {
    const requestBody: any = {};

    if (filters) {
      Object.assign(requestBody, filters);
    }

    if (currentLoggedInUserId) {
      requestBody.currentLoggedInUserId = currentLoggedInUserId;
    }

    if (currentLoggedInUserRole) {
      requestBody.currentLoggedInUserRole = currentLoggedInUserRole;
    }
    if (uiPersona) {
      requestBody.uiPersona = uiPersona;
    }

    return await post(
      `${environment.baseAPI}lonestar/fleet/notification?lonestarId=${lonestarId}&page=${page}&limit=${limit}`,
      requestBody,
      token
    );
  }
}

export async function markNotificationAsRead(data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/fleet/notification/read`, data, token);
}

export async function markNotificationAsUnread(data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/fleet/notification/unread`, data, token);
}
