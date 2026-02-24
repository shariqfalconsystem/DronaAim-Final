// src/redux/vehicles/vehicleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AssignmentStatus {
  assigned: boolean;
  unassigned: boolean;
}

interface VehicleFilterCriteria {
  scoreRange?: number[];
  active?: boolean;
  inactive?: boolean;
  assignmentStatus?: AssignmentStatus | null;
}

interface VehicleState {
  filterCriteria: VehicleFilterCriteria | null;
}

const initialState: VehicleState = {
  filterCriteria: null,
};

const vehicleSlice = createSlice({
  name: 'vehicleFilters',
  initialState,
  reducers: {
    setFilterCriteria(state, action: PayloadAction<VehicleFilterCriteria>) {
      state.filterCriteria = action.payload;
    },
    clearFilterCriteria(state) {
      state.filterCriteria = null;
    },
  },
});

export const { setFilterCriteria, clearFilterCriteria } = vehicleSlice.actions;

export const selectFilterCriteria = (state: any) => state.adminVehicles.filterCriteria;

export default vehicleSlice.reducer;
