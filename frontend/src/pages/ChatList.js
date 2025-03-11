// frontend/src/pages/ChatList.js
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiChat, HiClock, HiUser, HiDotsVertical, HiSearch } from "react-icons/hi";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { formatRelativeTime } from "../utils/dateFormat";

const ChatList = () => {
  const { auth } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      if (!auth.isAuthenticated) return;

      try {
        const response = await api.get("/chat");
        setChats(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Не удалось загрузить список чатов");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [auth.isAuthenticated]);

  const getOtherParticipant = (chat) => {
    return chat.participants.find(
      (participant) => participant._id !== auth.user.id
    );
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return "Нет сообщений";
    }
    return chat.messages[chat.messages.length - 1].content;
  };

  const getUnreadCount = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 0;
    }
    return chat.messages.filter(
      (msg) => !msg.read && msg.sender !== auth.user.id
    ).length;
  };

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const otherUser = getOtherParticipant(chat);
    return (
      otherUser?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.ad?.title &&
        chat.ad.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Сообщения</h1>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="Поиск по сообщениям..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <HiChat className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            У вас пока нет сообщений
          </h3>
          <p className="mt-1 text-gray-500">
            Перейдите к объявлениям, чтобы начать общение
          </p>
          <div className="mt-6">
            <Link to="/browse" className="btn-primary">
              Найти объявления
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredChats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const lastMessage = getLastMessage(chat);
              const unreadCount = getUnreadCount(chat);

              return (
                <motion.li
                  key={chat._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50"
                >
                  <Link
                    to={`/chat/${chat._id}`}
                    className="block px-6 py-5 relative"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {otherUser?.profilePicture ? (
                          <img
                            src={otherUser.profilePicture}
                            alt={`${otherUser.firstName} ${otherUser.lastName}`}
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <HiUser className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-medium text-gray-900">
                            {otherUser
                              ? `${otherUser.firstName} ${otherUser.lastName}`
                              : "Неизвестный пользователь"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <HiClock className="mr-1" />
                            {formatRelativeTime(chat.lastMessage)}
                          </p>
                        </div>
                        {chat.ad && (
                          <p className="text-xs text-primary-600 mt-1">
                            {chat.ad.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {lastMessage}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-600 text-white text-xs font-medium">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatList;
