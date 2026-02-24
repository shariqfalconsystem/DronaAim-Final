import { post, put, get, getToken, deleteRequestWithBody } from '../apiService';
import environment from '../../environments/environment';

export async function getIDeviceList(
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
  return await post(`${environment.baseAPIX}devices/insurer/INS1000`, requestBody, token);
}

export async function addDevice(
  currentLoggedInUserId: string,
  imei: string,
  deviceProvider: string,
  fleetId: string,
  fleetName: string,
  insuredId: string,
  shippingProviderName: string,
  trackingNumber: string,
  shipmentDate: string,
  insurerId: string
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
    shippingProviderName: shippingProviderName || null,
    trackingNumber: trackingNumber || null,
    shipmentDate: shipmentDate || null,
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

export async function getUnassignedDevices(page: number = 1, limit: number = 10, requestBody: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Query params for pagination
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return await post(`${environment.baseAPIX}devices/unassignedDevices`, requestBody, token);
}

export async function delinkDevice(
  fleetId: string,
  deviceId: string,
  currentUserId: string,
  insurerId: string
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
  return await post(`${environment.baseAPI}lonestar/fleet/delink/device`, requestBody, token);
}

export async function linkDevice(
  fleetId: string,
  deviceId: string,
  currentUserId: string,
  insurerId: string
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
}): Promise<{ status: number; data: any }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await deleteRequestWithBody(`${environment.baseAPI}lonestar/devices/deleteDevice`, deviceData, token);
}

export async function getShippingProviders(): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}devices/shipping-providers`;

  return await get(url, token);
}

export async function getVideoHistory(page: number, limit: number, requestBody: any = {}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return await post(`${environment.baseAPI}lonestar/devices/video-history?${queryParams}`, requestBody, token);
}

export async function postVideoRequest(requestBody: any = {}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/devices/video-request`, requestBody, token);
}

export async function getVideoSubRequests(requestId: any = {}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/devices/video-history-sub/${requestId}`, {}, token);
}

export async function notifyDevice(requestBody: any = {}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPI}lonestar/fleet/notification/publish`;

  return await put(url, requestBody, token);
}

// bulk upload of devices

export async function getBulkUploadTemplateUrl(fileType: string): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const queryParams = new URLSearchParams({ fileType });
  const url = `${environment.baseAPI}lonestar/devices/bulk-upload-template?${queryParams}`;

  return await get(url, token);
}
export async function getUninsuredBulkUploadTemplateUrl(fileType: string): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const queryParams = new URLSearchParams({ fileType });
  const url = `${environment.baseAPI}lonestar/devices/uninsured-bulk-upload-template?${queryParams}`;

  return await get(url, token);
}

export async function uploadDeviceFile(
  insurerId: string,
  file: File,
  documentType: string,
  uploadedBy: string
): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
  const mimeType = getMimeType(fileExtension);

  if (!mimeType) throw new Error('Unsupported file type. Only Excel and CSV files are allowed.');

  const sizeInMB = calculateDataSizeInMB(file);
  if (sizeInMB > 5) throw new Error('File size should not exceed 5 MB');

  const presignedUrlEndpoint = `${environment.baseAPI}lonestar/${insurerId}/devices/bulk-upload-url`;
  const { status, data } = await post(
    presignedUrlEndpoint,
    {
      fileName: file.name,
      contentType: mimeType,
      type: documentType,
      currentLoggedInUserId: uploadedBy,
    },
    token
  );

  const { putUrlToBucket, documentReference } = data;
  const uploadSuccess = await uploadToS3(file, putUrlToBucket, mimeType);

  if (!uploadSuccess) throw new Error('File upload to S3 failed');

  const updateEndpoint = `${environment.baseAPI}lonestar/${insurerId}/devices/bulk-upload-details`;
  const uploadedAtTs = new Date().toISOString();

  return await post(
    updateEndpoint,
    {
      docRef: documentReference,
      fileName: file.name,
      contentType: mimeType,
      fileSizeInKb: calculateDataSizeInKB(file).toString(),
      documentType,
      uploadedAtTs,
      uploadedBy,
    },
    token
  );
}

function getMimeType(fileExtension: string | undefined): string | null {
  const mimeTypes: { [key: string]: string } = {
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    png: 'image/png',
    jpeg: 'image/jpeg',
    jpg: 'image/jpg',
    pdf: 'application/pdf',
  };
  return fileExtension ? mimeTypes[fileExtension] || null : null;
}

async function uploadToS3(file: File, presignedURL: string, mimeType: string): Promise<boolean> {
  try {
    const fileData = await file.arrayBuffer();

    const response = await fetch(presignedURL, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
      },
      body: fileData,
    });

    if (!response.ok) {
      console.error(
        `S3 upload failed:\nURL: ${presignedURL}\nStatus: ${response.status}\nResponse:`,
        await response.text()
      );
      throw new Error(`S3 upload failed with status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error during S3 upload:', error);
    return false;
  }
}

function calculateDataSizeInKB(file: File): number {
  return file.size / 1024;
}

function calculateDataSizeInMB(file: File): number {
  return file.size / (1024 * 1024);
}
