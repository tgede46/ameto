import api from './api';

const propertyService = {
  getAllProperties: async () => {
    const response = await api.get('biens/');
    return response.data;
  },

  getOwnerProperties: async () => {
    const response = await api.get('biens/mes-biens/');
    return response.data;
  },

  getPropertyDetails: async (id) => {
    const response = await api.get(`biens/${id}/`);
    return response.data;
  },

  createProperty: async (propertyData) => {
    const response = await api.post('biens/', propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProperty: async (id, propertyData) => {
    const response = await api.patch(`biens/${id}/`, propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProperty: async (id) => {
    const response = await api.delete(`biens/${id}/`);
    return response.data;
  }
};

export default propertyService;
