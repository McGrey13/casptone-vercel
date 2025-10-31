import { useState, useEffect, useRef } from "react";
import api from "../../api";

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
        const response = await api.get(`/chat/${conversationId}/messages`);
        const data = Array.isArray(response.data) ? response.data : response.data.messages || [];
        setMessages(data);
        
        // Mark messages as read if user is a seller
        if (user.role === 'seller') {
          try {
            await api.post(`/chat/${conversationId}/mark-read`, {});
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

    // Handle file upload if present
    if (file) {
      try {
        // First upload the file
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        
        const uploadResponse = await api.post(
          `/upload`,
          fileFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        // Add the uploaded file information to the message
        formData.append("attachments[0][file_url]", uploadResponse.data.path);
        formData.append("attachments[0][file_type]", getFileType(file));
      } catch (error) {
        console.error("File upload failed:", error);
        showNotification('error', "Failed to upload file: " + (error.response?.data?.message || "Unknown error"));
        setIsLoading(false);
        setFile(null);
        return;
      }
    }

    try {
      await api.post(
        `/chat/${conversationId}/send`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Re-fetch all messages to get the complete message with attachments
      const response2 = await api.get(`/chat/${conversationId}/messages`);
      const updatedMessages = Array.isArray(response2.data) ? response2.data : response2.data.messages || [];
      setMessages(updatedMessages);
      
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
    <div className="chat-box flex flex-col h-full">
      <div className="messages flex-1 overflow-y-auto mb-4 space-y-3 px-2">
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
                    ? "bg-[#a4785a] text-white" 
                    : "bg-[#f8f1ec] text-[#5c3d28]"
                } shadow`}
              >
                <div className="text-xs mb-1">
                  <span className={`px-2 py-0.5 rounded ${
                    m.sender_id === user.userID ? "bg-white/20 text-white" : "bg-white text-[#7b5a3b]"
                  }`}>
                    {m.message_type}
                  </span>
                </div>
                
                {m.message && <p className="break-words mb-2">{m.message}</p>}
                
                {m.attachments && m.attachments.length > 0 && m.attachments.map((a, i) => (
                  <div key={i} className="mt-2">
                    {a.file_type === "image" ? (
                      <img 
                        src={`http://localhost:8000/storage/${a.messageAttachment}`} 
                        alt="attachment" 
                        className="max-w-full rounded-lg shadow max-h-64 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <a 
                        href={`http://localhost:8000/storage/${a.messageAttachment}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 ${
                          m.sender_id === user.userID ? "text-white" : "text-[#a4785a]"
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
                
                {!m.message && (!m.attachments || m.attachments.length === 0) && (
                  <p className="break-words text-gray-500 italic">📎 Attachment only</p>
                )}
                
                <div className="text-xs mt-1 opacity-75">
                  {new Date(m.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-2 border-t pt-3 px-2 pb-2">
        <div className="flex gap-2">
          <select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            className="border-2 rounded px-2 py-1.5 bg-white text-xs focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a]"
          >
            <option value="general">General</option>
            <option value="custom_request">Customization</option>
            <option value="order_update">Order Update</option>
            <option value="damage_report">Damage Report</option>
            <option value="after_sale">After Sale</option>
          </select>

          {file && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#f8f1ec] border-2 border-[#e5ded7] rounded">
              <span className="text-sm truncate text-[#5c3d28]">{file.name}</span>
              <button 
                onClick={() => setFile(null)}
                className="px-2 py-0.5 rounded bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                title="Remove file"
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
            className="flex-1 border-2 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a]"
            onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />

          <label className="cursor-pointer">
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <div className="w-8 h-8 flex items-center justify-center border-2 border-[#d5bfae] rounded hover:bg-[#f8f1ec] text-lg text-[#5c3d28]">
              📎
            </div>
          </label>

          <button
            onClick={sendMessage}
            disabled={isLoading || (!text.trim() && !file)}
            className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-3 py-1.5 rounded text-sm hover:from-[#8f674a] hover:to-[#6a4c34] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
    