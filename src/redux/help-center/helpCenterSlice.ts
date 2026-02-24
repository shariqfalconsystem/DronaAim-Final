import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getHelpCenterTopics } from '../../services/admin/helpCenterServices';

// Define the state interface
interface HelpCenterState {
  topics: any[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: HelpCenterState = {
  topics: [],
  loading: false,
  error: null,
};

// Define the sorting order based on the wireframe
const sortOrder: any = {
  'All Topics': 0,
  'User Manuals': 1,
  'Troubleshooting Guides': 2,
  'Support Resources': 3,
  FAQs: 4,
};

// Async thunk for fetching topics
export const fetchHelpCenterTopics: any = createAsyncThunk('helpCenter/fetchTopics', async (_, { rejectWithValue }) => {
  try {
    const response = await getHelpCenterTopics();

    if (response?.data?.allTopics) {
      // Map the API response to Category type
      const mappedCategories = response.data.allTopics
        .filter((topic: any) => topic.enabled)
        .map((topic: any) => {
          // Map topic names to appropriate icons
          let icon = 'list';
          if (topic.topicName === 'User Manuals') icon = 'file';
          else if (topic.topicName === 'Troubleshooting Guides') icon = 'tools';
          else if (topic.topicName === 'Support Resources') icon = 'headset';
          else if (topic.topicName === 'FAQs') icon = 'question';

          return {
            id: topic.topicName.toLowerCase().replace(/\s+/g, '-'),
            name: topic.uiDisplayText,
            icon,
            topicName: topic.topicName, // Keep the original topic name for reference
            sortOrder: sortOrder[topic.topicName] !== undefined ? sortOrder[topic.topicName] : 999, // Add sort order
          };
        });

      // Sort the categories according to the wireframe order
      mappedCategories.sort((a: any, b: any) => a.sortOrder - b.sortOrder);

      return mappedCategories;
    }

    return [];
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch topics');
  }
});

// Create the slice
const helpCenterSlice = createSlice({
  name: 'helpCenter',
  initialState,
  reducers: {
    clearTopics: (state) => {
      state.topics = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHelpCenterTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHelpCenterTopics.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.topics = action.payload;
        state.loading = false;
      })
      .addCase(fetchHelpCenterTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearTopics } = helpCenterSlice.actions;

// Selectors
export const selectAllTopics = (state: any) => state.helpCenter.topics;
export const selectTopicsLoading = (state: any) => state.helpCenter.loading;
export const selectTopicsError = (state: any) => state.helpCenter.error;

export default helpCenterSlice.reducer;
