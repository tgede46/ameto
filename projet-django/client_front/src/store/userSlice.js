import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const login = createAsyncThunk('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('auth/login/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    
    const profileResponse = await api.get('auth/profile/');
    return profileResponse.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.detail || 'Erreur de connexion');
  }
});

export const registerUser = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('auth/register/', userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'inscription');
  }
});

export const submitCandidature = createAsyncThunk('user/submitCandidature', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('biens/candidatures/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'envoi de la candidature');
  }
});

export const fetchUserCandidatures = createAsyncThunk('user/fetchCandidatures', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('biens/candidatures/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des candidatures');
  }
});

export const submitPayment = createAsyncThunk('user/submitPayment', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('compta/paiements/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'envoi du paiement');
  }
});

export const fetchUserPayments = createAsyncThunk('user/fetchPayments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('compta/paiements/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des paiements');
  }
});

export const updateProfile = createAsyncThunk('user/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.patch('auth/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour du profil');
  }
});

export const fetchContacts = createAsyncThunk('user/fetchContacts', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('notifications/messages/list_contacts/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des contacts');
  }
});

export const fetchConversation = createAsyncThunk('user/fetchConversation', async (contactId, { rejectWithValue }) => {
  try {
    const response = await api.get(`notifications/messages/conversation/${contactId}/`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération de la discussion');
  }
});

export const sendMessage = createAsyncThunk('user/sendMessage', async ({ receiver, text }, { rejectWithValue }) => {
  try {
    const response = await api.post('notifications/messages/', { receiver, text });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'envoi du message');
  }
});

const initialState = {
  profile: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  candidatures: [],
  payments: [],
  maintenanceRequests: [],
  contacts: [],
  activeConversation: []
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.clear();
      state.profile = null;
      state.isAuthenticated = false;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserCandidatures.fulfilled, (state, action) => {
        state.candidatures = action.payload;
      })
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        state.payments = action.payload;
      })
      .addCase(submitCandidature.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitCandidature.fulfilled, (state, action) => {
        state.loading = false;
        state.candidatures.push(action.payload);
      })
      .addCase(submitCandidature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.push(action.payload);
      })
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contacts = action.payload;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.activeConversation = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.activeConversation.push(action.payload);
      });
  },
});

export const { logout, setProfile } = userSlice.actions;
export default userSlice.reducer;
