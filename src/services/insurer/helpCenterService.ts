import { get, getToken, post } from '../apiService';
import environment from '../../environments/environment';

export async function getAllTopicsList(): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}settings/admin/helpcenter/topics`;

  return await get(url, token);
}

export async function getAllPublished(userId: string, requestBody: { searchText?: string } = {}, page: number = 1,
  limit: number = 10): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPIX}super-fleet-manager/helpcenter/publish?${queryParams}`;
  const customHeaders = {
    userId,
    'Content-Type': 'application/json',
  };
  return await post(url, requestBody, token, customHeaders);
}


export async function getPublishedById(userId: string, publishedId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  const customHeaders = {
    userId,
    'Content-Type': 'application/json',
  };

  const url = `${environment.baseAPICMS}lonestar/helpcenter/published/${publishedId}`;

  return await get(url, token, customHeaders);
}
