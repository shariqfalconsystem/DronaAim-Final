import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filterCriteria: {
    fromDate: null,
    toDate: null,
    completed: false,
    inProgress: false,
  },
};

const driversSlice = createSlice({
  name: 'drivers',
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

export const { setFilterCriteria, clearFilterCriteria } = driversSlice.actions;

export const selectFilterCriteria = (state: any) => state.drivers.filterCriteria;

export default driversSlice.reducer;
