import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface IEventsMileState {
  filterCriteria: any | null;
}

const initialState: IEventsMileState = {
  filterCriteria: null,
};

const iEventsMileSlice = createSlice({
  name: 'eventsMile',
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

export const { setFilterCriteria, clearFilterCriteria } = iEventsMileSlice.actions;

export const selectFilterCriteria = (state: any) => state.iEventsMile.filterCriteria;

export default iEventsMileSlice.reducer;
