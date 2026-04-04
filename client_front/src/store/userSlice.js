import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, {
  authService,
  biensService,
  paiementsService,
  messagesService,
  notificationsService,
  maintenancesService,
} from '../services/api';

// ═══════════════════════════════════════════════════
// AUTH THUNKS
// ═══════════════════════════════════════════════════

export const login = createAsyncThunk('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);

    const profileResponse = await authService.getProfile();
    return profileResponse.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.detail || 'Erreur de connexion');
  }
});

export const fetchProfile = createAsyncThunk('user/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getProfile();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération du profil');
  }
});

export const registerUser = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'inscription');
  }
});

export const updateProfile = createAsyncThunk('user/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.patch('auth/profile/', formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour du profil');
  }
});

export const changePassword = createAsyncThunk('user/changePassword', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.changePassword(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors du changement de mot de passe');
  }
});

// ═══════════════════════════════════════════════════
// CANDIDATURES THUNKS
// ═══════════════════════════════════════════════════

export const fetchUserCandidatures = createAsyncThunk('user/fetchCandidatures', async (_, { rejectWithValue }) => {
  try {
    const response = await biensService.candidatures();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des candidatures');
  }
});

export const submitCandidature = createAsyncThunk('user/submitCandidature', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('biens/candidatures/', formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'envoi de la candidature');
  }
});

// ═══════════════════════════════════════════════════
// PAIEMENTS THUNKS — /api/paiements/
// ═══════════════════════════════════════════════════

export const fetchUserPayments = createAsyncThunk('user/fetchPayments', async (_, { rejectWithValue }) => {
  try {
    const response = await paiementsService.list();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des paiements');
  }
});

export const submitPayment = createAsyncThunk('user/submitPayment', async (paymentData, { rejectWithValue }) => {
  try {
    // POST /api/paiements/ — Body: { bail, locataire, date_paiement, montant, reference }
    const response = await paiementsService.create(paymentData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'envoi du paiement');
  }
});

// ═══════════════════════════════════════════════════
// MESSAGES THUNKS — /api/messages/
// ═══════════════════════════════════════════════════

export const fetchContacts = createAsyncThunk('user/fetchContacts', async (_, { rejectWithValue }) => {
  try {
    // GET /api/messages/conversations/ — Liste des conversations groupées par utilisateur
    const response = await messagesService.conversations();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des contacts');
  }
});

export const fetchConversation = createAsyncThunk('user/fetchConversation', async (contactId, { rejectWithValue }) => {
  try {
    // GET /api/messages/conversation/{user_id}/ — Messages avec un utilisateur
    const response = await messagesService.conversation(contactId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération de la discussion');
  }
});

export const sendMessage = createAsyncThunk('user/sendMessage', async ({ destinataire, contenu }, { rejectWithValue }) => {
  try {
    // POST /api/messages/ — Body: { destinataire, contenu }
    const response = await messagesService.send({ destinataire, contenu });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'envoi du message');
  }
});

// ═══════════════════════════════════════════════════
// NOTIFICATIONS THUNKS — /api/notifications/
// ═══════════════════════════════════════════════════

export const fetchNotifications = createAsyncThunk('user/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    const response = await notificationsService.list();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des notifications');
  }
});

export const fetchUnreadNotifications = createAsyncThunk('user/fetchUnreadNotifications', async (_, { rejectWithValue }) => {
  try {
    const response = await notificationsService.nonLues();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des notifications non lues');
  }
});

export const markNotificationRead = createAsyncThunk('user/markNotificationRead', async (id, { rejectWithValue }) => {
  try {
    const response = await notificationsService.marquerLu(id);
    return { id, data: response.data };
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur');
  }
});

export const markAllNotificationsRead = createAsyncThunk('user/markAllNotificationsRead', async (_, { rejectWithValue }) => {
  try {
    const response = await notificationsService.marquerToutLu();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur');
  }
});

// ═══════════════════════════════════════════════════
// MAINTENANCE THUNKS — /api/maintenances/
// ═══════════════════════════════════════════════════

export const fetchMaintenances = createAsyncThunk('user/fetchMaintenances', async (_, { rejectWithValue }) => {
  try {
    const response = await maintenancesService.list();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la récupération des maintenances');
  }
});

export const createMaintenance = createAsyncThunk('user/createMaintenance', async (data, { rejectWithValue }) => {
  try {
    // POST /api/maintenances/ — Body: { titre, description, bien, locataire, priorite }
    const response = await maintenancesService.create(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la création de la demande');
  }
});

export const updateMaintenance = createAsyncThunk('user/updateMaintenance', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await maintenancesService.partialUpdate(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour');
  }
});

export const sendMaintenanceJustificatif = createAsyncThunk('user/sendMaintenanceJustificatif', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await maintenancesService.envoyerJustificatif(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Erreur lors de l\'envoi du justificatif');
  }
});

// ═══════════════════════════════════════════════════
// SLICE
// ═══════════════════════════════════════════════════

const initialState = {
  profile: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  candidatures: [],
  payments: [],
  maintenanceRequests: [],
  contacts: [],
  activeConversation: [],
  notifications: [],
  unreadNotifications: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.clear();
      state.profile = null;
      state.isAuthenticated = false;
      state.candidatures = [];
      state.payments = [];
      state.maintenanceRequests = [];
      state.contacts = [];
      state.activeConversation = [];
      state.notifications = [];
      state.unreadNotifications = [];
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── LOGIN ──
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
      // ── FETCH PROFILE ──
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── REGISTER ──
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
      // ── PROFILE UPDATE ──
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
      // ── CANDIDATURES ──
      .addCase(fetchUserCandidatures.fulfilled, (state, action) => {
        const data = action.payload;
        state.candidatures = Array.isArray(data) ? data : (data.results || []);
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
      // ── PAYMENTS ──
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        const data = action.payload;
        state.payments = Array.isArray(data) ? data : (data.results || []);
      })
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(submitPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.push(action.payload);
      })
      .addCase(submitPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── MESSAGES ──
      .addCase(fetchContacts.fulfilled, (state, action) => {
        const data = action.payload;
        state.contacts = Array.isArray(data) ? data : (data.results || []);
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        const data = action.payload;
        state.activeConversation = Array.isArray(data) ? data : (data.results || []);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.activeConversation.push(action.payload);
      })
      // ── NOTIFICATIONS ──
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const data = action.payload;
        state.notifications = Array.isArray(data) ? data : (data.results || []);
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        const data = action.payload;
        state.unreadNotifications = Array.isArray(data) ? data : (data.results || []);
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload.id;
        state.notifications = state.notifications.map(n =>
          n.id === id ? { ...n, lu: true } : n
        );
        state.unreadNotifications = state.unreadNotifications.filter(n => n.id !== id);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, lu: true }));
        state.unreadNotifications = [];
      })
      // ── MAINTENANCE ──
      .addCase(fetchMaintenances.fulfilled, (state, action) => {
        const data = action.payload;
        state.maintenanceRequests = Array.isArray(data) ? data : (data.results || []);
      })
      .addCase(createMaintenance.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMaintenance.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenanceRequests.push(action.payload);
      })
      .addCase(createMaintenance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMaintenance.fulfilled, (state, action) => {
        const updated = action.payload;
        state.maintenanceRequests = state.maintenanceRequests.map(m =>
          m.id === updated.id ? updated : m
        );
      })
      .addCase(sendMaintenanceJustificatif.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMaintenanceJustificatif.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.maintenanceRequests = state.maintenanceRequests.map(m =>
          m.id === updated.id ? updated : m
        );
      })
      .addCase(sendMaintenanceJustificatif.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setProfile, clearError } = userSlice.actions;
export default userSlice.reducer;
