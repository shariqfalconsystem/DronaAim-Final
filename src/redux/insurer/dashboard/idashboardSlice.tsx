import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface IDashbaordState {
  filterCriteria: any | null;
}

const initialState: IDashbaordState = {
  filterCriteria: null,
};

const idashboardSlice = createSlice({
  name: 'dashboard',
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

export const { setFilterCriteria, clearFilterCriteria } = idashboardSlice.actions;

export const selectFilterCriteria = (state: any) => state.idashboard.filterCriteria;

export default idashboardSlice.reducer;
