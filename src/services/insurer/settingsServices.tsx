import { post, getToken,put } from '../apiService';
import environment from '../../environments/environment';

export async function getNotificationSettings(
  personas: string[],
  loggedInUserId: string,
   page: number = 1,
  limit: number = 1000
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const requestBody = {
    personas,
    loggedInUserId,
  };

  return await post(
    `${environment.baseAPI}lonestar/notification-settings?page=${page}&limit=${limit}`,
    requestBody,
    token
  );
}

export async function putNotificationSettings(payload: {
  persona: string;
  loggedInUserId: string;
  messageFormatUid: string;
  customOrgSetting: {
    orgId: string;
    disabled: boolean;
    notifyByEmail: {
      emailId: string;
      disabled: boolean;
    }[];
  };
}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await put(
    `${environment.baseAPI}lonestar/notification-settings`,
    payload,
    token
  );
}