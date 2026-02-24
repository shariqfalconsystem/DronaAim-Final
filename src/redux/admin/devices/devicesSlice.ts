import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filterCriteria: {
    status: null,
    assignmentStatus: null,
  },
};

const devicesSlice = createSlice({
  name: 'devicesFilters',
  initialState,
  reducers: {
    setFilterCriteria(state, action) {
      state.filterCriteria = {
        ...state.filterCriteria,
        ...action.payload,
      };
    },
    clearFilterCriteria(state) {
      state.filterCriteria = initialState.filterCriteria;
    },
  },
});

export const { setFilterCriteria, clearFilterCriteria } = devicesSlice.actions;

export const selectFilterCriteria = (state: any) => state.devices.filterCriteria;

export default devicesSlice.reducer;
