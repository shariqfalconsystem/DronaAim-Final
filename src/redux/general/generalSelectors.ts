// redux/auth/authSelectors.ts

import { RootState } from '../store';

export const selectUserData = (state: RootState) => state.auth.userData;
