import { useState, useEffect } from 'react';
import { workAndEventsApi } from '../api/workAndEventsApi';

export const useWorkAndEvents = () => {
  const [workAndEvents, setWorkAndEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all work and events
  const fetchWorkAndEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workAndEventsApi.getAllWorkAndEvents();
      // Handle the new response structure with success/data wrapper
      const data = response.success ? response.data : response;
      setWorkAndEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      console.error('Error fetching work and events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new work and event
  const createWorkAndEvent = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workAndEventsApi.createWorkAndEvent(formData);
      const newEvent = response.success ? response.data : response;
      setWorkAndEvents(prev => [newEvent, ...prev]);
      return response;
    } catch (err) {
      setError(err);
      console.error('Error creating work and event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update work and event
  const updateWorkAndEvent = async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workAndEventsApi.updateWorkAndEvent(id, formData);
      const updatedEvent = response.success ? response.data : response;
      setWorkAndEvents(prev => 
        prev.map(event => 
          event.works_and_events_id === id ? updatedEvent : event
        )
      );
      return response;
    } catch (err) {
      setError(err);
      console.error('Error updating work and event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete work and event
  const deleteWorkAndEvent = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await workAndEventsApi.deleteWorkAndEvent(id);
      setWorkAndEvents(prev => prev.filter(event => event.works_and_events_id !== id));
    } catch (err) {
      setError(err);
      console.error('Error deleting work and event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load work and events on component mount
  useEffect(() => {
    fetchWorkAndEvents();
  }, []);

  return {
    workAndEvents,
    loading,
    error,
    createWorkAndEvent,
    updateWorkAndEvent,
    deleteWorkAndEvent,
    fetchWorkAndEvents,
  };
};
