import api from '../api.js';

// Work and Events API endpoints
export const workAndEventsApi = {
  // Create a new work and event
  createWorkAndEvent: async (formData) => {
    try {
      const response = await api.post('/work-and-events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all work and events
  getAllWorkAndEvents: async () => {
    try {
      const response = await api.get('/work-and-events');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get work and event by ID
  getWorkAndEventById: async (id) => {
    try {
      const response = await api.get(`/work-and-events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update work and event
  updateWorkAndEvent: async (id, formData) => {
    try {
      const response = await api.put(`/work-and-events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete work and event
  deleteWorkAndEvent: async (id) => {
    try {
      const response = await api.delete(`/work-and-events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default workAndEventsApi;
