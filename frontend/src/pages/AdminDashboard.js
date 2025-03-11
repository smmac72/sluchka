// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiUsers,
  HiTag,
  HiDocument,
  HiCash,
  HiQuestionMarkCircle,
  HiChevronDown,
  HiChevronUp,
  HiCheck,
  HiX,
  HiSearch,
  HiEye,
  HiPencil,
  HiTrash,
  HiUserCircle,
  HiCheckCircle,
  HiClock,
  HiViewList
} from "react-icons/hi";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { formatDate } from "../utils/dateFormat";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }

    // In a real app, check if user is admin
    if (!auth.user.isAdmin) {
      navigate("/");
      toast.error("У вас нет доступа к панели администратора");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Не удалось загрузить данные панели администратора");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [auth.isAuthenticated, auth.user, navigate]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "ads") {
      fetchAds();
    } else if (activeTab === "documents") {
      fetchPendingDocuments();
    } else if (activeTab === "support") {
      fetchSupportTickets();
    }
  }, [activeTab, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=10`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Не удалось загрузить список пользователей");
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/ads?page=${page}&limit=10`);
      setAds(response.data.ads);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (err) {
      console.error("Error fetching ads:", err);
      setError("Не удалось загрузить список объявлений");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/documents/pending");
      setPendingDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending documents:", err);
      setError("Не удалось загрузить список документов на проверке");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/support/tickets");
      setSupportTickets(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching support tickets:", err);
      setError("Не удалось загрузить список обращений в поддержку");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    // Implement search functionality
    toast.info("Функция поиска будет реализована в будущих версиях");
  };

  const verifyUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`);
      toast.success("Пользователь верифицирован");
      fetchUsers();
    } catch (err) {
      console.error("Error verifying user:", err);
      toast.error("Не удалось верифицировать пользователя");
    }
  };

  const moderateAd = async (adId, approved) => {
    try {
      await api.patch(`/admin/ads/${adId}/moderate`, { approved });
      toast.success(approved ? "Объявление одобрено" : "Объявление отклонено");
      fetchAds();
    } catch (err) {
      console.error("Error moderating ad:", err);
      toast.error("Не удалось обработать объявление");
    }
  };

  const verifyDocument = async (documentId) => {
    try {
      await api.patch(`/documents/${documentId}/verify`);
      toast.success("Документ верифицирован");
      fetchPendingDocuments();
    } catch (err) {
      console.error("Error verifying document:", err);
      toast.error("Не удалось верифицировать документ");
    }
  };

  const assignTicket = async (ticketId) => {
    try {
      await api.patch(`/admin/support/tickets/${ticketId}/assign`);
      toast.success("Тикет назначен вам");
      fetchSupportTickets();
    } catch (err) {
      console.error("Error assigning ticket:", err);
      toast.error("Не удалось назначить тикет");
    }
  };

  const getDocumentTypeName = (type) => {
    const typeMap = {
      veterinary: "Ветеринарный документ",
      pedigree: "Родословная",
      award: "Награда/Диплом",
      chip: "Чип"
    };
    return typeMap[type] || type;
  };

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

  const getTicketPriorityName = (priority) => {
    const priorityMap = {
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
      urgent: "Срочный"
    };
    return priorityMap[priority] || priority;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6">
        <div className="flex space-x-1">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded-md ${
                page === i + 1
                  ? "bg-primary-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вперед
          </button>
        </div>
      </div>
    );
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Панель администратора</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`py-3 px-6 ${
            activeTab === "dashboard"
              ? "border-b-2 border-primary-600 text-primary-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          Обзор
        </button>
        <button
          className={`py-3 px-6 ${
            activeTab === "users"
              ? "border-b-2 border-primary-600 text-primary-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Пользователи
        </button>
        <button
          className={`py-3 px-6 ${
            activeTab === "ads"
              ? "border-b-2 border-primary-600 text-primary-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("ads")}
        >
          Объявления
        </button>
        <button
          className={`py-3 px-6 ${
            activeTab === "documents"
              ? "border-b-2 border-primary-600 text-primary-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("documents")}
        >
          Документы
        </button>
        <button
          className={`py-3 px-6 ${
            activeTab === "support"
              ? "border-b-2 border-primary-600 text-primary-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("support")}
        >
          Поддержка
        </button>
        <button
          className={`py-3 px-6 ${
            activeTab === "analytics"
              ? "border-b-2 border-primary-600 text-primary-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Аналитика
        </button>
      </div>
      
      {/* Dashboard Overview */}
      {activeTab === "dashboard" && dashboardData && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-500 font-medium">Пользователи</h3>
                <div className="p-2 bg-blue-100 rounded-full">
                  <HiUsers className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">{dashboardData.userCount}</div>
              <div className="mt-2 text-sm text-green-600">
                +{dashboardData.newUsersToday} сегодня
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-500 font-medium">Объявления</h3>
                <div className="p-2 bg-purple-100 rounded-full">
                  <HiTag className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">{dashboardData.adCount}</div>
              <div className="mt-2 text-sm text-gray-600">
                {dashboardData.activeAds} активных
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-500 font-medium">Документы</h3>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <HiDocument className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">{dashboardData.documentCount}</div>
              <div className="mt-2 text-sm text-gray-600">
                {dashboardData.pendingDocuments} на проверке
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-500 font-medium">Доход</h3>
                <div className="p-2 bg-green-100 rounded-full">
                  <HiCash className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">{dashboardData.transactionTotal.toLocaleString()} ₽</div>
              <div className="mt-2 text-sm text-gray-600">
                {dashboardData.transactionCount} транзакций
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Новые пользователи</h3>
              <div className="space-y-4">
                {dashboardData.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <HiUserCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3 flex-grow">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Новые объявления</h3>
              <div className="space-y-4">
                {dashboardData.recentAds.map((ad) => (
                  <div key={ad._id} className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <HiTag className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3 flex-grow">
                      <p className="text-sm font-medium">{ad.title}</p>
                      <p className="text-xs text-gray-500">
                        {ad.owner.firstName} {ad.owner.lastName}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className={`mr-2 h-2 w-2 rounded-full ${ad.verified ? "bg-green-500" : "bg-yellow-500"}`} />
                      <div className="text-xs text-gray-500">
                        {formatDate(ad.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Users Management */}
      {activeTab === "users" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Управление пользователями</h2>
            
            <div className="flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border-gray-300 pr-10 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Поиск..."
                />
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата регистрации
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <HiUserCircle className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.isKennel ? "Питомник" : "Частное лицо"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.verifiedSeller
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {user.verifiedSeller ? "Проверенный" : "Не проверенный"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => verifyUser(user._id)}
                              className={`text-primary-600 hover:text-primary-900 ${
                                user.verifiedSeller ? "hidden" : ""
                              }`}
                            >
                              Верифицировать
                            </button>
                            <button
                              onClick={() => navigate(`/admin/users/${user._id}`)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Подробнее
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {renderPagination()}
            </>
          )}
        </div>
      )}
      
      {/* Ads Management */}
      {activeTab === "ads" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Управление объявлениями</h2>
            
            <div className="flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border-gray-300 pr-10 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Поиск..."
                />
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Объявление
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Автор
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата создания
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ads.map((ad) => (
                      <tr key={ad._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded">
                              {ad.images && ad.images.length > 0 ? (
                                <img
                                  src={ad.images[0]}
                                  alt={ad.title}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                                  <HiTag className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {ad.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                Просмотров: {ad.views}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ad.owner.firstName} {ad.owner.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ad.verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {ad.verified ? "Проверено" : "На проверке"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ad.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/ad/${ad._id}`)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Просмотреть"
                            >
                              <HiEye className="h-5 w-5" />
                            </button>
                            {!ad.verified && (
                              <>
                                <button
                                  onClick={() => moderateAd(ad._id, true)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Одобрить"
                                >
                                  <HiCheck className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => moderateAd(ad._id, false)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Отклонить"
                                >
                                  <HiX className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {renderPagination()}
            </>
          )}
        </div>
      )}
      
      {/* Documents Management */}
      {activeTab === "documents" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Управление документами</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {pendingDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <HiDocument className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Нет документов для проверки
                  </h3>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Документ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Владелец
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Тип
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата загрузки
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingDocuments.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                              <HiDocument className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {doc.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {doc.owner?.firstName} {doc.owner?.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getDocumentTypeName(doc.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(doc.fileUrl, "_blank")}
                              className="text-gray-600 hover:text-gray-900"
                              title="Просмотреть"
                            >
                              <HiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => verifyDocument(doc._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Верифицировать"
                            >
                              <HiCheck className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Отклонить"
                            >
                              <HiX className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Support Management */}
      {activeTab === "support" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Обращения в поддержку</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {supportTickets.length === 0 ? (
                <div className="text-center py-8">
                  <HiQuestionMarkCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Нет обращений в поддержку
                  </h3>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Тема
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Категория
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Приоритет
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата создания
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supportTickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.subject}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ticket.user?.firstName} {ticket.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ticket.user?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getTicketCategoryName(ticket.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : ticket.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : ticket.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {getTicketPriorityName(ticket.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === "open"
                              // frontend/src/pages/AdminDashboard.js (continued)
                              ? "bg-blue-100 text-blue-800"
                              : ticket.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {getTicketStatusName(ticket.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/admin/support/${ticket._id}`)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Просмотреть"
                            >
                              <HiEye className="h-5 w-5" />
                            </button>
                            {(ticket.status === "open" || !ticket.assignedTo) && (
                              <button
                                onClick={() => assignTicket(ticket._id)}
                                className="text-primary-600 hover:text-primary-900"
                                title="Взять в работу"
                              >
                                <HiCheckCircle className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Analytics */}
      {activeTab === "analytics" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Аналитика</h2>
            
            <div className="flex items-center space-x-4">
              <select
                className="rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                defaultValue="week"
              >
                <option value="day">День</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
                <option value="year">Год</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-6">Новые пользователи</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Здесь будет график новых пользователей</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-6">Новые объявления</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Здесь будет график новых объявлений</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-6">Доход по категориям</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Здесь будет график дохода по категориям</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-6">Активность пользователей</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Здесь будет график активности пользователей</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6">Сводная статистика</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Популярные животные
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Собаки</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Кошки</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Другие</span>
                    <span>10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Причины обращений
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Технические проблемы</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Жалобы</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Верификация</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Активные регионы
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Москва</span>
                    <span>40%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Санкт-Петербург</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Другие</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
