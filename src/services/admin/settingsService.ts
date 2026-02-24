import environment from '../../environments/environment';
import { getToken, post } from '../apiService';

export async function getScoringWeightages(
  currentLoggedInUserId: string,
  fromDate?: number,
  toDate?: number
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }
  const requestBody: any = {
    currentLoggedInUserId,
  };

  if (typeof fromDate === 'number') {
    requestBody.fromDate = fromDate;
  }

  if (typeof toDate === 'number') {
    requestBody.toDate = toDate;
  }

  return await post(`${environment.baseAPIX}settings/admin/scoringWeightages`, requestBody, token);
}

export async function addScoringWeightage(requestBody: any): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/admin/addScoringWeightage`, requestBody, token);
}
