import { get, getToken, post, deleteRequestWithBody } from '../apiService';
import environment from '../../environments/environment';

export async function getFleetDetailsAdmin(postData: any, page: any, limit: any): Promise<any> {
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
  initials: string;
  firstName: string;
  lastName: string;
  emailId: string;
  phone: string;
  phoneCtryCd: string;
  isPrimary: boolean;
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

export async function deleteFleetAdmin(fleetData: {
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

/**
 * Get all contracts for a specific lonestarId.
 * @param postData - The data to be sent in the request body.
 * @returns A promise that resolves with the list of contracts.
 */
export async function getContractsByLonestarId(postData: {
  lonestarId: string;
  currentLoggedInUserId: string;
}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(`${environment.baseAPI}lonestar/fleet/contracts`, postData, token);
}

/**
 * Get all invoices for a specific lonestarId.
 * @param postData - The data to be sent in the request body including search parameters.
 * @param page - The page number for pagination (optional, default: 1).
 * @param limit - The number of items per page (optional, default: 10).
 * @returns A promise that resolves with the list of invoices.
 */
export async function getInvoicesByLonestarId(postData: any, page?: number, limit?: number): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Build query parameters for pagination
  let url = `${environment.baseAPI}lonestar/fleet/invoices`;
  const queryParams = new URLSearchParams();

  if (page) {
    queryParams.append('page', page.toString());
  }
  if (limit) {
    queryParams.append('limit', limit.toString());
  }

  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  return await post(url, postData, token);
}

/**
 * Get all Zoho subscriptions for a specific lonestarId.
 * @param postData - The data to be sent in the request body including search/filter params.
 * @param queryParams - Optional pagination parameters (page, limit).
 * @returns A promise that resolves with the list of subscriptions.
 */
export async function getZohoSubscriptionsByLonestarId(
  postData: {
    lonestarId: string;
    currentLoggedInUserId: string;
    // Optional search/filter fields
    subscriptionId?: string;
    subscriptionNumber?: string;
    planName?: string;
    name?: string;
    activatedAtUtc?: string;
    expiresAtUtc?: string;
    status?: string;
    referenceId?: string;
    amount?: string;
    // Optional sorting parameters
    sortKey?: string;
    sortOrder?: 'ASC' | 'DESC';
  },
  queryParams?: {
    page?: number;
    limit?: number;
  }
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Build query string for pagination
  let url = `${environment.baseAPI}lonestar/fleet/zoho-subscriptions`;
  if (queryParams) {
    const params = new URLSearchParams();
    if (queryParams.page) params.append('page', queryParams.page.toString());
    if (queryParams.limit) params.append('limit', queryParams.limit.toString());

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return await post(url, postData, token);
}

/**
 * Download a contract document by Zoho Sign Document ID.
 * @param postData - The data containing lonestarId, currentLoggedInUserId, and zohosignZohoSignDocumentId.
 * @returns A promise that resolves with the PDF document as a blob.
 */
export async function downloadContractDocument(postData: {
  lonestarId: string;
  currentLoggedInUserId: string;
  zohosignZohoSignDocumentId: string;
}): Promise<Blob> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }

  const response = await fetch(`${environment.baseAPI}lonestar/fleet/contracts/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error(`Failed to download contract: ${response.statusText}`);
  }

  // Parse the JSON response
  const jsonResponse = await response.json();

  console.log('response : ', jsonResponse);

  // Check if response contains base64 encoded body
  if (!jsonResponse?.body || !jsonResponse?.base64Encoded) {
    throw new Error('Invalid response format: Expected base64 encoded body');
  }

  // Extract filename from Content-Disposition header in the response
  let filename = 'contract.pdf';
  if (jsonResponse.headers?.['Content-Disposition']) {
    const contentDisposition = jsonResponse.headers['Content-Disposition'];
    const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)|filename="?([^"]+)"?/);
    if (filenameMatch) {
      filename = decodeURIComponent(filenameMatch[1] || filenameMatch[2]);
    }
  }

  // Decode base64 string to binary
  const base64Data = jsonResponse.body;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create blob from binary data
  const blob = new Blob([bytes], { type: 'application/pdf' });

  // Attach filename to the blob for later use
  (blob as any).filename = filename;

  return blob;
}

/**
 * Sync fleet data from Zoho for a specific lonestarId.
 * This is a fire-and-forget API that triggers a background sync process.
 * @param postData - The data containing lonestarId and currentLoggedInUserId.
 * @returns A promise that resolves with a success message.
 */
export async function syncFleetFromZoho(postData: {
  lonestarId: string;
  currentLoggedInUserId: string;
}): Promise<{ status: number; data: string }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  if (!postData.lonestarId) {
    throw new Error('lonestarId not provided.');
  }

  if (!postData.currentLoggedInUserId) {
    throw new Error('currentLoggedInUserId not provided.');
  }

  return await post(`${environment.baseAPI}lonestar/fleet/zoho/sync`, postData, token);
}
