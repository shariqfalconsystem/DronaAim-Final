import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface IFleetListState {
  filterCriteria: any | null;
}

const initialState: IFleetListState = {
  filterCriteria: null,
};

const iFleetListSlice = createSlice({
  name: 'adminFleetList',
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

export const { setFilterCriteria, clearFilterCriteria } = iFleetListSlice.actions;

export const selectFilterCriteria = (state: any) => state.iFleetList.filterCriteria;

export default iFleetListSlice.reducer;
