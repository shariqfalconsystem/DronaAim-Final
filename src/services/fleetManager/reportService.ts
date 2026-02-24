import { get, getToken, post } from '../apiService';
import environment from '../../environments/environment';
import axios from 'axios';

export async function getReportToken(userId: string, groupId: any, reportId: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.scoreAPI}/users/v2/${userId}/powerbi/token/${groupId}/${reportId}`, token);
}

export async function getReportTokenV3(
  userId: string,
  currentUserRole: any,
  insurerId: any,
  lonestarId: any,
  groupId: any,
  reportId: any
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const safeInsurerId = insurerId || 'na';
  const safeLonestarId = lonestarId || 'na';

  return await get(
    `${environment.scoreAPI}/users/v3/${userId}/${currentUserRole}/${safeInsurerId}/${safeLonestarId}/powerbi/token/${groupId}/${reportId}`,
    token
  );
}

export async function getPowerBIReports(userId: string, groupId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.scoreAPI}/users/v2/${userId}/powerbi/reports/${groupId}`, token);
}

// Fetch Custom Report Token
export async function getCustomReportToken(userId: string, groupId: string, datasetId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(
    `${environment.scoreAPI}/users/v2/${userId}/powerbi/token/customreports/${groupId}/${datasetId}`,
    token
  );
}

export async function getPowerBITokenForUser(userId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed: No token available.');
  }

  const url = `${environment.scoreAPI}/users/${userId}/powerbi/token`;

  try {
    return await get(url, token);
  } catch (error: any) {
    throw new Error(
      `Failed to retrieve Power BI token for user ${userId} from ${url}: ${error.message || 'Unknown error'}`
    );
  }
}

// Function to initiate the export of a Power BI report to PDF
export async function exportPowerBIReportToPdf(
  userId: string,
  groupId: string,
  reportId: string,
  datasetId: string,
  username: string,
  roles: string,
  isPaginated: boolean = false,
  insurerId?: string,
  lonestarId?: string,
  currentUserRole?: string
): Promise<Blob> {
  try {
    // Step 1: Get Power BI access token for API calls
    const tokenResponse = await getPowerBITokenForUser(userId);
    const powerBiToken = tokenResponse?.data?.access_token;

    if (!powerBiToken) {
      throw new Error('Failed to get Power BI token for export');
    }

    // Step 2: Send export request with identity information
    const exportId = await postExportRequest(
      groupId,
      reportId,
      powerBiToken,
      username,
      roles,
      datasetId,
      isPaginated,
      insurerId,
      lonestarId,
      currentUserRole
    );

    // Step 3: Poll for export completion
    const exportResult = await pollExportRequest(groupId, reportId, exportId, powerBiToken);

    // Step 4: Get the exported file
    return await getExportedFile(groupId, reportId, exportId, powerBiToken);
  } catch (error: any) {
    console.error('Error in exportPowerBIReportToPdf:', error);
    throw new Error(`Failed to export report to PDF: ${error.message}`);
  }
}

// Step 1: Post the export request
async function postExportRequest(
  groupId: string,
  reportId: string,
  powerBiToken: string,
  username: string,
  roles: string,
  datasetId: string,
  isPaginated: boolean = false,
  insurerId?: string,
  lonestarId?: string,
  currentUserRole?: string
): Promise<string> {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/ExportTo`;

  let exportRequest;
  if (isPaginated) {
    // Build parameter values array
    const parameterValues = [
      {
        name: 'LoginEmail',
        value: username,
      },
      {
        name: 'role',
        value: currentUserRole || '',
      },
      {
        name: 'lonestarId',
        value: lonestarId || '',
      },
    ];

    exportRequest = {
      format: 'PDF',
      paginatedReportConfiguration: {
        parameterValues: parameterValues,
      },
    };
  } else {
    exportRequest = {
      format: 'PDF',
      powerBIReportConfiguration: {
        identities: [
          {
            username: username,
            roles: [roles],
            datasets: [datasetId],
          },
        ],
      },
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${powerBiToken}`,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(exportRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.id; // Return the export ID for polling
  } catch (error: any) {
    console.error('Error in postExportRequest:', error);
    throw new Error(`Failed to start report export: ${error.message}`);
  }
}

// Step 2: Poll for export completion
async function pollExportRequest(
  groupId: string,
  reportId: string,
  exportId: string,
  powerBiToken: string,
  timeoutInMinutes: number = 5
): Promise<any> {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/exports/${exportId}`;

  const headers = {
    Authorization: `Bearer ${powerBiToken}`,
  };

  const startTime = new Date();
  const maxTime = new Date(startTime.getTime() + timeoutInMinutes * 60000);

  // Define export states
  const SUCCEEDED = 'Succeeded';
  const FAILED = 'Failed';
  const RUNNING = 'Running';
  const NOT_STARTED = 'NotStarted';

  while (new Date() < maxTime) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Polling request failed with status ${response.status}: ${errorText}`);
      }

      const exportStatus = await response.json();

      if (exportStatus.status === SUCCEEDED) {
        return exportStatus;
      } else if (exportStatus.status === FAILED) {
        throw new Error(`Export failed: ${exportStatus.error?.message || 'Unknown error'}`);
      }

      let delayMs = 2000;
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        delayMs = parseInt(retryAfter) * 1000;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error: any) {
      console.error('Error while polling export status:', error);
      throw new Error(`Failed to poll export status: ${error.message}`);
    }
  }

  throw new Error(`Export operation timed out after ${timeoutInMinutes} minutes`);
}

// Step 3: Get the exported file
async function getExportedFile(
  groupId: string,
  reportId: string,
  exportId: string,
  powerBiToken: string
): Promise<Blob> {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/exports/${exportId}/file`;

  const headers = {
    Authorization: `Bearer ${powerBiToken}`,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`File download failed with status ${response.status}: ${errorText}`);
    }

    return await response.blob();
  } catch (error: any) {
    console.error('Error in getExportedFile:', error);
    throw new Error(`Failed to download exported file: ${error.message}`);
  }
}
