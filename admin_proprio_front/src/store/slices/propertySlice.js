import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (role, { rejectWithValue }) => {
    try {
      const response = role === 'owner'
        ? await api.get('biens/mes-biens/')
        : await api.get('biens/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des biens');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`biens/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement du bien');
    }
  }
);

export const editProperty = createAsyncThunk(
  'properties/editProperty',
  async ({ id, propertyData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`biens/${id}/`, propertyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la modification du bien');
    }
  }
);


export const fetchOwnerStats = createAsyncThunk(
  'properties/fetchOwnerStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('biens/mes-stats/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des statistiques');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'properties/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('categories/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des catégories');
    }
  }
);

export const fetchTypesAppartement = createAsyncThunk(
  'properties/fetchTypesAppartement',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('types-appartement/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des types');
    }
  }
);

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (propertyData, { rejectWithValue }) => {
    try {
      const response = await api.post('biens/', propertyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la création du bien');
    }
  }
);

export const uploadPropertyPhoto = createAsyncThunk(
  'properties/uploadPropertyPhoto',
  async ({ propertyId, photoData }, { rejectWithValue }) => {
    try {
      // Let the browser set multipart boundaries automatically for FormData.
      const response = await api.post(`biens/${propertyId}/photos/`, photoData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de l\'upload de la photo');
    }
  }
);

const initialState = {
  properties: [],
  categories: [],
  typesAppartement: [],
  stats: null,
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setProperties: (state, action) => {
      state.properties = action.payload;
    },
    addProperty: (state, action) => {
      state.properties.push(action.payload);
    },
    updatePropertyInState: (state, action) => {
      const index = state.properties.findIndex(p => p.id === action.payload.id);
      if (index !== -1) state.properties[index] = action.payload;
    },
    deleteProperty: (state, action) => {
      state.properties = state.properties.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        // Gérer la pagination
        state.properties = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOwnerStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOwnerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOwnerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      })
      .addCase(fetchTypesAppartement.fulfilled, (state, action) => {
        state.typesAppartement = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      });
  },
});

export const { setProperties, addProperty, updatePropertyInState, deleteProperty } = propertySlice.actions;
export default propertySlice.reducer;
