// frontend/src/pages/Profile.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiUser,
  HiPencil,
  HiMail,
  HiPhone,
  HiOfficeBuilding,
  HiCheckCircle,
  HiLockClosed,
  HiPhotograph,
  HiStar,
  HiTag,
} from "react-icons/hi";
import { toast } from "react-toastify";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { auth, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    bio: "",
    location: "",
  });
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch current user data
        const response = await api.get("/auth/me");
        setProfileData(response.data);
        setEditData({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          phoneNumber: response.data.phoneNumber || "",
          bio: response.data.bio || "",
          location: response.data.location || "",
        });

        // Fetch user's ads
        const adsResponse = await api.get("/ads/user/my-ads");
        setUserAds(adsResponse.data);

        // Fetch reviews for this user
        const reviewsResponse = await api.get(`/reviews/user/${response.data._id}`);
        setReviews(reviewsResponse.data);

        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Не удалось загрузить данные профиля");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.isAuthenticated, navigate]);

  const handleProfileUpdate = async () => {
    try {
      const response = await api.put("/auth/profile", editData);
      setProfileData(response.data);
      updateUser(response.data);
      setEditMode(false);
      toast.success("Профиль успешно обновлен");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Не удалось обновить профиль");
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      await api.put("/auth/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setChangePasswordMode(false);
      toast.success("Пароль успешно изменен");
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("Не удалось изменить пароль");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real implementation, you would upload the file to your server
    // and update the user's profile picture
    console.log("File selected:", file);
    toast.info("Загрузка изображений будет доступна в будущих версиях");
  };

  const verifyEmail = async () => {
    try {
      await api.post("/auth/verify-email");
      toast.success("На вашу почту отправлен код подтверждения");
      
      // In a real app, this would navigate to a verification page
      // or show a modal to enter the code
      // For now, we'll just update the profile data
      setProfileData({ ...profileData, emailVerified: true });
    } catch (err) {
      console.error("Error sending verification email:", err);
      toast.error("Не удалось отправить код подтверждения");
    }
  };

  const verifyPhone = async () => {
    try {
      await api.post("/auth/verify-phone");
      toast.success("На ваш телефон отправлен код подтверждения");
      
      // Same as above
      setProfileData({ ...profileData, phoneVerified: true });
    } catch (err) {
      console.error("Error sending verification SMS:", err);
      toast.error("Не удалось отправить код подтверждения");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <div>
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="md:flex">
              <div className="md:flex-shrink-0 p-6 flex flex-col items-center justify-center">
                <div className="relative">
                  {profileData?.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <HiUser className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-white hover:bg-primary-700 focus:outline-none"
                  >
                    <HiPencil className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                {profileData?.verifiedSeller && (
                  <div className="mt-3 flex items-center text-primary-600">
                    <HiCheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Проверенный продавец</span>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 md:flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profileData?.firstName} {profileData?.lastName}
                    </h1>
                    <p className="text-gray-600">
                      {profileData?.isKennel ? "Питомник" : "Частное лицо"}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-outline flex items-center text-sm py-1.5"
                  >
                    <HiPencil className="mr-1 h-4 w-4" />
                    Редактировать
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <HiMail className="h-5 w-5 mr-2 text-gray-400" />
                    <span>{profileData?.email}</span>
                    {profileData?.emailVerified ? (
                      <HiCheckCircle className="h-5 w-5 ml-2 text-green-500" title="Подтверждено" />
                    ) : (
                      <button
                        onClick={verifyEmail}
                        className="ml-2 text-primary-600 text-sm hover:text-primary-800"
                      >
                        Подтвердить
                      </button>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <HiPhone className="h-5 w-5 mr-2 text-gray-400" />
                    <span>{profileData?.phoneNumber || "Не указан"}</span>
                    {profileData?.phoneNumber && (
                      profileData?.phoneVerified ? (
                        <HiCheckCircle className="h-5 w-5 ml-2 text-green-500" title="Подтверждено" />
                      ) : (
                        <button
                          onClick={verifyPhone}
                          className="ml-2 text-primary-600 text-sm hover:text-primary-800"
                        >
                          Подтвердить
                        </button>
                      )
                    )}
                  </div>
                  {profileData?.location && (
                    <div className="flex items-center text-gray-600 md:col-span-2">
                      <HiLocationMarker className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                </div>
                {profileData?.bio && (
                  <div className="mt-4 text-gray-600">
                    <p>{profileData.bio}</p>
                  </div>
                )}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setChangePasswordMode(true)}
                    className="flex items-center text-gray-700 hover:text-gray-900"
                  >
                    <HiLockClosed className="h-5 w-5 mr-1" />
                    Изменить пароль
                  </button>
                  <button
                    onClick={logout}
                    className="text-red-600 hover:text-red-800"
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-3 px-6 ${
                activeTab === "profile"
                  ? "border-b-2 border-primary-600 text-primary-600 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Профиль
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "ads"
                  ? "border-b-2 border-primary-600 text-primary-600 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("ads")}
            >
              Мои объявления
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "reviews"
                  ? "border-b-2 border-primary-600 text-primary-600 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Отзывы
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Информация о пользователе</h2>
                <p className="text-gray-600 mb-6">
                  Заполните информацию о себе, чтобы другие пользователи лучше вас узнали.
                </p>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-40 text-gray-500 mb-1 sm:mb-0">Полное имя:</span>
                    <span className="font-medium">{profileData?.firstName} {profileData?.lastName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-40 text-gray-500 mb-1 sm:mb-0">Email:</span>
                    <span>{profileData?.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-40 text-gray-500 mb-1 sm:mb-0">Телефон:</span>
                    <span>{profileData?.phoneNumber || "Не указан"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-40 text-gray-500 mb-1 sm:mb-0">Местоположение:</span>
                    <span>{profileData?.location || "Не указано"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="sm:w-40 text-gray-500 mb-1 sm:mb-0">О себе:</span>
                    <span className="flex-1">{profileData?.bio || "Не указано"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-40 text-gray-500 mb-1 sm:mb-0">Тип аккаунта:</span>
                    <span>{profileData?.isKennel ? "Питомник" : "Частное лицо"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-40 text-gray-500 mb-1 sm:mb-0">Статус:</span>
                    <span className="flex items-center">
                      {profileData?.verifiedSeller ? (
                        <>
                          <HiCheckCircle className="h-5 w-5 mr-1 text-green-500" />
                          Проверенный продавец
                        </>
                      ) : (
                        "Стандартный аккаунт"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "ads" && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Мои объявления</h2>
                  <button
                    onClick={() => navigate("/create-ad")}
                    className="btn-primary"
                  >
                    Создать объявление
                  </button>
                </div>
                
                {userAds.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <HiTag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      У вас пока нет объявлений
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Создайте свое первое объявление, чтобы привлечь внимание к вашим животным
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {userAds.map((ad) => (
                      <div key={ad._id} className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4">
                            {ad.images && ad.images.length > 0 ? (
                              <img
                                src={ad.images[0]}
                                alt={ad.title}
                                className="h-24 w-24 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                Нет фото
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{ad.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              {ad.price && (
                                <span className="text-sm font-medium text-primary-600">
                                  {ad.price.toLocaleString()} ₽
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                Просмотров: {ad.views}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                ad.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {ad.active ? "Активно" : "Неактивно"}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                ad.verified
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {ad.verified ? "Проверено" : "На проверке"}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 mt-3 md:mt-0 md:ml-4 flex flex-col sm:flex-row sm:items-center gap-2">
                            <button
                              onClick={() => navigate(`/ad/${ad._id}`)}
                              className="text-sm btn-outline py-1"
                            >
                              Просмотр
                            </button>
                            <button
                              onClick={() => navigate(`/create-ad?edit=${ad._id}`)}
                              className="text-sm btn-primary py-1"
                            >
                              Изменить
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "reviews" && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Отзывы</h2>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <HiStar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      У вас пока нет отзывов
                    </h3>
                    <p className="mt-1 text-gray-500">
                      После завершения сделок, пользователи смогут оставить вам отзывы
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-4">
                            {review.reviewer?.profilePicture ? (
                              <img
                                src={review.reviewer.profilePicture}
                                alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <HiUser className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-medium text-gray-900">
                                {review.reviewer?.firstName} {review.reviewer?.lastName}
                              </h3>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <HiStar
                                    key={i}
                                    className={`h-5 w-5 ${
                                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.title && (
                              <p className="font-medium text-gray-800 mt-1">{review.title}</p>
                            )}
                            <p className="text-gray-600 mt-1">{review.comment}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString("ru-RU")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Edit Profile Modal */}
          <AnimatePresence>
            {editMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
                onClick={() => setEditMode(false)}
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
                    Редактирование профиля
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Имя</label>
                      <input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) =>
                          setEditData({ ...editData, firstName: e.target.value })
                        }
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">Фамилия</label>
                      <input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">Телефон</label>
                      <input
                        type="text"
                        value={editData.phoneNumber}
                        onChange={(e) =>
                          setEditData({ ...editData, phoneNumber: e.target.value })
                        }
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">Местоположение</label>
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) =>
                          setEditData({ ...editData, location: e.target.value })
                        }
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">О себе</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) =>
                          setEditData({ ...editData, bio: e.target.value })
                        }
                        className="input-field w-full h-24"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setEditMode(false)}
                        className="btn-outline"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleProfileUpdate}
                        className="btn-primary"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Change Password Modal */}
          <AnimatePresence>
            {changePasswordMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
                onClick={() => setChangePasswordMode(false)}
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
                    Изменение пароля
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Текущий пароль</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">Новый пароль</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">Подтвердите новый пароль</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="input-field w-full"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setChangePasswordMode(false)}
                        className="btn-outline"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handlePasswordChange}
                        className="btn-primary"
                        disabled={
                          !passwordData.currentPassword ||
                          !passwordData.newPassword ||
                          !passwordData.confirmPassword
                        }
                      >
                        Изменить пароль
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

export default Profile;
