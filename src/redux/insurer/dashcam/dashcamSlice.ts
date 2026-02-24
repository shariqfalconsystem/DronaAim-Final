import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  filterCriteria: {
    completed: false,
    inProgress: false,
    isNotFound: false,
  },
};

const dashcamSlice = createSlice({
  name: 'dashcamFilters',
  initialState,
  reducers: {
    setFilterCriteria(state, action: PayloadAction<any>) {
      state.filterCriteria = action.payload;
    },
    clearFilterCriteria(state) {
      state.filterCriteria = initialState.filterCriteria;
    },
  },
});

export const { setFilterCriteria, clearFilterCriteria } = dashcamSlice.actions;

export const selectFilterCriteria = (state: any) => state?.iDashcam?.filterCriteria;

export default dashcamSlice.reducer;
