import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, User } from 'lucide-react';
import api from '../../api';

const ConversationList = ({ onSelectConversation, currentConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      setError(null);
      const token = sessionStorage.getItem('auth_token');
      console.log('Fetching conversations with token:', token ? 'present' : 'missing');
      
      if (!token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const response = await api.get('/chat/seller/conversations');
      console.log('Conversations API response:', response.data);
      setConversations(response.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load conversations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="w-48 sm:w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 text-sm">Customer Messages</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a4785a]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-48 sm:w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center text-sm">
          <MessageCircle className="h-3 w-3 mr-2 text-[#a4785a]" />
          Messages ({conversations.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-center text-red-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-red-300" />
            <p className="text-sm font-medium">Error loading conversations</p>
            <p className="text-xs mt-1">{error}</p>
            <button 
              onClick={fetchConversations}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const latestMessage = conversation.messages?.[0];
            const isActive = conversation.conversation_id === currentConversationId;
            const hasUnread = latestMessage && !latestMessage.is_read && latestMessage.sender_id !== sessionStorage.getItem('user_id');

            return (
              <button
                key={conversation.conversation_id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-[#f8f1ec] border-r-2 border-[#a4785a]' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      hasUnread ? 'bg-[#a4785a] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium truncate ${
                        hasUnread ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {conversation.sender?.userName || 'Customer'}
                      </p>
                      {hasUnread && (
                        <div className="w-2 h-2 bg-[#a4785a] rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    
                    {latestMessage && (
                      <>
                        <p className={`text-xs truncate mb-1 ${
                          hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'
                        }`}>
                          {latestMessage.message || '📎 Attachment'}
                        </p>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeAgo(latestMessage.created_at)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;

