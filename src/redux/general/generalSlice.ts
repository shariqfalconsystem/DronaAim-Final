// src/redux/auth/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import UserData from '../../models/UserData';
import { setSessionItem } from '../../utility/utilities';

interface GeneralState {
  moduleName: UserData | null; // Use the UserData type here
}

const initialState: GeneralState = {
  moduleName: null,
};

const generalSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTitle: (state, action) => {
      setSessionItem('module', action.payload || 'dashboard');
      state.moduleName = action.payload;
    },
  },
});

export const { setTitle } = generalSlice.actions;
export default generalSlice.reducer;
