import { post, getToken, get, postWithHeaders, putWithHeaders, getWithHeaders, deleteWithHeaders } from '../apiService';
import environment from '../../environments/environment';

export async function getHelpCenterTopics(): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}settings/admin/helpcenter/topics`;

  return await get(url, token);
}

export async function getAllDrafts(
  currentUserId: string,
  requestBody: any = {},
  page: number = 1,
  limit: number = 10
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  // Construct the URL with query parameters
  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/drafts?page=${page}&limit=${limit}`;

  // Add custom headers with userId
  const headers = {
    userId: currentUserId,
  };

  // Send request body as POST data with custom headers
  return await postWithHeaders(url, requestBody, token, headers);
}

export async function createNewDraft(
  currentUserId: string,
  requestBody: {
    topicNames: string[];
    title: string;
    subTitle: string;
    content: any;
  }
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/draft`;

  const headers = {
    userId: currentUserId,
  };

  return await postWithHeaders(url, requestBody, token, headers);
}

export async function updateDraft(
  draftId: string,
  currentUserId: string,
  requestBody: {
    topicNames: string[];
    title: string;
    subTitle: string;
    content: any;
  }
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/drafts/${draftId}`;

  const headers = {
    userId: currentUserId,
  };

  return await putWithHeaders(url, requestBody, token, headers);
}

export async function publishDraft(draftId: string, currentUserId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/drafts/${draftId}/publish`;

  const headers = {
    userId: currentUserId,
  };

  return await putWithHeaders(url, {}, token, headers);
}

export async function getAllPublishedContent(
  currentUserId: string,
  requestBody: { topicNames?: string[] } = {},
  page: number = 1,
  limit: number = 10
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}settings/admin/helpcenter/publish?page=${page}&limit=${limit}`;

  const headers = {
    userId: currentUserId,
  };

  return await postWithHeaders(url, requestBody, token, headers);
}

export async function getDraftById(draftId: string, currentUserId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/drafts/${draftId}`;

  const headers = {
    userId: currentUserId,
  };

  return await getWithHeaders(url, token, headers);
}

export async function getPublishedContentById(publishedId: string, currentUserId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/published/${publishedId}`;

  const headers = {
    userId: currentUserId,
  };

  return await getWithHeaders(url, token, headers);
}

export async function deleteDraft(draftId: string, currentUserId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/drafts/${draftId}`;

  const headers = {
    userId: currentUserId,
  };

  console.log('headers : ', headers);

  return await deleteWithHeaders(url, token, headers);
}

export async function deletePublishedContent(publishedId: string, currentUserId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/published/${publishedId}/archive`;

  const headers = {
    userId: currentUserId,
  };

  return await deleteWithHeaders(url, token, headers);
}

export async function createDraftFromPublishedContent(publishedId: string, currentUserId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/published/${publishedId}/new-draft`;

  const headers = {
    userId: currentUserId,
  };

  return await postWithHeaders(url, {}, token, headers);
}

export async function updatePublishedVisibility(
  currentUserId: string,
  visibilitySettings: { publishedId: string; activePersonas: string[] }[]
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/published/visibility`;

  const headers = {
    userId: currentUserId,
    'Content-Type': 'application/json',
  };

  const requestBody = {
    visibilitySettings: visibilitySettings,
  };

  return await postWithHeaders(url, requestBody, token, headers);
}

/**
 * Creates a pre-signed URL for uploading a media document to S3 for the Help Center.
 * @param currentUserId - The ID of the user initiating the upload.
 * @param requestBody - The details required for generating the URL.
 * @returns A promise that resolves with the pre-signed URL information.
 */
export async function createMediaUploadUrl(currentUserId: string, requestBody: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const url = `${environment.baseAPIX}cms/v1/lonestar/helpcenter/media-upload-url`;

  const headers = {
    userId: currentUserId,
    'Content-Type': 'application/json',
  };

  if (!requestBody.draftId || !requestBody.fileName || !requestBody.contentType || !requestBody.type) {
    throw new Error('Missing mandatory fields in request body for media upload URL creation.');
  }

  return await postWithHeaders(url, requestBody, token, headers);
}
