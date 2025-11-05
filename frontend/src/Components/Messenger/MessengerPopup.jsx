import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Clock, User, Package } from 'lucide-react';
import api from '../../api';
import { useUser } from '../Context/UserContext';

const MessengerPopup = ({ 
  isOpen, 
  onClose, 
  sellerId, 
  sellerUserId,
  sellerName, 
  sellerAvatar,
  productInfo = null,
  initialMessage = null,
  defaultMessageType = 'general'
}) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState(initialMessage || '');
  const [messageType, setMessageType] = useState(defaultMessageType);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentUserId = async () => {
    // First try to get from UserContext (preferred)
    if (user && user.userID) {
      setCurrentUserId(user.userID);
      return user.userID;
    }
    
    // Fallback to localStorage
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const userId = userData.userID || userData.id;
        setCurrentUserId(userId);
        return userId;
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
      }
    }
    
    // Last resort: API call
    try {
      const response = await api.get('/user');
      const userId = response.data.userID || response.data.id;
      setCurrentUserId(userId);
      return userId;
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getCurrentUserId();
      fetchAllConversations();
      // Set initial message and message type if provided
      if (initialMessage) {
        setNewMessage(initialMessage);
      } else {
        setNewMessage('');
      }
      if (defaultMessageType) {
        setMessageType(defaultMessageType);
      } else {
        setMessageType('general');
      }
      if (sellerId) {
        initializeConversation();
      }
    } else {
      // Reset when popup closes
      setNewMessage('');
      setMessageType('general');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sellerId, user]);
  
  // Update message and type when props change while open
  useEffect(() => {
    if (isOpen) {
      if (initialMessage) {
        setNewMessage(initialMessage);
      }
      if (defaultMessageType) {
        setMessageType(defaultMessageType);
      }
    }
  }, [isOpen, initialMessage, defaultMessageType]);

  const fetchAllConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update current user ID when user context changes
  useEffect(() => {
    if (user && user.userID) {
      setCurrentUserId(user.userID);
    }
  }, [user]);

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        console.error('User not authenticated.');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await api.get(`/conversations/with-seller/${sellerId}`);
        const data = response.data;
        const convId = data.conversation_id || data.id;
        setConversationId(convId);
        if (data.messages) {
          setMessages(data.messages);
        }
        
        // Check if product image should be sent (only if conversation exists but is empty)
        if (productInfo?.productImage && (!data.messages || data.messages.length === 0)) {
          // Send product image with message text if conversation is new/empty
          await sendProductImage(convId, true);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          await createNewConversation();
        } else if (err.response?.status !== 401) {
          throw err;
        }
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      if (error.response?.status !== 401) {
        await createNewConversation();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chat/${conversationId}/messages`);
        const data = Array.isArray(response.data) ? response.data : response.data.messages || [];
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const sendProductImage = async (convId, includeMessageText = false) => {
    if (!productInfo?.productImage || !convId || !sellerUserId) {
      console.log('Missing required data:', { productImage: productInfo?.productImage, convId, sellerUserId });
      return;
    }
    
    try {
      // Always fetch and upload the product image to ensure proper access
      // This ensures the image is in the chat-attachments folder and accessible
      let imagePath = productInfo.productImage;
      let imageUrl = imagePath;
      
      // Convert to full URL if it's a relative path
      if (!imageUrl.startsWith('http')) {
        // If it starts with /storage/, use it as is
        if (imageUrl.startsWith('/storage/')) {
          imageUrl = `${window.location.origin}${imageUrl}`;
        } else if (!imageUrl.startsWith('/')) {
          imageUrl = `${window.location.origin}/storage/${imageUrl}`;
        } else {
          imageUrl = `${window.location.origin}${imageUrl}`;
        }
      }
      
      // Fetch image - try multiple approaches
      let blob;
      let fetchSuccess = false;
      
      // Try 1: Use fetch with credentials (for same-origin or CORS-enabled requests)
      try {
        const response = await fetch(imageUrl, {
          credentials: 'include',
          mode: 'cors'
        });
        if (response.ok) {
          blob = await response.blob();
          fetchSuccess = true;
        }
      } catch (e) {
        console.log('Fetch with credentials failed, trying alternative...');
      }
      
      // Try 2: If fetch failed, try using the API instance
      if (!fetchSuccess) {
        try {
          // Extract the path from the URL
          const urlPath = new URL(imageUrl).pathname;
          const imageResponse = await api.get(urlPath, {
            responseType: 'blob',
            baseURL: window.location.origin // Use the same origin for static files
          });
          blob = imageResponse.data;
          fetchSuccess = true;
        } catch (apiError) {
          console.log('API fetch failed, trying direct backend URL...');
        }
      }
      
      // Try 3: Use backend URL directly (if different from frontend)
      if (!fetchSuccess) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || import.meta.env.VITE_API_BASE_URL || 'https://craftconnect-laravel-backend-2.onrender.com';
          const backendImageUrl = imageUrl.replace(window.location.origin, backendUrl);
          const response = await fetch(backendImageUrl, {
            credentials: 'include',
            mode: 'cors'
          });
          if (response.ok) {
            blob = await response.blob();
            fetchSuccess = true;
          }
        } catch (backendError) {
          console.error('All image fetch methods failed:', backendError);
        }
      }
      
      // If all methods failed, send message without image
      if (!fetchSuccess) {
        console.warn('Could not fetch product image, sending message without image');
        if (includeMessageText) {
          // Send message without image
          const formData = new FormData();
          const msgText = initialMessage || (productInfo 
            ? `Hello! I'm interested in customizing the product "${productInfo.productName}". Could you please provide more details about customization options?`
            : 'Hello! I\'m interested in your products.');
          
          formData.append('message_text', msgText);
          formData.append('message_type', mapMessageType(defaultMessageType || 'product_customize'));
          formData.append('receiver_id', sellerUserId);
          
          await api.post(`/chat/${convId}/send`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          const response2 = await api.get(`/chat/${convId}/messages`);
          const updatedMessages = Array.isArray(response2.data) ? response2.data : response2.data.messages || [];
          setMessages(updatedMessages);
        }
        return;
      }
      
      // Upload the fetched image
      const file = new File([blob], 'product-image.jpg', { type: blob.type || 'image/jpeg' });
      const fileFormData = new FormData();
      fileFormData.append('file', file);
      
      const uploadResponse = await api.post('/upload', fileFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (!uploadResponse.data || !uploadResponse.data.path) {
        throw new Error('Upload response missing path');
      }
      
      imagePath = uploadResponse.data.path; // This is the relative path like 'chat-attachments/...'
      
      // Send message with product image
      const formData = new FormData();
      let msgText = '';
      
      if (includeMessageText) {
        msgText = initialMessage || (productInfo 
          ? `Hello! I'm interested in customizing the product "${productInfo.productName}". Could you please provide more details about customization options?`
          : 'Hello! I\'m interested in your products.');
      }
      
      formData.append('message_text', msgText);
      formData.append('message_type', mapMessageType(defaultMessageType || 'product_customize'));
      formData.append('receiver_id', sellerUserId);
      formData.append('attachments[0][file_url]', imagePath);
      formData.append('attachments[0][file_type]', 'image');
      
      try {
        await api.post(`/chat/${convId}/send`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Refresh messages
        const response2 = await api.get(`/chat/${convId}/messages`);
        const updatedMessages = Array.isArray(response2.data) ? response2.data : response2.data.messages || [];
        setMessages(updatedMessages);
      } catch (sendError) {
        console.error('Error sending message with image:', sendError);
        if (sendError.response) {
          console.error('Response data:', sendError.response.data);
          console.error('Response status:', sendError.response.status);
        }
        throw sendError;
      }
    } catch (error) {
      console.error('Error sending product image:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      // If image send fails, still continue - don't block the conversation
    }
  };

  const createNewConversation = async () => {
    try {
      const initialMsg = initialMessage || (productInfo 
        ? `Hello! I'm interested in customizing the product "${productInfo.productName}". Could you please provide more details about customization options?`
        : 'Hello! I\'m interested in your products.');
      
      // If we have product image, send it with the initial message instead of creating empty conversation
      if (productInfo?.productImage) {
        // Create conversation without initial message, then send message with image
        const response = await api.post('/conversations', {
          seller_id: sellerId,
          initial_message: '', // Empty initial message
          message_type: defaultMessageType || 'product_customize'
        });
        const data = response.data;
        const convId = data.conversation_id || data.id;
        setConversationId(convId);
        
        // Send message with product image and text
        await sendProductImage(convId, true);
      } else {
        // No product image, create conversation normally
        const response = await api.post('/conversations', {
          seller_id: sellerId,
          initial_message: initialMsg,
          message_type: defaultMessageType || 'general'
        });
        const data = response.data;
        const convId = data.conversation_id || data.id;
        setConversationId(convId);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const getFileType = (file) => {
    const type = file.type;
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf" || type.includes("document")) return "document";
    return "other";
  };

  // Map frontend message types to backend valid types
  const mapMessageType = (type) => {
    const validTypes = ['custom_request', 'order_update', 'damage_report', 'after_sale', 'general'];
    // Map 'product_customize' to 'custom_request' for backend
    if (type === 'product_customize') {
      return 'custom_request';
    }
    // Return the type if it's valid, otherwise default to 'general'
    return validTypes.includes(type) ? type : 'general';
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

  const handleConversationClick = async (conv) => {
    setConversationId(conv.conversation_id);
    setIsLoading(true);
    try {
      const response = await api.get(`/chat/${conv.conversation_id}/messages`);
      const data = Array.isArray(response.data) ? response.data : response.data.messages || [];
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    if (!conversationId || isLoading) return;
    
    if (!sellerUserId) {
      console.error('sellerUserId is missing, cannot send message');
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append("message_text", messageText);
    formData.append("message_type", mapMessageType(messageType));
    formData.append("receiver_id", sellerUserId);

    if (file) {
      try {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        
        const uploadResponse = await api.post(`/upload`, fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (!uploadResponse.data || !uploadResponse.data.path) {
          throw new Error('Upload response missing path');
        }

        formData.append("attachments[0][file_url]", uploadResponse.data.path);
        formData.append("attachments[0][file_type]", getFileType(file));
      } catch (error) {
        console.error("File upload failed:", error);
        if (error.response) {
          console.error("Upload error response:", error.response.data);
        }
        setIsLoading(false);
        setFile(null);
        return;
      }
    }

    try {
      // Log what we're sending for debugging
      console.log('Sending message:', {
        conversationId,
        messageText,
        messageType: mapMessageType(messageType),
        receiverId: sellerUserId,
        hasFile: !!file
      });
      
      await api.post(`/chat/${conversationId}/send`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const response2 = await api.get(`/chat/${conversationId}/messages`);
      const updatedMessages = Array.isArray(response2.data) ? response2.data : response2.data.messages || [];
      setMessages(updatedMessages);
      setFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      setNewMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 w-[750px] h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-[#e5ded7] overflow-hidden flex flex-col"
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b]">
            <h3 className="font-semibold text-white flex items-center text-sm">
              <MessageCircle className="h-3 w-3 mr-2" />
              My Chats ({conversations.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const latestMessage = conversation.messages?.[0];
                const isActive = conversation.conversation_id === conversationId;

                return (
                  <button
                    key={conversation.conversation_id}
                    onClick={() => handleConversationClick(conversation)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-[#f8f1ec] border-r-2 border-[#a4785a]' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600`}>
                          <User className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium truncate text-gray-900`}>
                            {conversation.seller?.userName || conversation.receiver?.userName || 'Seller'}
                          </p>
                        </div>
                        
                        {latestMessage && (
                          <>
                            <p className="text-xs truncate mb-1 text-gray-500">
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

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <img 
                src={sellerAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=seller"} 
                alt={sellerName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{sellerName || 'Select a conversation'}</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-all duration-200 focus:outline-none"
            >
              <div className="hover:bg-white/20 rounded-full p-2 transition-all duration-200">
                <X className="h-5 w-5" />
              </div>
            </button>
          </div>

          {/* Product Info Card - Show when productInfo is provided */}
          {productInfo && (
            <div className="bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] border-b border-[#d5bfae] p-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-[#d5bfae] shadow-sm">
                {productInfo.productImage && (
                  <img 
                    src={productInfo.productImage.startsWith('http') ? productInfo.productImage : `/storage/${productInfo.productImage}`}
                    alt={productInfo.productName}
                    className="w-16 h-16 object-cover rounded-lg border border-[#d5bfae]"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-[#a4785a]" />
                    <p className="text-xs font-semibold text-[#5c3d28]">Product of Interest</p>
                  </div>
                  <p className="text-sm font-bold text-[#5c3d28] truncate">{productInfo.productName}</p>
                  {productInfo.productPrice && (
                    <p className="text-xs text-[#7b5a3b]">₱{Number(productInfo.productPrice).toFixed(2)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-[#faf9f8] to-white">
            {isLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a4785a]"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#7b5a3b]">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-[#a4785a]" />
                  </div>
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  // ✅ FIXED ALIGNMENT LOGIC
                  // Customer messages should appear on the right (blue bubble)
                  // Seller messages should appear on the left (gray bubble)
                  // Compare sender_id with current user ID (handle both string and number)
                  const messageSenderId = String(message.sender_id || '');
                  const currentUserIdStr = String(currentUserId || '');
                  const isCustomerMessage = currentUserId && messageSenderId === currentUserIdStr;

                  return (
                    <div
                      key={message.message_id}
                      className={`flex ${isCustomerMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isCustomerMessage
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        {!isCustomerMessage && (
                          <div className="text-xs mb-1">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {message.message_type}
                            </span>
                          </div>
                        )}
                        
                        {message.message && <p className="break-words text-sm font-medium">{message.message}</p>}
                        
                        {message.attachments && message.attachments.length > 0 && message.attachments.map((a, i) => (
                          <div key={i} className="mt-2">
                            {a.file_type === "image" ? (
                              <img 
                                src={`${import.meta.env.VITE_API_BASE_URL || 'https://craftconnect-laravel-backend-2.onrender.com'}/storage/${a.messageAttachment}`} 
                                alt="attachment" 
                                className="max-w-full rounded-lg shadow max-h-64 object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <a 
                                href={`${import.meta.env.VITE_API_BASE_URL || 'https://craftconnect-laravel-backend-2.onrender.com'}/storage/${a.messageAttachment}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-400 hover:underline"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {a.file_type.toUpperCase()} Attachment
                              </a>
                            )}
                          </div>
                        ))}
                        
                        <div className="text-xs mt-1 opacity-75 text-right">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="flex flex-col gap-2 border-t border-[#e5ded7] pt-3 px-3 pb-3 bg-white">
            <div className="flex gap-2">
              <select 
                value={messageType} 
                onChange={e => setMessageType(e.target.value)} 
                className="border border-[#d5bfae] rounded-lg px-3 py-2 bg-white text-xs focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] text-[#5c3d28]"
              >
                <option value="general">General</option>
                <option value="product_customize">Product Customize</option>
                <option value="after_sale">After Sale</option>
              </select>

              {file && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f1ec] rounded-lg border border-[#e5ded7]">
                  <span className="text-xs truncate text-[#5c3d28]">{file.name}</span>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 border border-[#d5bfae] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] text-[#5c3d28] placeholder:text-[#7b5a3b]/50"
                disabled={isLoading}
              />

              <label className="cursor-pointer">
                <input
                  type="file"
                  onChange={e => setFile(e.target.files[0])}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <div className="w-9 h-9 flex items-center justify-center border border-[#d5bfae] rounded-lg hover:bg-[#f8f1ec] text-lg transition-colors">
                  📎
                </div>
              </label>

              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() && !file || isLoading}
                className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-4 py-2 rounded-lg text-sm hover:from-[#8f674a] hover:to-[#6a4a32] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-all"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessengerPopup;
