import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('auth/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
    }
    return response.data;
  },

  logout: () => {
    localStorage.clear();
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
