// frontend/src/pages/Browse.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiFilter, HiSearch, HiX, HiLocationMarker, HiStar, HiCheck, HiCalendar } from "react-icons/hi";
import api from "../utils/api";
import { formatDateShort, calculateAge } from "../utils/dateFormat";

const Browse = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    species: "",
    breed: "",
    gender: "",
    purpose: "",
    verified: false,
    location: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest"
  });
  
  const fetchAds = async () => {
    setLoading(true);
    try {
      // For initial load, get all ads
      const response = await api.get("/ads");
      setAds(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching ads:", err);
      setError("Не удалось загрузить объявления");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    setLoading(true);
    try {
      // Filter out empty values to avoid unnecessary filters
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== "" && value !== false
        )
      );
      
      // Add search query if present
      if (searchQuery) {
        activeFilters.query = searchQuery;
      }
      
      const response = await api.post("/ads/search", activeFilters);
      setAds(response.data);
      setError(null);
    } catch (err) {
      console.error("Error searching ads:", err);
      setError("Ошибка при поиске объявлений");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAds();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      species: "",
      breed: "",
      gender: "",
      purpose: "",
      verified: false,
      location: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest"
    });
    setSearchQuery("");
  };
  
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

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Поиск объявлений</h1>
      
      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Поиск по объявлениям..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <HiFilter className="mr-2 h-5 w-5 text-gray-500" />
              Фильтры
            </button>
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              Найти
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters Panel */}
      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Фильтры</h2>
            <button
              onClick={() => setFiltersOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <label className="form-label">Вид животного</label>
              <select
                name="species"
                value={filters.species}
                onChange={handleFilterChange}
                className="input-field w-full"
              >
                <option value="">Все виды</option>
                <option value="dog">Собака</option>
                <option value="cat">Кошка</option>
                <option value="horse">Лошадь</option>
                <option value="bird">Птица</option>
                <option value="rabbit">Кролик</option>
                <option value="other">Другое</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Порода</label>
              <input
                type="text"
                name="breed"
                value={filters.breed}
                onChange={handleFilterChange}
                className="input-field w-full"
                placeholder="Введите породу"
              />
            </div>
            
            <div>
              <label className="form-label">Пол</label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="input-field w-full"
              >
                <option value="">Любой</option>
                <option value="male">Самец</option>
                <option value="female">Самка</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Цель</label>
              <select
                name="purpose"
                value={filters.purpose}
                onChange={handleFilterChange}
                className="input-field w-full"
              >
                <option value="">Все цели</option>
                <option value="breeding">Разведение</option>
                <option value="pet">Домашний питомец</option>
                <option value="exhibition">Выставка</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Локация</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="input-field w-full"
                placeholder="Город или регион"
              />
            </div>
            
            <div>
              <label className="form-label">Сортировать по</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="input-field w-full"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="price_low">Цена: по возрастанию</option>
                <option value="price_high">Цена: по убыванию</option>
                <option value="popular">Популярные</option>
              </select>
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Цена от</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="input-field w-full"
                  placeholder="Минимальная цена"
                  min="0"
                />
              </div>
              
              <div>
                <label className="form-label">Цена до</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="input-field w-full"
                  placeholder="Максимальная цена"
                  min="0"
                />
              </div>
            </div>
            
            <div className="md:col-span-2 lg:col-span-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  name="verified"
                  checked={filters.verified}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="ml-2 block text-sm text-gray-700">
                  Только проверенные объявления
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={resetFilters}
              className="mr-4 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Сбросить
            </button>
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              Применить фильтры
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-16">
          <HiSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Объявления не найдены</h3>
          <p className="mt-1 text-gray-500">
            Попробуйте изменить параметры поиска или сбросить фильтры.
          </p>
          <div className="mt-6">
            <button
              onClick={fetchAds}
              className="btn-outline"
            >
              Показать все объявления
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">Найдено объявлений: {ads.length}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <motion.div
                key={ad._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link to={`/ad/${ad._id}`}>
                  <div className="relative h-48 bg-gray-200">
                    {ad.images && ad.images.length > 0 ? (
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                        Нет изображения
                      </div>
                    )}
                    {ad.featured && (
                      <div className="absolute top-2 left-2 bg-accent-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                        Премиум
                      </div>
                    )}
                    {ad.verified && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center">
                        <HiCheck className="mr-1" /> Проверено
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{ad.title}</h3>
                      {ad.price ? (
                        <span className="text-primary-600 font-bold">{ad.price.toLocaleString()} ₽</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Цена не указана</span>
                      )}
                    </div>
                    
                    {ad.animal && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">{getSpeciesName(ad.animal.species)}</span>
                          <span className="mx-1">•</span>
                          <span>{ad.animal.breed}</span>
                        </div>
                        {ad.animal.birthdate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <HiCalendar className="mr-1 h-4 w-4 text-gray-400" />
                            <span>Возраст: {calculateAge(ad.animal.birthdate)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <HiLocationMarker className="mr-1 h-4 w-4 text-gray-400" />
                      <span>{ad.location || "Локация не указана"}</span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatDateShort(ad.createdAt)}</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <HiStar className="mr-1 h-3 w-3" />
                        {getPurposeName(ad.purpose)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Browse;
