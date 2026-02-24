import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filterCriteria: {
    fromDate: null,
    toDate: null,
    harshBraking: false,
    speeding: false,
    harshCornering: false,
    harshAcceleration: false,
    shock: false,
    severeShock: false,
    SOS:false,
  },
};

const eventsSlice = createSlice({
  name: 'eventFilters',
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

export const { setFilterCriteria, clearFilterCriteria } = eventsSlice.actions;

export const selectFilterCriteria = (state: any) => state.events.filterCriteria;

export default eventsSlice.reducer;
