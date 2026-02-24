// src/redux/vehicles/vehicleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AssignmentStatus {
  assigned: boolean;
  unassigned: boolean;
}

interface VehicleFilterCriteria {
  scoreRange?: number[];
 eventsCountRange?:number[];
  assignmentStatus?: AssignmentStatus | null;
}

interface VehicleState {
  filterCriteria: VehicleFilterCriteria | null;
}

const initialState: VehicleState = {
  filterCriteria: null,
};

const driverSlice = createSlice({
  name: 'driverFilters',
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

export const { setFilterCriteria, clearFilterCriteria } = driverSlice.actions;

export const selectFilterCriteria = (state: any) => state.adminDriver.filterCriteria;

export default driverSlice.reducer;
