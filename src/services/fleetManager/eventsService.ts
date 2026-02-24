import { get, getToken, post,put } from '../apiService';
import environment from '../../environments/environment';

export async function getAllEvents(lonestarId: string, page: number, limit: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/${lonestarId}/incidents?page=${page}&limit=${limit}`, {}, token);
}

export async function getEventsList(
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

  const url = `${environment.baseAPI}lonestar/${lonestarId}/incidents?${queryParams}`;

  // Send request body as POST data
  return await post(url, requestBody, token);
}

export async function getFnolList(page: number, limit: number, requestBody: any = {}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Only include page and limit as query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/insurer/incidents?${queryParams}`;

  // Send request body as POST data
  return await post(url, requestBody, token);
}

export async function fnolExport(
  insurerId: string,
  currentLoggedInUserId: string,
  fileType: 'xlsx' | 'csv' | 'pdf' = 'xlsx',
  limit: number = 50000,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  if (!insurerId) {
    throw new Error('currentLoggedInUserId is required');
  }

  // Map file type to MIME type
  const mimeTypeMap = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    pdf: 'application/pdf',
  };

  const mimeType = mimeTypeMap[fileType];
  if (!mimeType) {
    throw new Error('Invalid file type. Supported types: xlsx, csv');
  }

  // Query params for pagination (limit is configurable, default 500)
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/insurer/incidents/download?${queryParams}`;

  // Prepare request body with required fields
  const requestBodyWithRequired = {
    ...requestBody,
    insurerId,
    fileType: mimeType,
    currentLoggedInUserId,
  };

  return await post(url, requestBodyWithRequired, token);
}


export async function getFalsePositiveFnol(requestBody: any = {}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPI}lonestar/insurer/incidents/false-positive`;

  // Send request body as POST data
  return await put(url, requestBody, token);
}