// frontend/src/pages/Support.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiQuestionMarkCircle,
  HiChatAlt,
  HiDocumentText,
  HiInformationCircle,
  HiSearch,
  HiPlus,
  HiChevronRight,
  HiArrowRight,
  HiPaperAirplane,
  HiOutlineTag,
  HiExclamationCircle,
  HiCheck
} from "react-icons/hi";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { formatDate } from "../utils/dateFormat";
import { toast } from "react-toastify";

const Support = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("faq");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTickets, setUserTickets] = useState([]);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newTicketData, setNewTicketData] = useState({
    subject: "",
    category: "",
    message: "",
    priority: "medium"
  });
  const [expandedFaq, setExpandedFaq] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === "faq") {
      fetchFAQ();
    } else if (activeTab === "tickets" && auth.isAuthenticated) {
      fetchUserTickets();
    }
  }, [activeTab, auth.isAuthenticated]);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetails(selectedTicket);
    }
  }, [selectedTicket]);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketMessages]);

  const fetchFAQ = async () => {
    setLoading(true);
    try {
      const response = await api.get("/support/faq");
      setFaqData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching FAQ:", err);
      setError("Не удалось загрузить часто задаваемые вопросы");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/support/tickets");
      setUserTickets(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user tickets:", err);
      setError("Не удалось загрузить ваши обращения");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await api.get(`/support/ticket/${ticketId}`);
      setTicketMessages(response.data.messages || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      setError("Не удалось загрузить детали обращения");
    }
  };

  const handleNewTicket = async () => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }

    // Validate form
    if (!newTicketData.subject.trim()) {
      toast.error("Укажите тему обращения");
      return;
    }
    if (!newTicketData.category) {
      toast.error("Выберите категорию");
      return;
    }
    if (!newTicketData.message.trim()) {
      toast.error("Введите сообщение");
      return;
    }

    try {
      await api.post("/support/ticket", newTicketData);
      toast.success("Обращение успешно создано");
      setNewTicketModalOpen(false);
      setNewTicketData({
        subject: "",
        category: "",
        message: "",
        priority: "medium"
      });
      fetchUserTickets(); // Refresh tickets
      setActiveTab("tickets"); // Switch to tickets tab
    } catch (err) {
      console.error("Error creating ticket:", err);
      toast.error("Не удалось создать обращение");
    }
  };

  const handleReplyToTicket = async () => {
    if (!selectedTicket || !newMessage.trim()) {
      return;
    }

    try {
      await api.post(`/support/ticket/${selectedTicket}/reply`, {
        message: newMessage
      });
      
      // Add message to UI optimistically
      setTicketMessages((prev) => [
        ...prev,
        {
          sender: { _id: auth.user.id, firstName: auth.user.firstName, lastName: auth.user.lastName },
          content: newMessage,
          timestamp: new Date()
        }
      ]);
      
      setNewMessage("");
      // In a real app, you might want to fetch the updated ticket
    } catch (err) {
      console.error("Error replying to ticket:", err);
      toast.error("Не удалось отправить сообщение");
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) {
      return;
    }

    try {
      await api.patch(`/support/ticket/${selectedTicket}/close`);
      toast.success("Обращение закрыто");
      fetchUserTickets(); // Refresh tickets
      setSelectedTicket(null); // Clear selected ticket
    } catch (err) {
      console.error("Error closing ticket:", err);
      toast.error("Не удалось закрыть обращение");
    }
  };

  const toggleFaqExpand = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const filteredFaq = faqData.filter((item) =>
    searchQuery
      ? item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const getTicketStatusName = (status) => {
    const statusMap = {
      open: "Открыт",
      "in-progress": "В работе",
      resolved: "Решен",
      closed: "Закрыт"
    };
    return statusMap[status] || status;
  };

  const getTicketCategoryName = (category) => {
    const categoryMap = {
      account: "Аккаунт",
      payment: "Оплата",
      technical: "Технический вопрос",
      verification: "Верификация",
      report: "Жалоба",
      other: "Другое"
    };
    return categoryMap[category] || category;
  };

  const getTicketStatusColor = (status) => {
    const colorMap = {
      open: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Поддержка</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 ${
            activeTab === "faq"
              ? "border-b-2 border-primary-600 text-primary-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("faq")}
        >
          Часто задаваемые вопросы
        </button>
        <button
          className={`py-3 px-6 ${
            activeTab === "tickets"
              ? "border-b-2 border-primary-600 text-primary-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => {
            if (auth.isAuthenticated) {
              setActiveTab("tickets");
            } else {
              navigate("/login");
            }
          }}
        >
          Мои обращения
        </button>
      </div>
      
      {/* FAQ Section */}
      {activeTab === "faq" && (
        <div>
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <h2 className="text-xl font-semibold mb-4 md:mb-0">Часто задаваемые вопросы</h2>
              
              <div className="w-full md:w-auto flex items-center">
                <div className="relative flex-grow md:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg border-gray-300 pr-10 w-full focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Поиск в FAQ..."
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <HiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <button
                  onClick={() => setNewTicketModalOpen(true)}
                  className="btn-primary ml-4 flex items-center"
                >
                  <HiPlus className="mr-1 h-5 w-5" />
                  Новое обращение
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : filteredFaq.length === 0 ? (
              <div className="text-center py-12">
                <HiQuestionMarkCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Ничего не найдено
                </h3>
                <p className="mt-1 text-gray-500">
                  Попробуйте изменить запрос или создайте новое обращение
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaq.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaqExpand(index)}
                      className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                    >
                      <h3 className="font-medium text-gray-900">{item.question}</h3>
                      <HiChevronRight
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedFaq === index ? "transform rotate-90" : ""
                        }`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 py-3 bg-gray-50 border-t border-gray-200"
                        >
                          <p className="text-gray-700">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Additional Help Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <HiChatAlt className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Онлайн чат</h3>
              <p className="text-gray-600 text-center mb-4">
                Получите мгновенную помощь от нашей команды поддержки через онлайн чат.
              </p>
              <button className="btn-outline w-full">Начать чат</button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <HiDocumentText className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">База знаний</h3>
              <p className="text-gray-600 text-center mb-4">
                Просмотрите нашу обширную базу знаний для получения подробной информации.
              </p>
              <button className="btn-outline w-full">Открыть базу знаний</button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <HiInformationCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Справка</h3>
              <p className="text-gray-600 text-center mb-4">
                Ознакомьтесь с нашими руководствами по использованию платформы.
              </p>
              <button className="btn-outline w-full">Перейти к справке</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tickets Section */}
      {activeTab === "tickets" && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tickets List */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Мои обращения</h2>
                <button
                  onClick={() => setNewTicketModalOpen(true)}
                  className="btn-primary flex items-center text-sm py-1.5"
                >
                  <HiPlus className="mr-1 h-4 w-4" />
                  Новое
                </button>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : userTickets.length === 0 ? (
                <div className="text-center py-12">
                  <HiQuestionMarkCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    У вас пока нет обращений
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Нажмите кнопку "Новое", чтобы создать обращение
                  </p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[70vh]">
                  {userTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket._id)}
                      className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition ${
                        selectedTicket === ticket._id
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {ticket.subject}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${getTicketStatusColor(
                            ticket.status
                          )}`}
                        >
                          {getTicketStatusName(ticket.status)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 line-clamp-1">
                        {getTicketCategoryName(ticket.category)}
                      </div>
                      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                        <span>{formatDate(ticket.createdAt)}</span>
                        {ticket.lastResponseBy === "admin" && (
                          <span className="text-primary-600 font-medium">
                            Новый ответ
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Ticket Details */}
          <div className="w-full md:w-2/3">
            {selectedTicket ? (
              <div className="bg-white rounded-xl shadow-md h-full flex flex-col">
                {/* Ticket Header */}
                <div className="p-6 border-b border-gray-200">
                  {userTickets.find(ticket => ticket._id === selectedTicket) && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {userTickets.find(ticket => ticket._id === selectedTicket).subject}
                          </h2>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <HiOutlineTag className="mr-1 h-4 w-4" />
                            {getTicketCategoryName(
                              userTickets.find(ticket => ticket._id === selectedTicket).category
                            )}
                            <span className="mx-2">•</span>
                            {formatDate(
                              userTickets.find(ticket => ticket._id === selectedTicket).createdAt
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${getTicketStatusColor(
                            userTickets.find(ticket => ticket._id === selectedTicket).status
                          )}`}
                        >
                          {getTicketStatusName(
                            userTickets.find(ticket => ticket._id === selectedTicket).status
                          )}
                        </span>
                      </div>
                      {["open", "in-progress"].includes(
                        userTickets.find(ticket => ticket._id === selectedTicket).status
                      ) && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={handleCloseTicket}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            Закрыть обращение
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Messages */}
                <div className="flex-grow p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {ticketMessages.map((message, index) => (
                      <div key={index} className="flex">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ${
                            message.isAdmin ? "bg-primary-100" : ""
                          }`}
                        >
                          <HiUser className={`h-6 w-6 ${
                            message.isAdmin ? "text-primary-600" : "text-gray-400"
                          }`} />
                        </div>
                        <div className="ml-3 flex-grow">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {message.isAdmin
                                ? "Служба поддержки"
                                : `${message.sender?.firstName || "Вы"} ${message.sender?.lastName || ""}`}
                            </p>
                            <span className="ml-2 text-xs text-gray-500">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                {/* Reply Input */}
                {["open", "in-progress"].includes(
                  userTickets.find(ticket => ticket._id === selectedTicket)?.status
                ) && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Напишите сообщение..."
                        className="flex-grow rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleReplyToTicket();
                          }
                        }}
                      />
                      <button
                        onClick={handleReplyToTicket}
                        disabled={!newMessage.trim()}
                        className={`ml-3 p-2 rounded-full text-white ${
                          newMessage.trim()
                            ? "bg-primary-600 hover:bg-primary-700"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                      >
                        <HiPaperAirplane className="h-5 w-5 transform rotate-90" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 h-full flex flex-col items-center justify-center text-center">
                <HiQuestionMarkCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Выберите обращение
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Выберите обращение из списка или создайте новое, если у вас возникли вопросы или проблемы.
                </p>
                <button
                  onClick={() => setNewTicketModalOpen(true)}
                  className="btn-primary flex items-center"
                >
                  <HiPlus className="mr-2 h-5 w-5" />
                  Создать обращение
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* New Ticket Modal */}
      <AnimatePresence>
        {newTicketModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
            onClick={() => setNewTicketModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Новое обращение
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Тема <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newTicketData.subject}
                    onChange={(e) =>
                      setNewTicketData({ ...newTicketData, subject: e.target.value })
                    }
                    className="input-field w-full"
                    placeholder="Кратко опишите вашу проблему"
                  />
                </div>
                
                <div>
                  <label className="form-label">Категория <span className="text-red-500">*</span></label>
                  <select
                    value={newTicketData.category}
                    onChange={(e) =>
                      setNewTicketData({ ...newTicketData, category: e.target.value })
                    }
                    className="input-field w-full"
                  >
                    <option value="">Выберите категорию</option>
                    <option value="account">Аккаунт</option>
                    <option value="payment">Оплата</option>
                    <option value="technical">Технический вопрос</option>
                    <option value="verification">Верификация</option>
                    <option value="report">Жалоба</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Приоритет</label>
                  <select
                    value={newTicketData.priority}
                    onChange={(e) =>
                      setNewTicketData({ ...newTicketData, priority: e.target.value })
                    }
                    className="input-field w-full"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочный</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Сообщение <span className="text-red-500">*</span></label>
                  <textarea
                    value={newTicketData.message}
                    onChange={(e) =>
                      setNewTicketData({ ...newTicketData, message: e.target.value })
                    }
                    rows={5}
                    className="input-field w-full"
                    placeholder="Опишите вашу проблему подробно..."
                  ></textarea>
                </div>
                
                <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <HiInformationCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="ml-3 text-sm text-blue-700">
                    Наша команда поддержки ответит вам в течение 24 часов в рабочее время.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setNewTicketModalOpen(false)}
                    className="btn-outline"
                  >
                    Отмена
                  </button>
                  <button onClick={handleNewTicket} className="btn-primary">
                    Отправить
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Support;
