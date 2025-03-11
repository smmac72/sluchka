// frontend/src/pages/AdDetails.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
  HiChat,
  HiUser,
  HiStar,
  HiCalendar,
  HiLocationMarker,
  HiTag,
  HiCheckCircle,
  HiPhone,
  HiMail,
  HiPhotograph,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineHeart,
  HiHeart,
  HiShare,
  HiFlag,
} from "react-icons/hi";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { formatDate, calculateAge } from "../utils/dateFormat";
import { toast } from "react-toastify";

const AdDetails = () => {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [similarAds, setSimilarAds] = useState([]);
  const [favorite, setFavorite] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        const response = await api.get(`/ads/${id}`);
        setAd(response.data);
        
        // Check if current user is the owner
        if (auth.isAuthenticated && response.data.owner._id === auth.user.id) {
          setIsOwner(true);
        }
        
        // Also fetch reviews for this ad's owner
        if (response.data.owner) {
          const reviewsResponse = await api.get(`/reviews/user/${response.data.owner._id}`);
          setReviews(reviewsResponse.data);
        }
        
        // Fetch similar ads
        const similarResponse = await api.post("/ads/search", {
          species: response.data.animal?.species,
          purpose: response.data.purpose,
          limit: 3
        });
        
        // Filter out current ad
        const filtered = similarResponse.data.filter(
          (similarAd) => similarAd._id !== id
        );
        setSimilarAds(filtered.slice(0, 3));
        
        setError(null);
      } catch (err) {
        console.error("Error fetching ad details:", err);
        setError("Не удалось загрузить данные объявления");
      } finally {
        setLoading(false);
      }
    };

    fetchAdDetails();
  }, [id, auth.isAuthenticated, auth.user?.id]);

  const getSpeciesName = (species) => {
    const speciesMap = {
      dog: "Собака",
      cat: "Кошка",
      horse: "Лошадь",
      bird: "Птица",
      rabbit: "Кролик",
      other: "Другое"
    };
    return speciesMap[species] || species;
  };
  
  const getPurposeName = (purpose) => {
    const purposeMap = {
      breeding: "Разведение",
      pet: "Домашний питомец",
      exhibition: "Выставка"
    };
    return purposeMap[purpose] || purpose;
  };

  const handlePreviousImage = () => {
    setCurrentImage((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImage((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1));
  };

  const handleStartChat = async () => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    
    try {
      // Get or create chat
      const response = await api.get(`/chat/${ad.owner._id}?adId=${ad._id}`);
      navigate(`/chat/${response.data._id}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Не удалось начать чат");
    }
  };

  const handleToggleFavorite = () => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    
    setFavorite(!favorite);
    toast.success(favorite ? "Удалено из избранного" : "Добавлено в избранное");
    // In a real app, would call an API endpoint to save this preference
  };

  const handleShare = () => {
    setShareModalOpen(true);
    // In a real app, would implement sharing options
  };

  const handleReport = () => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    
    setReportModalOpen(true);
  };

  const submitReport = () => {
    toast.success("Жалоба отправлена на рассмотрение");
    setReportModalOpen(false);
    // In a real app, would call an API endpoint to submit the report
  };

  const calculateRating = () => {
    if (reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
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
          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <HiArrowLeft className="h-5 w-5 mr-1" />
              Назад к объявлениям
            </button>
          </div>
          
          {/* Main content */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="md:flex">
              {/* Image gallery */}
              <div className="md:w-1/2 relative">
                {ad.images && ad.images.length > 0 ? (
                  <>
                    <img
                      src={ad.images[currentImage]}
                      alt={ad.title}
                      className="w-full h-96 object-cover"
                    />
                    {ad.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70"
                        >
                          <HiChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70"
                        >
                          <HiChevronRight className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                          {ad.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImage(idx)}
                              className={`h-2 w-2 rounded-full ${
                                idx === currentImage
                                  ? "bg-white"
                                  : "bg-white bg-opacity-50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <HiPhotograph className="h-20 w-20 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Ad details */}
              <div className="md:w-1/2 p-6">
                <div className="flex justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleToggleFavorite}
                      className="text-gray-500 hover:text-red-500"
                      title={favorite ? "Удалить из избранного" : "Добавить в избранное"}
                    >
                      {favorite ? (
                        <HiHeart className="h-6 w-6 text-red-500" />
                      ) : (
                        <HiOutlineHeart className="h-6 w-6" />
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="text-gray-500 hover:text-gray-700"
                      title="Поделиться"
                    >
                      <HiShare className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleReport}
                      className="text-gray-500 hover:text-gray-700"
                      title="Пожаловаться"
                    >
                      <HiFlag className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                {ad.price ? (
                  <div className="text-2xl font-bold text-primary-600 mb-4">
                    {ad.price.toLocaleString()} ₽
                  </div>
                ) : (
                  <div className="text-lg text-gray-500 mb-4">Цена не указана</div>
                )}
                
                <div className="flex items-center mb-4">
                  <HiLocationMarker className="h-5 w-5 text-gray-500 mr-1" />
                  <span className="text-gray-600">{ad.location || "Местоположение не указано"}</span>
                </div>
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {getPurposeName(ad.purpose)}
                  </div>
                  <div className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    Просмотров: {ad.views}
                  </div>
                  {ad.verified && (
                    <div className="px-2 py-1 bg-primary-100 rounded-full text-sm text-primary-800 flex items-center">
                      <HiCheckCircle className="h-4 w-4 mr-1" />
                      Проверено
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Информация о животном</h2>
                  {ad.animal ? (
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="text-gray-600">Вид:</div>
                      <div className="font-medium">{getSpeciesName(ad.animal.species)}</div>
                      
                      <div className="text-gray-600">Порода:</div>
                      <div className="font-medium">{ad.animal.breed}</div>
                      
                      {ad.animal.subBreed && (
                        <>
                          <div className="text-gray-600">Подпорода:</div>
                          <div className="font-medium">{ad.animal.subBreed}</div>
                        </>
                      )}
                      
                      <div className="text-gray-600">Пол:</div>
                      <div className="font-medium">
                        {ad.animal.gender === "male" ? "Самец" : "Самка"}
                      </div>
                      
                      {ad.animal.birthdate && (
                        <>
                          <div className="text-gray-600">Возраст:</div>
                          <div className="font-medium">{calculateAge(ad.animal.birthdate)}</div>
                        </>
                      )}
                      
                      {ad.animal.color && (
                        <>
                          <div className="text-gray-600">Окрас:</div>
                          <div className="font-medium">{ad.animal.color}</div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">Информация о животном не указана</p>
                  )}
                </div>
                
                <div className="border-t border-gray-200 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Описание</h2>
                  <p className="text-gray-700">{ad.description}</p>
                </div>
                
                <div className="border-t border-gray-200 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Владелец</h2>
                  <div className="flex items-center">
                    <div className="mr-3">
                      {ad.owner?.profilePicture ? (
                        <img
                          src={ad.owner.profilePicture}
                          alt={`${ad.owner.firstName} ${ad.owner.lastName}`}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <HiUser className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {ad.owner?.firstName} {ad.owner?.lastName}
                      </p>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 mr-1">
                          {ad.owner?.isKennel ? "Питомник" : "Частное лицо"}
                        </span>
                        {ad.owner?.verifiedSeller && (
                          <HiCheckCircle className="h-4 w-4 text-primary-600" title="Проверенный продавец" />
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <HiStar
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(calculateRating())
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm ml-1 text-gray-600">
                          ({reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length >= 2 && reviews.length <= 4 ? "отзыва" : "отзывов"})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!isOwner && (
                  <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleStartChat}
                      className="btn-primary py-3 flex-1 flex items-center justify-center"
                    >
                      <HiChat className="mr-2 h-5 w-5" />
                      Написать сообщение
                    </button>
                    <button
                      onClick={() => setContactModalOpen(true)}
                      className="btn-outline py-3 flex-1 flex items-center justify-center"
                    >
                      <HiPhone className="mr-2 h-5 w-5" />
                      Показать контакты
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Similar Ads */}
          {similarAds.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Похожие объявления</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarAds.map((similarAd) => (
                  <Link
                    key={similarAd._id}
                    to={`/ad/${similarAd._id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-40 bg-gray-200">
                      {similarAd.images && similarAd.images.length > 0 ? (
                        <img
                          src={similarAd.images[0]}
                          alt={similarAd.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <HiPhotograph className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
                        {similarAd.title}
                      </h3>
                      {similarAd.price ? (
                        <p className="text-primary-600 font-bold">
                          {similarAd.price.toLocaleString()} ₽
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">Цена не указана</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Reviews */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Отзывы о продавце ({reviews.length})
              </h2>
              
              {reviews.length === 0 ? (
                <p className="text-gray-600">Пока нет отзывов</p>
              ) : (
                <div className="space-y-6">
                  {reviews.slice(0, 3).map((review) => (
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
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {reviews.length > 3 && (
                    <div className="text-center pt-2">
                      <button className="text-primary-600 font-medium hover:text-primary-800">
                        Показать все отзывы ({reviews.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Modal */}
          <AnimatePresence>
            {contactModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
                onClick={() => setContactModalOpen(false)}
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
                    Контактная информация
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <HiUser className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Имя</p>
                        <p className="font-medium">
                          {ad.owner?.firstName} {ad.owner?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <HiPhone className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Телефон</p>
                        <p className="font-medium">
                          {ad.owner?.phoneNumber || "Номер не указан"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <HiMail className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">
                          {ad.owner?.email}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setContactModalOpen(false)}
                        className="btn-primary"
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Report Modal */}
          <AnimatePresence>
            {reportModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
                onClick={() => setReportModalOpen(false)}
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
                    Пожаловаться на объявление
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Причина жалобы</label>
                      <select className="input-field w-full">
                        <option value="">Выберите причину</option>
                        <option value="fake">Недостоверная информация</option>
                        <option value="prohibited">Запрещенные товары/услуги</option>
                        <option value="duplicate">Дубликат объявления</option>
                        <option value="scam">Мошенничество</option>
                        <option value="other">Другое</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Комментарий</label>
                      <textarea
                        className="input-field w-full h-32"
                        placeholder="Опишите причину вашей жалобы..."
                      ></textarea>
                    </div>
                    <div className="pt-4 flex justify-between">
                      <button
                        onClick={() => setReportModalOpen(false)}
                        className="btn-outline"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={submitReport}
                        className="btn-primary"
                      >
                        Отправить жалобу
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Share Modal */}
          <AnimatePresence>
            {shareModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
                onClick={() => setShareModalOpen(false)}
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
                    Поделиться объявлением
                  </h2>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={window.location.href}
                      readOnly
                      className="input-field w-full"
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">
                      <svg className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                      </svg>
                      <span className="text-xs">Facebook</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-100 text-blue-400 hover:bg-blue-200">
                      <svg className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                      <span className="text-xs">Twitter</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-100 text-green-600 hover:bg-green-200">
                      <svg className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 0 1-1.516-5.26c0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
                      </svg>
                      <span className="text-xs">WhatsApp</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">
                      <svg className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      <span className="text-xs">LinkedIn</span>
                    </button>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setShareModalOpen(false)}
                      className="btn-primary"
                    >
                      Закрыть
                    </button>
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

export default AdDetails;
