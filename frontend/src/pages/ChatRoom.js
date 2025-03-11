// frontend/src/pages/ChatRoom.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import {
  HiArrowLeft,
  HiPaperAirplane,
  HiPhotograph,
  HiUser,
  HiCheckCircle,
  HiDotsVertical,
  HiCalendar,
  HiClock,
} from "react-icons/hi";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { formatDate, formatTime } from "../utils/dateFormat";

const ChatRoom = () => {
  const { chatId } = useParams();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Connect to Socket.IO
    const socketInstance = io(process.env.REACT_APP_API_URL.replace("/api", ""));
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket && chatId) {
      // Join the chat room
      socket.emit("joinRoom", chatId);

      // Listen for new messages
      socket.on("chat message", (msg) => {
        if (msg.chatId === chatId) {
          setMessages((prev) => [...prev, msg]);
          
          // Mark messages as read if they're from the other user
          if (msg.sender !== auth.user.id) {
            markMessagesAsRead();
          }
        }
      });

      // Listen for typing indicators
      socket.on("typing", (data) => {
        if (data.chatId === chatId && data.userId !== auth.user.id) {
          setOtherUserTyping(data.isTyping);
        }
      });

      // Cleanup listeners on unmount
      return () => {
        socket.off("chat message");
        socket.off("typing");
        socket.emit("leaveRoom", chatId);
      };
    }
  }, [socket, chatId, auth.user.id]);

  useEffect(() => {
    const fetchChat = async () => {
      if (!auth.isAuthenticated) return;

      try {
        const response = await api.get(`/chat/${chatId}`);
        setChat(response.data);
        setMessages(response.data.messages || []);
        
        // Determine which user is the other participant
        const other = response.data.participants.find(
          (participant) => participant._id !== auth.user.id
        );
        setOtherUser(other);
        
        // Mark messages as read
        markMessagesAsRead();
        
        setError(null);
      } catch (err) {
        console.error("Error fetching chat:", err);
        setError("Не удалось загрузить чат");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, auth.isAuthenticated, auth.user.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markMessagesAsRead = async () => {
    try {
      await api.patch(`/chat/${chatId}/read`);
      
      // Update read status in UI
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.sender !== auth.user.id && !msg.read) {
            return { ...msg, read: true, readAt: new Date() };
          }
          return msg;
        })
      );
      
      // Emit read status to socket
      if (socket) {
        socket.emit("message read", { chatId, userId: auth.user.id });
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === "") return;
    
    try {
      await api.post(`/chat/${chatId}/message`, { content: newMessage.trim() });
      setNewMessage("");
      
      // Stop typing indicator
      handleStopTyping();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleTyping = () => {
    if (!socket) return;
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Only emit if not already typing
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        chatId,
        userId: auth.user.id,
        isTyping: true
      });
    }
    
    // Set timeout to stop typing indicator
    const timeout = setTimeout(() => {
      handleStopTyping();
    }, 3000);
    
    setTypingTimeout(timeout);
  };

  const handleStopTyping = () => {
    if (!socket) return;
    
    setIsTyping(false);
    socket.emit("typing", {
      chatId,
      userId: auth.user.id,
      isTyping: false
    });
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real implementation, you would upload the file to your server
    // and then send the URL as an attachment in the message
    console.log("File selected:", file);
    
    // For now, we'll just add the filename to the message
    setNewMessage(`[Файл: ${file.name}]`);
  };

  const handleArchiveChat = async () => {
    try {
      await api.patch(`/chat/${chatId}/archive`);
      navigate("/chat");
    } catch (err) {
      console.error("Error archiving chat:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center">
              <Link to="/chat" className="mr-4 text-gray-500 hover:text-gray-700">
                <HiArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                {otherUser?.profilePicture ? (
                  <img
                    src={otherUser.profilePicture}
                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <HiUser className="h-5 w-5" />
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {otherUser
                      ? `${otherUser.firstName} ${otherUser.lastName}`
                      : "Неизвестный пользователь"}
                  </p>
                  {otherUserTyping && (
                    <p className="text-xs text-primary-600">Печатает...</p>
                  )}
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiDotsVertical className="h-5 w-5" />
              </button>
              
              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                  <div className="py-1">
                    {chat.ad && (
                      <Link
                        to={`/ad/${chat.ad._id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Перейти к объявлению
                      </Link>
                    )}
                    <button
                      onClick={() => setScheduleModalOpen(true)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Назначить встречу
                    </button>
                    <button
                      onClick={handleArchiveChat}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Архивировать чат
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Messages */}
          <div className="p-4 h-[60vh] overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Начните общение, отправив сообщение
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isSender = message.sender === auth.user.id;
                  const showDate =
                    index === 0 ||
                    new Date(message.timestamp).toDateString() !==
                      new Date(messages[index - 1].timestamp).toDateString();
                  
                  return (
                    <React.Fragment key={index}>
                      {showDate && (
                        <div className="flex justify-center">
                          <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${
                          isSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 ${
                            isSender
                              ? "bg-primary-600 text-white"
                              : "bg-white text-gray-800 border border-gray-200"
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div
                            className={`text-xs mt-1 flex justify-end items-center ${
                              isSender ? "text-primary-100" : "text-gray-500"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                            {isSender && message.read && (
                              <HiCheckCircle
                                className="ml-1 h-3 w-3 text-green-300"
                                title="Прочитано"
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Message Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="text-gray-500 hover:text-gray-700 mr-3"
              >
                <HiPhotograph className="h-6 w-6" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleTyping}
                className="flex-1 rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Введите сообщение..."
              />
              <button
                type="submit"
                className="ml-3 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 focus:outline-none"
                disabled={newMessage.trim() === ""}
              >
                <HiPaperAirplane className="h-5 w-5 transform rotate-90" />
              </button>
            </form>
          </div>
          
          {/* Schedule Meeting Modal */}
          <AnimatePresence>
            {scheduleModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
                onClick={() => setScheduleModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Назначить встречу
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Дата и время</label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            className="pl-10 input-field w-full"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiClock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="time"
                            className="pl-10 input-field w-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Место встречи</label>
                      <input
                        type="text"
                        className="input-field w-full"
                        placeholder="Введите адрес"
                      />
                    </div>
                    <div>
                      <label className="form-label">Дополнительная информация</label>
                      <textarea
                        className="input-field w-full h-24"
                        placeholder="Дополнительные детали встречи..."
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setScheduleModalOpen(false)}
                        className="btn-outline"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => {
                          // In a real implementation, this would save the schedule
                          setScheduleModalOpen(false);
                          // And send a message about the meeting
                          setNewMessage("Я предлагаю встретиться [Детали встречи]");
                        }}
                        className="btn-primary"
                      >
                        Подтвердить
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
