import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filterCriteria: {
    fromDate: null,
    toDate: null,
    completed: false,
    inProgress: false,
    isTruncate: false,
  },
};

const tripsSlice = createSlice({
  name: 'tripsFilters',
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

export const { setFilterCriteria, clearFilterCriteria } = tripsSlice.actions;

export const selectFilterCriteria = (state: any) => state.trips.filterCriteria;

export default tripsSlice.reducer;
