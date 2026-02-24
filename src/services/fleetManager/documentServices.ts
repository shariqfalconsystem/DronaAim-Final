import { deleteRequest, get, getToken, post, put } from '../apiService';
import environment from '../../environments/environment';

export async function getDocuments(lonestarId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  return await get(`${environment.baseAPIX}super-fleet-manager/fleet/LS1006/documents`, token);
}

export async function deleteDocument(lonestarId: string, documentId: string): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await deleteRequest(
    `${environment.baseAPI}lonestar/fleet/${lonestarId}/fleetDocument/${documentId}`,
    token
  );
}