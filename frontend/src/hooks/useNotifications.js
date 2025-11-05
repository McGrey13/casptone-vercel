import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/notifications', {
        params: {
          per_page: params.perPage || 20,
          type: params.type || undefined,
          read: params.read || undefined,
        },
      });

      setNotifications(response.data.notifications || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      // Don't set error state if it's just an auth issue - user might not be logged in
      if (err.response?.status === 401) {
        setUnreadCount(0);
        setNotifications([]);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count');

      setUnreadCount(response.data.count || 0);
      return response.data.count || 0;
    } catch (err) {
      // Don't log error if it's just auth - user might not be logged in
      if (err.response?.status !== 401) {
        console.error('Error fetching unread count:', err);
      }
      setUnreadCount(0);
      return 0;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark-read`);

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationID === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Update unread count
      await fetchUnreadCount();
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [fetchUnreadCount]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-read');

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );

      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Error marking all as read:', err);
      return false;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);

      // Update local state
      setNotifications(prev => prev.filter(notif => notif.notificationID !== notificationId));

      // Update unread count
      await fetchUnreadCount();
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [fetchUnreadCount]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await api.delete('/notifications/read/delete-all');

      // Update local state - remove all read notifications
      setNotifications(prev => prev.filter(notif => !notif.is_read));

      return true;
    } catch (err) {
      console.error('Error deleting all read notifications:', err);
      return false;
    }
  }, []);

  // Poll for new notifications (for real-time updates)
  useEffect(() => {
    fetchUnreadCount();

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshNotifications: fetchNotifications,
  };
};

export default useNotifications;

