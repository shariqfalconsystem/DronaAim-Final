import { Dispatch } from 'redux';
import { loginSuccess } from '../redux/auth/authSlice';
import { post } from './apiService';
import UserData from '../models/UserData';
import environment from '../environments/environment';

export async function login(dispatch: Dispatch, username: string, password: string): Promise<UserData> {
  const body = { clientId: username, secret: password };

  try {
    const response = await post(`${environment.baseAPI}fleetTelematics/user/signin`, body);

    if (response.token) {
      dispatch(loginSuccess(response));
      return response as UserData;
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error) {
    console.error('Error occurred while logging in:', error);
    throw error;
  }
}
