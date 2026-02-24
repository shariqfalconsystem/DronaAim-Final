import { get, getToken, post, deleteRequestWithBody } from '../apiService';
import environment from '../../environments/environment';



export async function getAdminInsurance(
  page: number,
  limit: number,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPIX}insurance/insuranceList`, requestBody, token);
}

export async function editInsurer(insurerData: {

  currentLoggedInUserId: string,
  contactUid: string,
  insurerId: string,
  initials: string,
  firstName: string,
  lastName: string,
  phoneCtryCd: string,
  phone: string,
  emailId: string,
  address: string,
  isPrimary: boolean,

}): Promise<{ status: number; data: any }> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  return await post(`${environment.baseAPI}lonestar/insurers/editPrimaryContact`, insurerData, token);
}

