import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('biens/', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des biens');
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default propertySlice.reducer;
