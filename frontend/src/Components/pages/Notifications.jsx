import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';

// Date formatting helper
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();

  // Fetch all notifications when component mounts
  useEffect(() => {
    fetchNotifications({ perPage: 100, read: 'all' });
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.notificationID);
    }
    
    // Navigate to the link if it exists
    if (notification.link) {
      let linkPath = notification.link.trim();
      
      // Ensure link starts with /
      if (linkPath && !linkPath.startsWith('/')) {
        linkPath = `/${linkPath}`;
      }
      
      // For seller notifications, route to appropriate tabs
      if (user?.role === 'seller') {
        if (notification.type === 'order') {
          if (linkPath === '/orders' || linkPath.startsWith('/orders')) {
            linkPath = '/seller';
          } else if (linkPath === '/seller/order-inventory-manager' || linkPath.startsWith('/seller/order-inventory-manager')) {
            linkPath = '/seller';
          }
          navigate(linkPath);
          setTimeout(() => {
            window.location.hash = '#orders';
          }, 50);
          return;
        } else if (notification.type === 'payment') {
          linkPath = '/seller';
          navigate(linkPath);
          setTimeout(() => {
            window.location.hash = '#payments';
          }, 50);
          return;
        } else if (notification.type === 'after_sale') {
          navigate('/seller');
          setTimeout(() => {
            window.location.hash = '#returns';
          }, 100);
          return;
        }
      }
      
      // For customers, ensure they go to customer orders page
      if (notification.type === 'order' && user?.role === 'customer') {
        if (linkPath === '/seller/order-inventory-manager' || linkPath.startsWith('/seller/order-inventory-manager')) {
          linkPath = '/orders';
        }
      }
      
      // Navigate to the link
      if (linkPath && linkPath !== '/') {
        navigate(linkPath);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'message':
        return '💬';
      case 'store_verification':
        return '🏪';
      case 'account_action':
        return '⚙️';
      case 'product':
        return '🛍️';
      case 'payment':
        return '💰';
      case 'after_sale':
        return '🔄';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 border-blue-200';
      case 'payment':
        return 'bg-green-50 border-green-200';
      case 'message':
        return 'bg-purple-50 border-purple-200';
      case 'store_verification':
        return 'bg-green-50 border-green-200';
      case 'account_action':
        return 'bg-orange-50 border-orange-200';
      case 'product':
        return 'bg-pink-50 border-pink-200';
      case 'after_sale':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[#f5f0eb] via-white to-[#ede5dc]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#5c3d28] flex items-center gap-3">
            <Bell className="h-10 w-10 text-[#a4785a]" />
            Notifications
          </h1>
          <p className="text-[#7b5a3b] mt-2">
            {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
          </p>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="mb-6 flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-[#a4785a] text-white rounded-lg hover:bg-[#8b5f46] transition-colors flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </button>
            )}
            <button
              onClick={deleteAllRead}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-[#d5bfae]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#a4785a]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">No notifications</h2>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.notificationID}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-[#a4785a] rounded-full mt-1"></span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.notificationID);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

