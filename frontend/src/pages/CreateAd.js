// frontend/src/pages/CreateAd.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineCheck,
  HiInformationCircle,
  HiPhotograph,
  HiTrash,
  HiPlus,
} from "react-icons/hi";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { formatDateForInput } from "../utils/dateFormat";

const CreateAd = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // Extract edit ID from query params if present
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get("edit");
  
  const [loading, setLoading] = useState(editId ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userAnimals, setUserAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [preview, setPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    purpose: "breeding",
    price: "",
    location: "",
    images: []
  });
  
  // Add form validation state
  const [formErrors, setFormErrors] = useState({});
  const [activeStep, setActiveStep] = useState(1);
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [animalFormData, setAnimalFormData] = useState({
    name: "",
    species: "",
    breed: "",
    subBreed: "",
    gender: "",
    birthdate: "",
    color: "",
    description: ""
  });
  
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserAnimals = async () => {
      try {
        const response = await api.get("/animals");
        setUserAnimals(response.data);
        
        // If we have animals, select the first one by default
        if (response.data.length > 0 && !selectedAnimal) {
          setSelectedAnimal(response.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching user animals:", err);
        toast.error("Не удалось загрузить список животных");
      }
    };

    const fetchAdForEdit = async () => {
      if (!editId) return;
      
      try {
        const response = await api.get(`/ads/${editId}`);
        const ad = response.data;
        
        setFormData({
          title: ad.title || "",
          description: ad.description || "",
          purpose: ad.purpose || "breeding",
          price: ad.price || "",
          location: ad.location || "",
          images: ad.images || []
        });
        
        if (ad.animal) {
          setSelectedAnimal(ad.animal._id);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching ad for edit:", err);
        setError("Не удалось загрузить объявление для редактирования");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnimals();
    if (editId) {
      fetchAdForEdit();
    }
  }, [auth.isAuthenticated, navigate, editId, selectedAnimal]);

  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = "Заголовок обязателен";
    } else if (formData.title.length < 10) {
      errors.title = "Заголовок должен содержать не менее 10 символов";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Описание обязательно";
    } else if (formData.description.length < 30) {
      errors.description = "Описание должно содержать не менее 30 символов";
    }
    
    if (!formData.location.trim()) {
      errors.location = "Местоположение обязательно";
    }
    
    if (formData.price && isNaN(formData.price)) {
      errors.price = "Цена должна быть числом";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!selectedAnimal && !showAnimalForm) {
      errors.animal = "Выберите животное или создайте новое";
    }
    
    if (showAnimalForm) {
      if (!animalFormData.name.trim()) {
        errors.name = "Имя животного обязательно";
      }
      
      if (!animalFormData.species) {
        errors.species = "Вид животного обязателен";
      }
      
      if (!animalFormData.breed.trim()) {
        errors.breed = "Порода обязательна";
      }
      
      if (!animalFormData.gender) {
        errors.gender = "Пол животного обязателен";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 1 && validateStep1()) {
      setActiveStep(2);
    } else if (activeStep === 2 && validateStep2()) {
      setActiveStep(3);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnimalInputChange = (e) => {
    const { name, value } = e.target;
    setAnimalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // In a real app, we would upload these to a server
    // For this demo, we'll create object URLs
    const newImages = files.map((file) => URL.createObjectURL(file));
    
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCreateAnimal = async () => {
    if (!validateStep2()) return;
    
    try {
      const response = await api.post("/animals", animalFormData);
      
      // Add the new animal to the user's animals
      setUserAnimals((prev) => [...prev, response.data]);
      
      // Select the new animal
      setSelectedAnimal(response.data._id);
      
      // Hide the animal form
      setShowAnimalForm(false);
      
      // Reset the animal form data
      setAnimalFormData({
        name: "",
        species: "",
        breed: "",
        subBreed: "",
        gender: "",
        birthdate: "",
        color: "",
        description: ""
      });
      
      toast.success("Животное создано успешно");
    } catch (err) {
      console.error("Error creating animal:", err);
      toast.error("Не удалось создать животное");
    }
  };

  const handleSubmit = async () => {
    // Combine all validation
    if (!validateStep1() || !validateStep2()) {
      setActiveStep(1);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        animal: selectedAnimal
      };
      
      let response;
      
      if (editId) {
        response = await api.put(`/ads/${editId}`, payload);
        toast.success("Объявление обновлено успешно");
      } else {
        response = await api.post("/ads", payload);
        toast.success("Объявление создано успешно");
      }
      
      // Navigate to the ad details page
      navigate(`/ad/${response.data._id}`);
    } catch (err) {
      console.error("Error submitting ad:", err);
      toast.error(editId ? "Не удалось обновить объявление" : "Не удалось создать объявление");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {editId ? "Редактирование объявления" : "Создание объявления"}
      </h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-full flex items-center">
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
              activeStep >= 1 ? "bg-primary-600" : "bg-gray-200"
            } text-white font-semibold`}>
              {activeStep > 1 ? <HiOutlineCheck className="h-6 w-6" /> : "1"}
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              activeStep > 1 ? "bg-primary-600" : "bg-gray-200"
            }`} />
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
              activeStep >= 2 ? "bg-primary-600" : "bg-gray-200"
            } text-white font-semibold`}>
              {activeStep > 2 ? <HiOutlineCheck className="h-6 w-6" /> : "2"}
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              activeStep > 2 ? "bg-primary-600" : "bg-gray-200"
            }`} />
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
              activeStep >= 3 ? "bg-primary-600" : "bg-gray-200"
            } text-white font-semibold`}>
              {activeStep > 3 ? <HiOutlineCheck className="h-6 w-6" /> : "3"}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm font-medium text-gray-700">Основная информация</div>
          <div className="text-sm font-medium text-gray-700 ml-6">Выбор животного</div>
          <div className="text-sm font-medium text-gray-700">Предпросмотр</div>
        </div>
      </div>
      
      {/* Step 1: Basic Information */}
      {activeStep === 1 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label className="form-label">Заголовок объявления <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`input-field w-full ${formErrors.title ? "border-red-500" : ""}`}
                placeholder="Например: Красивый кот шотландской породы для случки"
              />
              {formErrors.title && (
                <p className="error-message">{formErrors.title}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">Описание <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`input-field w-full ${formErrors.description ? "border-red-500" : ""}`}
                placeholder="Подробно опишите ваше животное, его характер, достоинства, условия случки и т.д."
              />
              {formErrors.description && (
                <p className="error-message">{formErrors.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Минимум 30 символов. Чем подробнее описание, тем больше шансов найти партнера.
              </p>
            </div>
            
            <div>
              <label className="form-label">Цель</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                <option value="breeding">Случка (разведение)</option>
                <option value="pet">Домашний питомец</option>
                <option value="exhibition">Выставка</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Цена (₽)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`input-field w-full ${formErrors.price ? "border-red-500" : ""}`}
                placeholder="Введите цену или оставьте пустым, если по договоренности"
              />
              {formErrors.price && (
                <p className="error-message">{formErrors.price}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">Местоположение <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`input-field w-full ${formErrors.location ? "border-red-500" : ""}`}
                placeholder="Например: Москва, Санкт-Петербург, Екатеринбург и т.д."
              />
              {formErrors.location && (
                <p className="error-message">{formErrors.location}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Step 2: Animal Selection/Creation */}
      {activeStep === 2 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Выберите животное</h2>
          
          {userAnimals.length === 0 && !showAnimalForm ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg mb-6">
              <p className="text-gray-600 mb-4">
                У вас пока нет добавленных животных. Создайте профиль своего животного.
              </p>
              <button
                onClick={() => setShowAnimalForm(true)}
                className="btn-primary"
              >
                Создать профиль животного
              </button>
            </div>
          ) : (
            <>
              {!showAnimalForm && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userAnimals.map((animal) => (
                      <div
                        key={animal._id}
                        onClick={() => setSelectedAnimal(animal._id)}
                        className={`border rounded-xl p-4 cursor-pointer transition ${
                          selectedAnimal === animal._id
                            ? "border-primary-600 bg-primary-50"
                            : "border-gray-200 hover:border-primary-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">{animal.name}</h3>
                          {selectedAnimal === animal._id && (
                            <HiOutlineCheck className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {animal.species === "dog" ? "Собака" :
                           animal.species === "cat" ? "Кошка" :
                           animal.species === "horse" ? "Лошадь" :
                           animal.species === "bird" ? "Птица" :
                           animal.species === "rabbit" ? "Кролик" : "Другое"}
                        </p>
                        <p className="text-sm text-gray-600">{animal.breed}</p>
                        <p className="text-sm text-gray-600">
                          {animal.gender === "male" ? "Самец" : "Самка"}
                        </p>
                      </div>
                    ))}
                    {/* Add new animal card */}
                    <div
                      onClick={() => setShowAnimalForm(true)}
                      className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                    >
                      <HiPlus className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-600">Добавить животное</p>
                    </div>
                  </div>
                  
                  {formErrors.animal && (
                    <p className="error-message mt-2">{formErrors.animal}</p>
                  )}
                </div>
              )}
              
              {showAnimalForm && (
                <div className="border rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Создание профиля животного</h3>
                    <button
                      onClick={() => setShowAnimalForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Отмена
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Имя животного <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={animalFormData.name}
                        onChange={handleAnimalInputChange}
                        className={`input-field w-full ${formErrors.name ? "border-red-500" : ""}`}
                        placeholder="Введите имя"
                      />
                      {formErrors.name && (
                        <p className="error-message">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label">Вид <span className="text-red-500">*</span></label>
                      <select
                        name="species"
                        value={animalFormData.species}
                        onChange={handleAnimalInputChange}
                        className={`input-field w-full ${formErrors.species ? "border-red-500" : ""}`}
                      >
                        <option value="">Выберите вид</option>
                        <option value="dog">Собака</option>
                        <option value="cat">Кошка</option>
                        <option value="horse">Лошадь</option>
                        <option value="bird">Птица</option>
                        <option value="rabbit">Кролик</option>
                        <option value="other">Другое</option>
                      </select>
                      {formErrors.species && (
                        <p className="error-message">{formErrors.species}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label">Порода <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="breed"
                        value={animalFormData.breed}
                        onChange={handleAnimalInputChange}
                        className={`input-field w-full ${formErrors.breed ? "border-red-500" : ""}`}
                        placeholder="Введите породу"
                      />
                      {formErrors.breed && (
                        <p className="error-message">{formErrors.breed}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label">Подпорода</label>
                      <input
                        type="text"
                        name="subBreed"
                        value={animalFormData.subBreed}
                        onChange={handleAnimalInputChange}
                        className="input-field w-full"
                        placeholder="Если применимо"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Пол <span className="text-red-500">*</span></label>
                      <select
                        name="gender"
                        value={animalFormData.gender}
                        onChange={handleAnimalInputChange}
                        className={`input-field w-full ${formErrors.gender ? "border-red-500" : ""}`}
                      >
                        <option value="">Выберите пол</option>
                        <option value="male">Самец</option>
                        <option value="female">Самка</option>
                      </select>
                      {formErrors.gender && (
                        <p className="error-message">{formErrors.gender}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label">Дата рождения</label>
                      <input
                        type="date"
                        name="birthdate"
                        value={animalFormData.birthdate}
                        onChange={handleAnimalInputChange}
                        className="input-field w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Окрас</label>
                      <input
                        type="text"
                        name="color"
                        value={animalFormData.color}
                        onChange={handleAnimalInputChange}
                        className="input-field w-full"
                        placeholder="Введите окрас"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="form-label">Описание</label>
                      <textarea
                        name="description"
                        value={animalFormData.description}
                        onChange={handleAnimalInputChange}
                        rows={3}
                        className="input-field w-full"
                        placeholder="Дополнительная информация о животном"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleCreateAnimal}
                      className="btn-primary"
                    >
                      Сохранить животное
                    </button>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 flex items-start">
                <HiInformationCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>
                  Выбранное животное будет привязано к вашему объявлению.
                  Вы можете добавить новое животное в любое время, нажав на кнопку "Добавить животное".
                </p>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Step 3: Images and Preview */}
      {activeStep === 3 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Фотографии и предпросмотр</h2>
          
          <div className="mb-6">
            <label className="form-label">Фотографии</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 p-1 rounded-full text-white hover:bg-red-700"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.images.length < 10 && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                >
                  <HiPhotograph className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Добавить фото</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <p className="text-sm text-gray-500">
              Рекомендуется загрузить не менее 3 фотографий. Максимум 10 фотографий.
            </p>
          </div>
          
          <div className="mb-6">
            <button
              onClick={togglePreview}
              className="btn-outline w-full"
            >
              {preview ? "Скрыть предпросмотр" : "Предпросмотр объявления"}
            </button>
          </div>
          
          {preview && (
            <div className="border rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h3>
              
              {formData.price ? (
                <p className="text-xl font-bold text-primary-600 mb-4">
                  {formData.price.toLocaleString()} ₽
                </p>
              ) : (
                <p className="text-gray-500 mb-4">Цена не указана</p>
              )}
              
              <div className="mb-4">
                <p className="text-gray-700">{formData.description}</p>
              </div>
              
              <div className="flex items-center mb-4">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {formData.purpose === "breeding" ? "Разведение" :
                   formData.purpose === "pet" ? "Домашний питомец" : "Выставка"}
                </span>
                <span className="ml-2 text-gray-600">{formData.location}</span>
              </div>
              
              {selectedAnimal && userAnimals.find(a => a._id === selectedAnimal) && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Информация о животном</h4>
                  <div className="grid grid-cols-2 gap-y-1">
                    {(() => {
                      const animal = userAnimals.find(a => a._id === selectedAnimal);
                      return (
                        <>
                          <div className="text-gray-600">Имя:</div>
                          <div className="font-medium">{animal.name}</div>
                          
                          <div className="text-gray-600">Вид:</div>
                          <div className="font-medium">
                            {animal.species === "dog" ? "Собака" :
                             animal.species === "cat" ? "Кошка" :
                             animal.species === "horse" ? "Лошадь" :
                             animal.species === "bird" ? "Птица" :
                             animal.species === "rabbit" ? "Кролик" : "Другое"}
                          </div>
                          
                          <div className="text-gray-600">Порода:</div>
                          <div className="font-medium">{animal.breed}</div>
                          
                          <div className="text-gray-600">Пол:</div>
                          <div className="font-medium">
                            {animal.gender === "male" ? "Самец" : "Самка"}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {formData.images.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Фотографии</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {formData.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-700 flex items-start mt-6">
            <HiInformationCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>
              Перед публикацией объявление будет проверено модератором. 
              Убедитесь, что все данные указаны корректно. 
              После публикации объявление будет доступно всем пользователям.
            </p>
          </div>
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className={`btn-outline ${activeStep === 1 ? "invisible" : ""}`}
        >
          Назад
        </button>
        
        {activeStep < 3 ? (
          <button
            onClick={handleNext}
            className="btn-primary"
          >
            Далее
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? "Отправка..." : editId ? "Сохранить изменения" : "Опубликовать объявление"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateAd;
