import api from '../api';

export const createStore = async (formData) => {
  const response = await api.post('/stores', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyStore = async () => {
  const response = await api.get('/stores/me');
  return response.data;
};

export const updateStore = async (storeId, formData) => {
  const response = await api.put(`/stores/${storeId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteStore = async (storeId) => {
  const response = await api.delete(`/stores/${storeId}`);
  return response.data;
};

export const getStore = async (storeId) => {
  const response = await api.get(`/stores/${storeId}`);
  return response.data;
};

export const getStores = async (params = {}) => {
  const response = await api.get('/stores', { params });
  return response.data;
};

export const approveStore = async (storeId) => {
  const response = await api.post(`/stores/${storeId}/approve`);
  return response.data;
};

export const rejectStore = async (storeId) => {
  const response = await api.post(`/stores/${storeId}/reject`);
  return response.data;
};