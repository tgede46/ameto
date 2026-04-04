import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const normalizeList = (payload) => (Array.isArray(payload) ? payload : (payload?.results || []));

export const fetchConversations = createAsyncThunk(
  'notification/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('messages/conversations/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur chargement conversations');
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'notification/fetchConversation',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`messages/conversation/${userId}/`);
      return { userId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur chargement messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'notification/sendMessage',
  async ({ destinataire, contenu }, { rejectWithValue }) => {
    try {
      const response = await api.post('messages/', { destinataire, contenu });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur envoi message');
    }
  }
);

const initialState = {
  notifications: [],
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = normalizeList(action.payload);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.activeConversation = action.payload.userId;
        state.messages = normalizeList(action.payload.messages);
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addNotification, markAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
