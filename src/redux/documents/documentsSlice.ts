import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filterCriteria: {
    fromDate: null,
    toDate: null,
    approved: false,
    rejected: false,
    verificationPending: false,
    png: false,
    jpg: false,
    pdf: false,
    doc: false,
  },
};

const documentsSlice = createSlice({
  name: 'documents',
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

export const { setFilterCriteria, clearFilterCriteria } = documentsSlice.actions;

export const selectFilterCriteria = (state: any) => state.documents?.filterCriteria;

export default documentsSlice.reducer;
