import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { biensService, categoriesService, typesAppartementService } from '../services/api';

// ═══════════════════════════════════════════════════
// BIENS THUNKS
// ═══════════════════════════════════════════════════

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await biensService.list(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des biens');
    }
  }
);

export const fetchRecentProperties = createAsyncThunk(
  'properties/fetchRecentProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await biensService.recents();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des biens récents');
    }
  }
);

export const fetchPropertyDetail = createAsyncThunk(
  'properties/fetchPropertyDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await biensService.detail(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la récupération du bien');
    }
  }
);

// ═══════════════════════════════════════════════════
// CATEGORIES & TYPES THUNKS
// ═══════════════════════════════════════════════════

export const fetchCategories = createAsyncThunk(
  'properties/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesService.list();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des catégories');
    }
  }
);

export const fetchTypesAppartement = createAsyncThunk(
  'properties/fetchTypesAppartement',
  async (_, { rejectWithValue }) => {
    try {
      const response = await typesAppartementService.list();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des types');
    }
  }
);

// ═══════════════════════════════════════════════════
// SLICE
// ═══════════════════════════════════════════════════

const initialState = {
  list: [],
  recentList: [],
  selectedProperty: null,
  categories: [],
  typesAppartement: [],
  loading: false,
  detailLoading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── FETCH ALL ──
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── FETCH RECENT ──
      .addCase(fetchRecentProperties.fulfilled, (state, action) => {
        state.recentList = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      })
      // ── FETCH DETAIL ──
      .addCase(fetchPropertyDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchPropertyDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(fetchPropertyDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      // ── CATEGORIES ──
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      })
      // ── TYPES ──
      .addCase(fetchTypesAppartement.fulfilled, (state, action) => {
        state.typesAppartement = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      });
  },
});

export const { clearSelectedProperty } = propertySlice.actions;
export default propertySlice.reducer;
