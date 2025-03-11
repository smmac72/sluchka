// frontend/src/App.js (updated)
import React, { useContext, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { HiMenuAlt4, HiX, HiHome, HiSearch, HiChat, HiCog, HiUser, HiPlus, HiQuestionMarkCircle, HiShieldCheck } from "react-icons/hi";

import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import Profile from "./pages/Profile";
import AdDetails from "./pages/AdDetails";
import CreateAd from "./pages/CreateAd";
import AnimalGarage from "./pages/AnimalGarage";
import AdminDashboard from "./pages/AdminDashboard";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const navigationItems = [
    { path: "/", name: "Главная", icon: <HiHome className="mr-2" /> },
    { path: "/browse", name: "Поиск", icon: <HiSearch className="mr-2" /> },
    { path: "/chat", name: "Чат", icon: <HiChat className="mr-2" /> },
    { path: "/animal-garage", name: "Гараж", icon: <HiCog className="mr-2" /> },
    { path: "/profile", name: "Профиль", icon: <HiUser className="mr-2" /> },
    { path: "/create-ad", name: "Создать объявление", icon: <HiPlus className="mr-2" /> },
    { path: "/support", name: "Поддержка", icon: <HiQuestionMarkCircle className="mr-2" /> },
  ];

  // Only show admin link to admin users (in a real app, this would check admin status)
  if (auth.isAuthenticated) {
    navigationItems.push({ 
      path: "/admin", 
      name: "Админ", 
      icon: <HiShieldCheck className="mr-2" /> 
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-display font-bold text-primary-600">случка</span>
                <span className="ml-2 text-sm text-gray-500">marketplace</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  } transition duration-150 ease-in-out flex items-center`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {auth.isAuthenticated ? (
                <>
                  <span className="hidden sm:inline-block text-sm font-medium text-gray-700">
                    Привет, {auth.user.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-outline text-sm py-1.5"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline text-sm py-1.5">
                    Войти
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-1.5">
                    Регистрация
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <HiX className="block h-6 w-6" />
                ) : (
                  <HiMenuAlt4 className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden py-2 px-4 bg-white border-t border-gray-200"
          >
            <div className="flex flex-col space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  } transition duration-150 ease-in-out flex items-center`}
                  onClick={closeMenu}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/chat" element={<ChatList />} />
            <Route path="/chat/:chatId" element={<ChatRoom />} />
            <Route path="/animal-garage" element={<AnimalGarage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ad/:id" element={<AdDetails />} />
            <Route path="/create-ad" element={<CreateAd />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </main>

      <footer className="bg-gray-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">случка</h3>
              <p className="text-sm">
                Специализированная онлайн-платформа для организации случки животных, объединяющая владельцев и заводчиков.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Ссылки</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition">Главная</Link></li>
                <li><Link to="/browse" className="hover:text-white transition">Поиск</Link></li>
                <li><Link to="/support" className="hover:text-white transition">Поддержка</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Контакты</h3>
              <p className="text-sm">Email: info@sluchka.ru</p>
              <p className="text-sm">Телефон: +7 (800) 123-45-67</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
            <p>&copy; 2025 случка. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
