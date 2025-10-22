import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const MessagesPage = () => {
  const navigate = useNavigate();

  // Example seller data (replace with actual prop or API data)
  const seller = {
    name: "Crafty Store",
    logo: "https://via.placeholder.com/150", // 🟤 Replace with seller logo URL
  };

  const [messages, setMessages] = useState([
    {
      sender: "seller",
      text: "Hello! How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const newMsg = {
      sender: "you",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-white shadow-md sticky top-0 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mr-2 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          {/* Seller Logo */}
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#a4785a] shadow-md">
            {seller.logo ? (
              <img
                src={seller.logo}
                alt={seller.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#a4785a] text-white text-sm font-bold">
                {seller.name.charAt(0)}
              </div>
            )}
          </div>
          {/* Seller Name */}
          <h1 className="text-xs font-medium text-[#a4785a]">
            Chat with {seller.name}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${
              msg.sender === "you" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Seller Avatar beside messages */}
            {msg.sender === "seller" && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#a4785a] text-white shadow-md">
                {seller.logo ? (
                  <img
                    src={seller.logo}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full font-bold text-xs">
                    {seller.name.charAt(0)}
                  </span>
                )}
              </div>
            )}

            {/* Message Bubble */}
            <div className="flex flex-col max-w-xs">
              <div
                className={`px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
                  msg.sender === "you"
                    ? "bg-[#a4785a] text-white rounded-br-none"
                    : "bg-[#f3e9e4] text-gray-800 rounded-bl-none border border-[#e0cfc4]"
                }`}
              >
                {msg.text}
              </div>
              <span
                className={`text-xs text-gray-500 mt-1 ${
                  msg.sender === "you" ? "text-right" : "text-left"
                }`}
              >
                {msg.time}
              </span>
            </div>

            {/* User Avatar */}
            {msg.sender === "you" && (
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 shadow-md">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white flex items-center gap-2 border-t shadow-inner sticky bottom-0">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-full px-4 border-gray-300 focus:ring-2 focus:ring-[#a4785a]"
        />
        <Button
          onClick={handleSend}
          className="rounded-full p-3 bg-[#a4785a] hover:bg-[#8c664d] shadow-md"
        >
          <Send className="w-5 h-5 text-amber-700" />
        </Button>
      </div>
    </div>
  );
};

export default MessagesPage;
