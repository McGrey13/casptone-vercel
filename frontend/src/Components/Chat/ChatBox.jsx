import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Helper function for notifications until react-hot-toast is installed
const showNotification = (type, message) => {
  if (type === 'error') {
    console.error(message);
    alert(message);
  } else if (type === 'success') {
    console.log(message);
    // You can uncomment the line below if you want to show success alerts
    // alert(message);
  }
};

export default function ChatBox({ conversationId, user, customer }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState("general");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chat/${conversationId}/messages`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
          }
        });
        const data = Array.isArray(response.data) ? response.data : response.data.messages || [];
        setMessages(data);
        
        // Mark messages as read if user is a seller
        if (user.role === 'seller') {
          try {
            await axios.post(`/api/chat/${conversationId}/mark-read`, {}, {
              headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
              }
            });
          } catch (err) {
            console.error("Failed to mark messages as read:", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        alert("Failed to load messages");
        setMessages([]);
      }
    };

    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [conversationId, user.role]);

  const sendMessage = async () => {
    if (!text.trim() && !file) {
      showNotification('error', "Please enter a message or select a file");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("message_text", text);
    formData.append("message_type", type);
    formData.append("receiver_id", customer?.userID || user.id);

    if (file) {
      try {
        // First upload the file
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        
        const uploadResponse = await axios.post(
          `/api/upload`,
          fileFormData,
          {
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        // Add the uploaded file information to the message
        formData.append("attachments[0][file_url]", uploadResponse.data.path);
        formData.append("attachments[0][file_type]", getFileType(file));
      } catch (error) {
        console.error("File upload failed:", error);
        showNotification('error', "Failed to upload file");
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await axios.post(
        `/api/chat/${conversationId}/send`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const newMessage = response.data;
      
      // Only update messages if we haven't received it through websockets
      if (!messages.find(m => m.id === newMessage.id)) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      setText("");    
      setFile(null);
      showNotification('success', "Message sent successfully");
    } catch (err) {
      console.error("Message failed to send:", err);
      showNotification('error', err.response?.data?.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileType = (file) => {
    const type = file.type;
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf" || type.includes("document")) return "document";
    return "other";
  };

  return (
    <div className="chat-box border p-4 rounded-lg bg-white shadow">
      <div className="messages h-96 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          Array.isArray(messages) && messages.map(m => (
            <div 
              key={m.message_id || m.id} 
              className={`flex ${m.sender_id === user.userID ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[70%] rounded-lg p-3 ${
                  m.sender_id === user.userID 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="text-xs mb-1">
                  <span className={`px-2 py-0.5 rounded ${
                    m.sender_id === user.userID ? "bg-blue-600" : "bg-gray-200"
                  }`}>
                    {m.message_type}
                  </span>
                </div>
                
                <p className="break-words">{m.message || "📎 Attachment only"}</p>
                
                {m.attachments && m.attachments.map((a, i) => (
                  <div key={i} className="mt-2">
                    {a.file_type === "image" ? (
                      <img 
                        src={`/storage/${a.file_url}`} 
                        alt="attachment" 
                        className="max-w-full rounded-lg shadow"
                        loading="lazy"
                      />
                    ) : (
                      <a 
                        href={`/storage/${a.file_url}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 ${
                          m.sender_id === user.userID ? "text-blue-100" : "text-blue-500"
                        } hover:underline`}
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
                
                <div className="text-xs mt-1 opacity-75">
                  {new Date(m.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-3 border-t pt-4">
        <div className="flex gap-2">
          <select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            className="border rounded px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="general">General</option>
            <option value="custom_request">Customization</option>
            <option value="order_update">Order Update</option>
            <option value="damage_report">Damage Report</option>
            <option value="after_sale">After Sale</option>
          </select>

          {file && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded">
              <span className="text-sm truncate">{file.name}</span>
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
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />

          <label className="cursor-pointer">
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <div className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-50">
              📎
            </div>
          </label>

          <button
            onClick={sendMessage}
            disabled={isLoading || (!text.trim() && !file)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>Send</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
    