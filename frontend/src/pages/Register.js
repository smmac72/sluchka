// frontend/src/pages/Register.js
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { HiMail, HiLockClosed, HiUser, HiPhone, HiOfficeBuilding } from "react-icons/hi";

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const password = watch("password", "");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, data);
      
      // Login after successful registration
      const loginResponse = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email: data.email,
        password: data.password
      });
      
      login(loginResponse.data.token, loginResponse.data.user);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Произошла ошибка при регистрации. Пожалуйста, попробуйте снова."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Создайте аккаунт</h1>
        <p className="text-gray-600">Присоединяйтесь к нашей платформе для случки животных</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="mb-6">
              <label className="form-label">Имя</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("firstName", { required: "Имя обязательно" })}
                  className={`input-field w-full pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="Ваше имя"
                />
              </div>
              {errors.firstName && <p className="error-message">{errors.firstName.message}</p>}
            </div>

            <div className="mb-6">
              <label className="form-label">Фамилия</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("lastName", { required: "Фамилия обязательна" })}
                  className={`input-field w-full pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Ваша фамилия"
                />
              </div>
              {errors.lastName && <p className="error-message">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="mb-6">
            <label className="form-label">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                {...register("email", { 
                  required: "Email обязателен",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Неверный формат email"
                  }
                })}
                className={`input-field w-full pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="example@domain.com"
              />
            </div>
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label className="form-label">Телефон</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register("phoneNumber", { 
                  pattern: {
                    value: /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
                    message: "Неверный формат телефона"
                  }
                })}
                className={`input-field w-full pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                placeholder="+7 999 123 45 67"
              />
            </div>
            {errors.phoneNumber && <p className="error-message">{errors.phoneNumber.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="mb-6">
              <label className="form-label">Пароль</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register("password", { 
                    required: "Пароль обязателен",
                    minLength: {
                      value: 6,
                      message: "Пароль должен содержать не менее 6 символов"
                    }
                  })}
                  className={`input-field w-full pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Введите пароль"
                />
              </div>
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            <div className="mb-6">
              <label className="form-label">Подтверждение пароля</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register("confirmPassword", { 
                    required: "Подтвердите пароль",
                    validate: value => value === password || "Пароли не совпадают"
                  })}
                  className={`input-field w-full pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Подтвердите пароль"
                />
              </div>
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="mb-6">
            <label className="form-label">Тип аккаунта</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOfficeBuilding className="h-5 w-5 text-gray-400" />
              </div>
              <select
                {...register("isKennel")}
                className="input-field w-full pl-10"
              >
                <option value="false">Частное лицо</option>
                <option value="true">Питомник</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="terms" 
                {...register("terms", { required: "Необходимо согласие с условиями" })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Я согласен с <Link to="/terms" className="text-primary-600 hover:text-primary-800">условиями использования</Link> и <Link to="/privacy" className="text-primary-600 hover:text-primary-800">политикой конфиденциальности</Link>
              </label>
            </div>
            {errors.terms && <p className="error-message">{errors.terms.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary w-full py-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
              Войти
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
