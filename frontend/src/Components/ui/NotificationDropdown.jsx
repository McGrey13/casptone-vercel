import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import { useNavigate, Link } from 'react-router-dom';
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

const NotificationDropdown = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
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

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications({ perPage: 10, read: 'all' });
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.notificationID);
    }
    
    // Close dropdown
    setIsOpen(false);
    
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
          // Order notifications → Orders & Shipping tab in SellerLayout, then Orders sub-tab
          if (linkPath === '/orders' || linkPath.startsWith('/orders')) {
            linkPath = '/seller';
          } else if (linkPath === '/seller/order-inventory-manager' || linkPath.startsWith('/seller/order-inventory-manager')) {
            linkPath = '/seller';
          }
          // Navigate first, then set hash after a brief delay to ensure component is mounted
          navigate(linkPath);
          setTimeout(() => {
            window.location.hash = '#orders';
          }, 50);
          return; // Early return to prevent double navigation
        } else if (notification.type === 'payment') {
          // Payment notifications → Payments tab
          linkPath = '/seller';
          navigate(linkPath);
          setTimeout(() => {
            window.location.hash = '#payments';
          }, 50);
          return; // Early return to prevent double navigation
        } else if (notification.type === 'after_sale') {
          // After-sale (return/refund) notifications → Orders & Shipping tab, then Return/Refund sub-tab
          // Navigate to /seller first, then set hash to #returns
          navigate('/seller');
          // Use a longer timeout to ensure SellerLayout has mounted and OrderInventoryManager is rendered
          setTimeout(() => {
            window.location.hash = '#returns';
            // Force a second update after a brief delay to ensure all components have processed
            setTimeout(() => {
              window.location.hash = '#returns';
            }, 100);
          }, 100);
          return; // Early return to prevent double navigation
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
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 rounded-lg hover:bg-[#a4785a]/10 transition-all duration-200"
        aria-label="Notifications"
        title="Notifications"
      >
        <div className="relative p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-[60] max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm">No notifications</p>
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
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.is_read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.notificationID);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-[#a4785a] hover:text-[#8b5f46] font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

