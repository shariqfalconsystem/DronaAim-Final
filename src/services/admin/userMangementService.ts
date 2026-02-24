import { post, getToken, get, deleteRequest } from '../apiService';
import environment from '../../environments/environment';

export async function getAdminUser(
  currentUserId: string,
  page: number,
  limit: number,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Construct query parameters for pagination
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Construct the URL with query parameters
  const url = `${environment.baseAPIX}users/userList/US1000`;

  // Send request body as POST data
  return await post(url, requestBody, token);
}

export async function getOrganizations(): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}users/organizations`;

  return await post(url, {}, token);
}

export async function getRoles(persona: string = 'admin'): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}users/roles`;

  return await get(url, token);
}

export async function addUserFromAdmin(currentAdminId: string, data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/admin/${currentAdminId}/insertUser`, data, token);
}

export async function editUserFromAdmin(currentAdminId: string, data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/admin/${currentAdminId}/updateUser`, data, token);
}

export async function resendOnboardingMail(data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/admin/re-onboard`, data, token);
}

export async function deleteUserFromAdmin(currentAdminId: string, userId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPI}lonestar/admin/${currentAdminId}/deleteUser?userId=${userId}`;
  return await deleteRequest(url, token);
}

export async function getOrgTypeMap(): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}users/org-type-map`;

  return await get(url, token);
}

export async function downloadUsers(
  currentLoggedInUserId: string,
  fileType: 'xlsx' | 'csv' | 'pdf' = 'xlsx',
  limit: number = 500,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
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

  const url = `${environment.baseAPI}lonestar/admin/${currentLoggedInUserId}/users/download?${queryParams}`;

  // Prepare request body with required fields
  const requestBodyWithRequired = {
    ...requestBody,
    fileType: mimeType,
  };

  return await post(url, requestBodyWithRequired, token);
}