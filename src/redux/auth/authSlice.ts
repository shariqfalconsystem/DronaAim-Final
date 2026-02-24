import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import environment from '../../environments/environment';

interface AuthState {
  userData: any;
  currentUserId: string | null;
  currentUserRole: string | null;
  dronaaimId: string | null;
  userInfo: {
    orgRoleAndScoreMapping: any[];
    profilePicUrl: string | null;
    fullName: string | null;
    emailId: string | null;
    primaryPhone: string | null;
    primaryPhoneCtryCd: string | null;
  } | null;
  fetchingUserInfo: boolean;
  userInfoError: string | null;
}

const initialState: AuthState = {
  userData: null,
  currentUserId: null,
  currentUserRole: null,
  dronaaimId: null,
  userInfo: null,
  fetchingUserInfo: false,
  userInfoError: null,
};

// Async thunk for fetching user info - using the same implementation as Dashboard
export const fetchUserInfo = createAsyncThunk('auth/fetchUserInfo', async (_, { rejectWithValue }) => {
  try {
    const { userId } = await getCurrentUser();
    const { accessToken }: any = (await fetchAuthSession()).tokens ?? {};

    const response = await fetch(`${environment.scoreAPI}/users/v1/userinfo/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    console.log('user info userInfoData >>>>>>>>>>>>>>>>>>>>>>: ', data);

    return {
      orgRoleAndScoreMapping: data?.orgRoleAndScoreMapping || [],
      profilePicUrl: data?.signedUrl || null,
      fullName: data?.fullName || null,
      emailId: data?.emailId || null,
      primaryPhone: data?.primaryPhone || null,
      primaryPhoneCtryCd: data?.primaryPhoneCtryCd || null,
      rawData: data,
    };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch user info');
  }
});

// Async thunk for refreshing user info (force refresh) - using the same implementation
export const refreshUserInfo = createAsyncThunk('auth/refreshUserInfo', async (_, { rejectWithValue }) => {
  try {
    const { userId } = await getCurrentUser();
    const { accessToken }: any = (await fetchAuthSession()).tokens ?? {};

    const response = await fetch(`${environment.scoreAPI}/users/v1/userinfo/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();

    // Map the response to match the old API structure
    return {
      orgRoleAndScoreMapping: data?.orgRoleAndScoreMapping || [],
      profilePicUrl: data?.signedUrl || null,
      fullName: data?.fullName || null,
      emailId: data?.emailId || null,
      primaryPhone: data?.primaryPhone || null,
      primaryPhoneCtryCd: data?.primaryPhoneCtryCd || null,
      rawData: data,
    };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to refresh user info');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<any>) {
      state.userData = action.payload;
      state.currentUserId = action.payload.userId;
      state.currentUserRole = action.payload.currentUserRole;
      state.dronaaimId = action.payload.dronaaimId;
    },
    clearAuthState(state) {
      state.userData = null;
      state.currentUserId = null;
      state.currentUserRole = null;
      state.dronaaimId = null;
      state.userInfo = null;
      state.fetchingUserInfo = false;
      state.userInfoError = null;
    },
    updateProfilePicUrl(state, action: PayloadAction<string | null>) {
      if (state.userInfo) {
        state.userInfo.profilePicUrl = action.payload;
      }
    },
    clearUserInfoError(state) {
      state.userInfoError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserInfo cases
      .addCase(fetchUserInfo.pending, (state) => {
        state.fetchingUserInfo = true;
        state.userInfoError = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.fetchingUserInfo = false;
        state.userInfo = {
          orgRoleAndScoreMapping: action.payload.orgRoleAndScoreMapping,
          profilePicUrl: action.payload.profilePicUrl,
          fullName: action.payload.fullName,
          emailId: action.payload.emailId,
          primaryPhone: action.payload.primaryPhone,
          primaryPhoneCtryCd: action.payload.primaryPhoneCtryCd,
        };
        state.userInfoError = null;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.fetchingUserInfo = false;
        state.userInfoError = action.payload as string;
      })
      // refreshUserInfo cases
      .addCase(refreshUserInfo.pending, (state) => {
        state.fetchingUserInfo = true;
        state.userInfoError = null;
      })
      .addCase(refreshUserInfo.fulfilled, (state, action) => {
        state.fetchingUserInfo = false;
        state.userInfo = {
          orgRoleAndScoreMapping: action.payload.orgRoleAndScoreMapping,
          profilePicUrl: action.payload.profilePicUrl,
          fullName: action.payload.fullName,
          emailId: action.payload.emailId,
          primaryPhone: action.payload.primaryPhone,
          primaryPhoneCtryCd: action.payload.primaryPhoneCtryCd,
        };
        state.userInfoError = null;
      })
      .addCase(refreshUserInfo.rejected, (state, action) => {
        state.fetchingUserInfo = false;
        state.userInfoError = action.payload as string;
      });
  },
});

export const { loginSuccess, clearAuthState, updateProfilePicUrl, clearUserInfoError } = authSlice.actions;

export default authSlice.reducer;
