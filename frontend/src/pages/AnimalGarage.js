// frontend/src/pages/AnimalGarage.js
import React, { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { HiPlus, HiPencil, HiTrash, HiExclamationCircle, HiCheckCircle, HiDocumentAdd } from "react-icons/hi";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function AnimalGarage() {
  const { auth } = useContext(AuthContext);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    if (editingAnimal) {
      Object.keys(editingAnimal).forEach(key => {
        if (key === 'birthdate' && editingAnimal[key]) {
          setValue(key, format(new Date(editingAnimal[key]), 'yyyy-MM-dd'));
        } else {
          setValue(key, editingAnimal[key]);
        }
      });
    }
  }, [editingAnimal, setValue]);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/animals`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setAnimals(response.data);
    } catch (err) {
      setError("Не удалось загрузить профили животных");
      console.error("Error fetching animals:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingAnimal) {
        await axios.put(`${process.env.REACT_APP_API_URL}/animals/${editingAnimal._id}`, data, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setSuccessMessage("Профиль животного обновлен");
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/animals`, data, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setSuccessMessage("Профиль животного создан");
      }
      
      reset();
      setShowAddForm(false);
      setEditingAnimal(null);
      fetchAnimals();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Произошла ошибка при сохранении профиля животного"
      );
      console.error("Error saving animal:", err);
    }
  };

  const handleEdit = (animal) => {
    setEditingAnimal(animal);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить этот профиль?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/animals/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setSuccessMessage("Профиль животного удален");
        
        fetchAnimals();
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (err) {
        setError(
          err.response?.data?.message || 
          "Произошла ошибка при удалении профиля животного"
        );
        console.error("Error deleting animal:", err);
      }
    }
  };

  const cancelForm = () => {
    reset();
    setShowAddForm(false);
    setEditingAnimal(null);
  };

  // Helper to get species name in Russian
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

  // Helper to get gender in Russian
  const getGenderName = (gender) => {
    return gender === "male" ? "Самец" : "Самка";
  };

  // Helper to calculate age in years and months
  const getAgeString = (birthdate) => {
    if (!birthdate) return "Не указано";
    
    const today = new Date();
    const birth = new Date(birthdate);
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    let result = [];
    if (years > 0) {
      result.push(`${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`);
    }
    if (months > 0 || years === 0) {
      result.push(`${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`);
    }
    
    return result.join(' ');
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Гараж животных</h1>
          <p className="text-gray-600">Управляйте профилями ваших животных для случки</p>
        </div>
        
        {!showAddForm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="btn-primary flex items-center mt-4 md:mt-0"
            onClick={() => {
              setShowAddForm(true);
              setEditingAnimal(null);
              reset();
            }}
          >
            <HiPlus className="mr-2" />
            Добавить животное
          </motion.button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm flex items-center">
          <HiExclamationCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 text-sm flex items-center">
          <HiCheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-8 rounded-xl shadow-md mb-10"
        >
          <h2 className="text-xl font-semibold mb-6">
            {editingAnimal ? "Редактировать профиль" : "Создать профиль животного"}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Имя животного</label>
                <input
                  type="text"
                  {...register("name", { required: "Имя обязательно" })}
                  className={`input-field w-full ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Введите имя"
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="form-label">Вид</label>
                <select
                  {...register("species", { required: "Вид обязателен" })}
                  className={`input-field w-full ${errors.species ? "border-red-500" : ""}`}
                >
                  <option value="">Выберите вид</option>
                  <option value="dog">Собака</option>
                  <option value="cat">Кошка</option>
                  <option value="horse">Лошадь</option>
                  <option value="bird">Птица</option>
                  <option value="rabbit">Кролик</option>
                  <option value="other">Другое</option>
                </select>
                {errors.species && <p className="error-message">{errors.species.message}</p>}
              </div>
              
              <div>
                <label className="form-label">Порода</label>
                <input
                  type="text"
                  {...register("breed", { required: "Порода обязательна" })}
                  className={`input-field w-full ${errors.breed ? "border-red-500" : ""}`}
                  placeholder="Введите породу"
                />
                {errors.breed && <p className="error-message">{errors.breed.message}</p>}
              </div>
              
              <div>
                <label className="form-label">Подпорода</label>
                <input
                  type="text"
                  {...register("subBreed")}
                  className="input-field w-full"
                  placeholder="Введите подпороду (если есть)"
                />
              </div>
              
              <div>
                <label className="form-label">Пол</label>
                <select
                  {...register("gender", { required: "Пол обязателен" })}
                  className={`input-field w-full ${errors.gender ? "border-red-500" : ""}`}
                >
                  <option value="">Выберите пол</option>
                  <option value="male">Самец</option>
                  <option value="female">Самка</option>
                </select>
                {errors.gender && <p className="error-message">{errors.gender.message}</p>}
              </div>
              
              <div>
                <label className="form-label">Дата рождения</label>
                <input
                  type="date"
                  {...register("birthdate")}
                  className="input-field w-full"
                />
              </div>
              
              <div>
                <label className="form-label">Окрас</label>
                <input
                  type="text"
                  {...register("color")}
                  className="input-field w-full"
                  placeholder="Введите окрас"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="form-label">Описание</label>
              <textarea
                {...register("description")}
                className="input-field w-full h-32"
                placeholder="Введите дополнительную информацию о животном"
              ></textarea>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={cancelForm}
                className="btn-outline"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {editingAnimal ? "Сохранить изменения" : "Создать профиль"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      ) : animals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
            <HiExclamationCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет профилей животных</h3>
          <p className="text-gray-600 mb-6">
            У вас пока нет добавленных профилей животных. Добавьте ваше первое животное, чтобы начать создавать объявления.
          </p>
          {!showAddForm && (
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingAnimal(null);
                reset();
              }}
              className="btn-primary"
            >
              <HiPlus className="inline-block mr-2" />
              Добавить животное
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map(animal => (
            <motion.div
              key={animal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{animal.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(animal)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-100"
                      title="Редактировать"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(animal._id)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100"
                      title="Удалить"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Вид:</span>
                    <span className="font-medium">{getSpeciesName(animal.species)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Порода:</span>
                    <span className="font-medium">{animal.breed}</span>
                  </div>
                  {animal.subBreed && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Подпорода:</span>
                      <span className="font-medium">{animal.subBreed}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Пол:</span>
                    <span className="font-medium">{getGenderName(animal.gender)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Возраст:</span>
                    <span className="font-medium">{getAgeString(animal.birthdate)}</span>
                  </div>
                  {animal.color && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Окрас:</span>
                      <span className="font-medium">{animal.color}</span>
                    </div>
                  )}
                </div>

                {animal.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 text-sm">{animal.description}</p>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    className="flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium"
                    onClick={() => {/* TODO: Implement document upload */}}
                  >
                    <HiDocumentAdd className="h-4 w-4 mr-1" />
                    Добавить документы
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
