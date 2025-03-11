// frontend/src/pages/Login.js
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { HiMail, HiLockClosed } from "react-icons/hi";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, data);
      login(response.data.token, response.data.user);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Произошла ошибка при входе. Пожалуйста, проверьте ваши учетные данные."
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
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Добро пожаловать!</h1>
        <p className="text-gray-600">Войдите в свой аккаунт для доступа к платформе</p>
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
            <div className="flex justify-between items-center">
              <label className="form-label">Пароль</label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
                Забыли пароль?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiLockClosed className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                {...register("password", { required: "Пароль обязателен" })}
                className={`input-field w-full pl-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Введите пароль"
              />
            </div>
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary w-full py-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
