import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filterCriteria: {
    active: false,
    inactive: false,
  },
};

const usersSlice = createSlice({
  name: 'usersFilters',
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

export const { setFilterCriteria, clearFilterCriteria } = usersSlice.actions;

export const selectFilterCriteria = (state: any) => state.usermanagement.filterCriteria;

export default usersSlice.reducer;
