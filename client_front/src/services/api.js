import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/').replace(/\/?$/, '/');

const api = axios.create({
  baseURL: API_URL,
});

const API_ORIGIN = (() => {
  try {
    return new URL(API_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

export const toApiMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('token', res.data.access);
          api.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('auth/login/', credentials),
  register: (userData) => api.post('auth/register/', userData),
  getProfile: () => api.get('auth/profile/'),
  updateProfile: (data) => api.patch('auth/profile/', data),
  changePassword: (data) => api.post('auth/changer_password/', data),
  refreshToken: (refresh) => api.post('auth/token/refresh/', { refresh }),
  verifyToken: (token) => api.post('auth/token/verify/', { token }),
};

export const biensService = {
  list: (params) => api.get('biens/', { params }),
  recents: () => api.get('biens/recents/'),
  detail: (id) => api.get(`biens/${id}/`),
  create: (data) => api.post('biens/', data),
  update: (id, data) => api.put(`biens/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`biens/${id}/`, data),
  delete: (id) => api.delete(`biens/${id}/`),
  bail: (id) => api.get(`biens/${id}/bail/`),
  mesBiens: (params) => api.get('biens/mes-biens/', { params }),
  mesStats: () => api.get('biens/mes-stats/'),
  candidatures: (params) => api.get('biens/candidatures/', { params }),
  ajouterPhoto: (id, data) => api.post(`biens/${id}/photos/`, data),
  supprimerPhoto: (id, photoPk) => api.delete(`biens/${id}/photos/${photoPk}/`),
  ajouterVideo: (id, data) => api.post(`biens/${id}/videos/`, data),
  supprimerVideo: (id, videoPk) => api.delete(`biens/${id}/videos/${videoPk}/`),
};

export const categoriesService = {
  list: (params) => api.get('categories/', { params }),
  detail: (id) => api.get(`categories/${id}/`),
  create: (data) => api.post('categories/', data),
  update: (id, data) => api.put(`categories/${id}/`, data),
  delete: (id) => api.delete(`categories/${id}/`),
};

export const typesAppartementService = {
  list: (params) => api.get('types-appartement/', { params }),
  detail: (id) => api.get(`types-appartement/${id}/`),
  create: (data) => api.post('types-appartement/', data),
  update: (id, data) => api.put(`types-appartement/${id}/`, data),
  delete: (id) => api.delete(`types-appartement/${id}/`),
};

export const bailService = {
  list: (params) => api.get('bail/', { params }),
  detail: (id) => api.get(`bail/${id}/`),
  create: (data) => api.post('bail/', data),
  update: (id, data) => api.put(`bail/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`bail/${id}/`, data),
  delete: (id) => api.delete(`bail/${id}/`),
  resilier: (id) => api.post(`bail/${id}/resilier/`),
  renouveler: (id, data) => api.post(`bail/${id}/renouveler/`, data),
  paiements: (id) => api.get(`bail/${id}/paiements/`),
};

export const paiementsService = {
  list: (params) => api.get('paiements/', { params }),
  detail: (id) => api.get(`paiements/${id}/`),
  create: (data) => api.post('paiements/', data),
  update: (id, data) => api.put(`paiements/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`paiements/${id}/`, data),
  delete: (id) => api.delete(`paiements/${id}/`),
  valider: (id) => api.post(`paiements/${id}/valider/`),
  annuler: (id) => api.post(`paiements/${id}/annuler/`),
  quittance: (id) => api.get(`paiements/${id}/quittance/`),
};

export const quittancesService = {
  list: (params) => api.get('quittances/', { params }),
  detail: (id) => api.get(`quittances/${id}/`),
};

export const locatairesService = {
  list: (params) => api.get('locataires/', { params }),
  detail: (id) => api.get(`locataires/${id}/`),
  create: (data) => api.post('locataires/', data),
  update: (id, data) => api.put(`locataires/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`locataires/${id}/`, data),
  delete: (id) => api.delete(`locataires/${id}/`),
  bail: (id) => api.get(`locataires/${id}/bail/`),
  paiements: (id) => api.get(`locataires/${id}/paiements/`),
};

export const proprietairesService = {
  list: (params) => api.get('proprietaires/', { params }),
  detail: (id) => api.get(`proprietaires/${id}/`),
  create: (data) => api.post('proprietaires/', data),
  update: (id, data) => api.put(`proprietaires/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`proprietaires/${id}/`, data),
  delete: (id) => api.delete(`proprietaires/${id}/`),
  biens: (id) => api.get(`proprietaires/${id}/biens/`),
  comptabilite: (id) => api.get(`proprietaires/${id}/comptabilite/`),
  desactiver: (id) => api.post(`proprietaires/${id}/desactiver/`),
};

export const maintenancesService = {
  list: (params) => api.get('maintenances/', { params }),
  detail: (id) => api.get(`maintenances/${id}/`),
  create: (data) => api.post('maintenances/', data),
  update: (id, data) => api.put(`maintenances/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`maintenances/${id}/`, data),
  envoyerJustificatif: (id, data) => api.post(`maintenances/${id}/envoyer-justificatif/`, data),
  delete: (id) => api.delete(`maintenances/${id}/`),
};

export const messagesService = {
  list: (params) => api.get('messages/', { params }),
  detail: (id) => api.get(`messages/${id}/`),
  send: (data) => api.post('messages/', data),
  conversation: (userId, params) => api.get(`messages/conversation/${userId}/`, { params }),
  conversations: (params) => api.get('messages/conversations/', { params }),
};

export const notificationsService = {
  list: (params) => api.get('notifications/', { params }),
  detail: (id) => api.get(`notifications/${id}/`),
  nonLues: (params) => api.get('notifications/non-lues/', { params }),
  marquerLu: (id) => api.post(`notifications/${id}/marquer-lu/`),
  marquerToutLu: () => api.post('notifications/marquer-tout-lu/'),
};

export const comptabiliteService = {
  list: (params) => api.get('comptabilite/', { params }),
  detail: (id) => api.get(`comptabilite/${id}/`),
  create: (data) => api.post('comptabilite/', data),
  update: (id, data) => api.put(`comptabilite/${id}/`, data),
  delete: (id) => api.delete(`comptabilite/${id}/`),
  calculer: (id) => api.post(`comptabilite/${id}/calculer/`),
};

export const twoFaService = {
  status: () => api.get('2fa/status/'),
  enable: (data) => api.post('2fa/enable/', data),
  verify: (data) => api.post('2fa/verify/', data),
  disable: (data) => api.post('2fa/disable/', data),
  changeMethod: (data) => api.post('2fa/change_method/', data),
  regenerateBackup: () => api.post('2fa/regenerate_backup/'),
};

export default api;
