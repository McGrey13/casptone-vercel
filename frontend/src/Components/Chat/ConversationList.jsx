import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, User } from 'lucide-react';

const ConversationList = ({ onSelectConversation, currentConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8080/api/chat/seller/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
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
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Customer Messages</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a4785a]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <MessageCircle className="h-4 w-4 mr-2 text-[#a4785a]" />
          Customer Messages ({conversations.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
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

