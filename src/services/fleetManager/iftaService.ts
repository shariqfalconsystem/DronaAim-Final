import { deleteRequest, get, getToken, post, put } from '../apiService';
import environment from '../../environments/environment';

export async function getIftaMileageReport(
  lonestarId: string,
  page: number = 1,
  limit: number = 10,
  requestBody: any
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Query params for pagination
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return await post(`${environment.baseAPI}lonestar/${lonestarId}/ifta/mileage?${queryParams}`, requestBody, token);
}

export async function getIftaFuelTrans(
  lonestarId: string,
  page: number = 1,
  limit: number = 10,
  requestBody: any
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Query params for pagination
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return await post(`${environment.baseAPI}lonestar/${lonestarId}/ifta/fuel?${queryParams}`, requestBody, token);
}

export async function downloadIftaFuelTrans(
  lonestarId: string,
  requestBody: any,
  queryString: string = ''
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  if (!requestBody.currentLoggedInUserId) {
    throw new Error('currentLoggedInUserId is required in request body');
  }

  if (!requestBody.fileType) {
    throw new Error('fileType is required in request body');
  }

  const baseUrl = `${environment.baseAPI}lonestar/${lonestarId}/ifta/fuel/download`;
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  return await post(url, requestBody, token);
}

export async function downloadIftaMileageReport(
  lonestarId: string,
  currentLoggedInUserId: string,
  fileType: 'xlsx' | 'csv' | 'pdf' = 'xlsx',
  limit: number = 500,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  if (!currentLoggedInUserId) {
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

  const url = `${environment.baseAPI}lonestar/${lonestarId}/ifta/mileage/download?${queryParams}`;

  // Prepare request body with required fields
  const requestBodyWithRequired = {
    ...requestBody,
    currentLoggedInUserId,
    fileType: mimeType,
  };

  return await post(url, requestBodyWithRequired, token);
}

export async function uploadIftaFile(
  lonestarId: string,
  file: File,
  documentType: string,
  uploadedBy: string
): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
  const mimeType = getMimeType(fileExtension);

  if (!mimeType) throw new Error('Unsupported file type. Only Excel file is allowed.');

  const sizeInMB = calculateDataSizeInMB(file);
  if (sizeInMB > 5) throw new Error('File size should not exceed 5 MB');

  const presignedUrlEndpoint = `${environment.baseAPI}lonestar/${lonestarId}/ifta/fuel/bulk-upload-url`;
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

  const { putUrl, docRef } = data;
  const uploadSuccess = await uploadToS3(file, putUrl, mimeType);

  if (!uploadSuccess) throw new Error('File upload to S3 failed');

  const updateEndpoint = `${environment.baseAPI}lonestar/${lonestarId}/ifta/fuel/bulk-upload-details`;
  const uploadedAtTs = new Date().toISOString();

  return await post(
    updateEndpoint,
    {
      docRef,
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

export async function getIftaTemplateUrl(fileType: string): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const queryParams = new URLSearchParams({ fileType });
  const url = `${environment.baseAPI}lonestar/ifta/fuel/upload-template?${queryParams}`;

  return await get(url, token);
}
