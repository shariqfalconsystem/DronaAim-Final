import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface IFleetListState {
  filterCriteria: any | null;
}

const initialState: IFleetListState = {
  filterCriteria: null,
};

const fnolSlice = createSlice({
  name: 'fnolList',
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

export const { setFilterCriteria, clearFilterCriteria } = fnolSlice.actions;

export const selectFilterCriteria = (state: any) => state.fnol.filterCriteria;

export default fnolSlice.reducer;
