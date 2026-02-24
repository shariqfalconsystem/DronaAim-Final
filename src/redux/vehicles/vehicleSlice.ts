// src/redux/vehicles/vehicleSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface VehicleState {
  filterCriteria: any | null;
}

const initialState: VehicleState = {
  filterCriteria: null,
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setFilterCriteria(state, action: PayloadAction<any>) {
      state.filterCriteria = action.payload;
    },
    clearFilterCriteria(state) {
      state.filterCriteria = null;
    },
  },
});

export const { setFilterCriteria, clearFilterCriteria } = vehicleSlice.actions;

export const selectFilterCriteria = (state: any) => state.vehicles.filterCriteria;

export default vehicleSlice.reducer;
