import api from './api';

const userService = {
  getAllUsers: async () => {
    const response = await api.get('utilisateurs/');
    return response.data;
  },

  getOwners: async () => {
    const response = await api.get('proprietaires/');
    return response.data;
  },

  getTenants: async () => {
    const response = await api.get('locataires/');
    return response.data;
  },

  createUser: async (userData) => {
    // Decide endpoint based on role
    let endpoint = 'utilisateurs/';
    if (userData.role === 'PROPRIETAIRE') endpoint = 'proprietaires/';
    if (userData.role === 'LOCATAIRE') endpoint = 'locataires/';
    
    const response = await api.post(endpoint, userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    // For update, we might need to know the role to use the right endpoint if roles are separate
    // Or use a generic user endpoint if the backend supports it.
    // Based on urls.py, we have separate viewsets.
    let endpoint = `utilisateurs/${id}/`;
    if (userData.role === 'PROPRIETAIRE') endpoint = `proprietaires/${id}/`;
    if (userData.role === 'LOCATAIRE') endpoint = `locataires/${id}/`;

    const response = await api.patch(endpoint, userData);
    return response.data;
  },

  deleteUser: async (id, role) => {
    let endpoint = `utilisateurs/${id}/`;
    if (role === 'PROPRIETAIRE') endpoint = `proprietaires/${id}/`;
    if (role === 'LOCATAIRE') endpoint = `locataires/${id}/`;

    const response = await api.delete(endpoint);
    return response.data;
  }
};

export default userService;
