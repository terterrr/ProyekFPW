import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAccessToken } from '../../utils/tokenStorage';

const BASE_URL = 'http://localhost:3001/api/v1/history';

export const fetchHistories = createAsyncThunk(
  'history/fetchHistories',
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/user/${userId}`);
    return response.data;
  }
);

export const deleteHistory = createAsyncThunk(
  'history/deleteHistory',
  async (id) => {
    const token = getAccessToken();
    await axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return id;
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHistories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHistories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchHistories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Delete
      .addCase(deleteHistory.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  }
});

export default historySlice.reducer;
