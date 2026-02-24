import { deleteRequest, get, getToken, post, put } from '../apiService';
import environment from '../../environments/environment';

export async function getDriverList(
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

  const url = `${environment.baseAPIX}super-fleet-manager/lonestar/LS1093/drivers?${queryParams}`;

  return await post(url, requestBody, token);
}

export async function addDriverUser(lonestarId: string, currentUserId: string, data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/fm/${currentUserId}/insertUser`, data, token);
}

export async function editDriverUser(currentUserId: string, data: any): Promise<{ status: number; data: any }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/fm/${currentUserId}/updateUser`, data, token);
}
export async function assignVehicle(
  currentLoggedInUserId: string,
  lonestarId: string,
  vehicleId: string,
  driverId: string
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }
  const requestBody = {
    currentLoggedInUserId,
    lonestarId,
    vehicleId,
    driverId,
  };
  return await post(`${environment.baseAPI}lonestar/assignVechile/driver`, requestBody, token);
}

export async function unassignVehicle(
  currentLoggedInUserId: string,
  lonestarId: string,
  vehicleId: string,
  driverId: string
): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }

  const requestBody = {
    currentLoggedInUserId,
    lonestarId,
    vehicleId,
    driverId,
  };
  return await post(`${environment.baseAPI}lonestar/unassignVechile/driver`, requestBody, token);
}

export async function unlinkedVehicle(lonestarId: string): Promise<{ status: number; data: any }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication failed');
  }

  const requestBody = {
    lonestarId,
  };
  return await post(`${environment.baseAPI}lonestar/fleet/unassignVehicles`, requestBody, token);
}

export async function getDriversTripsList(
  tripStatus: string,
  driverId: string,
  page: number,
  limit: number
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(
    `${environment.baseAPI}lonestar/driver/${driverId}/trips?tripStatus=${tripStatus}&page=${page}&limit=${limit}`,
    token
  );
}

export async function postVehiclesTripsList(
  driverId: string,
  page: number,
  limit: number,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const queryParams = new URLSearchParams({
    tripStatus: 'Completed',
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/driver/${driverId}/trips?${queryParams}`;
  return await post(url, requestBody, token);
}

export async function getDriversLatestTripsList(
  driverId: string,
  requestBody: any = {},
  page: number,
  limit: number
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(
    `${environment.baseAPI}lonestar/driver/${driverId}/trips?page=${page}&limit=${limit}`,
    requestBody,
    token
  );
}

export async function getDriverScore(
  lonestarId: string,
  userId: string,
  fromDate: number,
  toDate: number
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(
    `${environment.scoreAPI}/analytics/v1/scores/driver/${lonestarId}/${userId}?toDate=${toDate}&fromDate=${fromDate}`,
    token
  );
}

export async function getUserById(userId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await get(`${environment.baseAPI}lonestar/user/${userId}`, token);
}

export async function deleteDriver(userId: string, lonestarId: string, currentUserId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await deleteRequest(`${environment.baseAPI}lonestar/fm/${currentUserId}/deleteUser/?userId=${userId}`, token);
}

export async function getDriverEvents(userId: string, fromDate: number, toDate: number, lonestarId: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(
    `${environment.baseAPI}lonestar/driver/${userId}/incidents/metadata?startTs=${fromDate}&endTs=${toDate}&lonestarId=${lonestarId}`,
    token
  );
}

export async function getDriverDocuments(userId: string, lonestarId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPI}lonestar/driver/${lonestarId}/${userId}/documents`, token);
}

export async function attestDriverDocuments(userId: string, data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await post(`${environment.baseAPI}lonestar/driver/${userId}/document/attest`, data, token);
}

export async function uploadDriverFile(
  lonestarId: string,
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

  const presignedUrlEndpoint = `${environment.baseAPI}lonestar/${lonestarId}/driver/bulk-upload-url`;
  const { status, data } = await post(
    presignedUrlEndpoint,
    {
      fileName: file.name,
      contentType: mimeType,
      type: documentType,
    },
    token
  );

  const { putUrl, docRef } = data;
  const uploadSuccess = await uploadToS3(file, putUrl, mimeType);

  if (!uploadSuccess) throw new Error('File upload to S3 failed');

  const updateEndpoint = `${environment.baseAPI}lonestar/${lonestarId}/driver/bulk-upload-details`;
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

export async function getBulkUploadTemplateUrl(fileType: string): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const queryParams = new URLSearchParams({ fileType });
  const url = `${environment.baseAPI}lonestar/driver/bulk-upload-template?${queryParams}`;

  return await get(url, token);
}

export async function uploadDriverDocumentFile(
  driverId: string,
  file: File,
  documentType: string,
  lonestarId: string
): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
  const mimeType = getMimeType(fileExtension);

  if (!mimeType) throw new Error('Unsupported file type. Only Excel and CSV files are allowed.');

  const sizeInMB = calculateDataSizeInMB(file);
  if (sizeInMB > 5) throw new Error('File size should not exceed 5 MB');

  const presignedUrlEndpoint = `${environment.baseAPI}lonestar/driver/${driverId}/document-upload-url`;
  const { status, data } = await post(
    presignedUrlEndpoint,
    {
      fileName: file.name,
      contentType: mimeType,
      type: documentType,
    },
    token
  );

  const { putUrl, docRef } = data;
  const uploadSuccess = await uploadToS3(file, putUrl, mimeType);

  if (!uploadSuccess) throw new Error('File upload to S3 failed');

  const updateEndpoint = `${environment.baseAPI}lonestar/driver/${driverId}/document-details`;
  const uploadedAtTs = new Date().valueOf();

  return await post(
    updateEndpoint,
    {
      docRef,
      fileName: file.name,
      contentType: mimeType,
      fileSizeInKb: calculateDataSizeInKB(file).toString(),
      documentType,
      uploadedAtTs,
      lonestarId: lonestarId,
    },
    token
  );
}

// Profile Photo Upload Functions
export async function uploadProfilePhoto(userId: string, file: File): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
  const mimeType = getMimeType(fileExtension);

  if (!mimeType || !['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
    throw new Error('Unsupported file type. Only JPEG, JPG, and PNG files are allowed.');
  }

  const sizeInMB = calculateDataSizeInMB(file);
  if (sizeInMB > 5) throw new Error('File size should not exceed 5 MB');

  const presignedUrlEndpoint = `${environment.baseAPI}lonestar/user/${userId}/profile-pic-upload-url`;
  const { status, data } = await post(
    presignedUrlEndpoint,
    {
      fileName: file.name,
      contentType: mimeType,
      type: 'profilePic',
    },
    token
  );

  const { putUrl, docRef } = data;
  const uploadSuccess = await uploadToS3(file, putUrl, mimeType);

  if (!uploadSuccess) throw new Error('File upload to S3 failed');

  const updateEndpoint = `${environment.baseAPI}lonestar/user/${userId}/profile-pic-details`;
  const uploadedAtTs = new Date().valueOf();

  return await post(
    updateEndpoint,
    {
      docRef,
      fileName: file.name,
      contentType: mimeType,
      fileSizeInKb: calculateDataSizeInKB(file).toString(),
      documentType: 'profilePic',
      uploadedAtTs,
    },
    token
  );
}

export async function deleteProfilePhoto(userId: string, docRef: string): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  return await deleteRequest(`${environment.baseAPI}lonestar/user/${userId}/profilePicture/${docRef}`, token);
}

export async function updateUserProfileDetails(userId: string, profileDetails: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPI}lonestar/user/${userId}/profileDetails`;

  return await post(url, profileDetails, token);
}

// document center: documents upload for all persona(admin,insurer,fm)

export async function uploadDocuments(
  lonestarId: string,
  file: File,
  documentType: string,
  uploadedBy: string
): Promise<any> {
  const token = await getToken();
  if (!token) throw new Error('Authentication failed');

  const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
  const mimeType = getMimeType(fileExtension);

  if (!mimeType || !['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(mimeType)) {
    throw new Error('Unsupported file type. Only JPEG, JPG, PNG, and PDF files are allowed.');
  }

  const sizeInMB = calculateDataSizeInMB(file);
  if (sizeInMB > 5) throw new Error('File size should not exceed 5 MB');

  const presignedUrlEndpoint = `${environment.baseAPI}lonestar/fleet/${lonestarId}/fleet-documents-upload-url`;
  const { status, data } = await post(
    presignedUrlEndpoint,
    {
      fileName: file.name,
      contentType: mimeType,
      type: 'profilePic',
    },
    token
  );

  const { putUrl, docRef } = data;
  const uploadSuccess = await uploadToS3(file, putUrl, mimeType);

  if (!uploadSuccess) throw new Error('File upload to S3 failed');

  const updateEndpoint = `${environment.baseAPI}lonestar/fleet/${lonestarId}/fleet-documents-details`;
  const uploadedAtTs = new Date().valueOf();

  return await post(
    updateEndpoint,
    {
      docRef,
      fileName: file.name,
      contentType: mimeType,
      fileSizeInKb: calculateDataSizeInKB(file).toString(),
      documentType: 'profilePic',
      uploadedAtTs,
      uploadedBy,
      status: 'Uploaded',
    },
    token
  );
}
