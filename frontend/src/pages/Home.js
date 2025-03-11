// frontend/src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiSearch, HiShieldCheck, HiChat, HiDocumentText } from "react-icons/hi";

export default function Home() {
  const benefits = [
    {
      icon: <HiSearch className="h-8 w-8 text-primary-600" />,
      title: "Точный поиск",
      description: "Подробные фильтры для поиска идеального партнера для вашего питомца по породе, возрасту, здоровью."
    },
    {
      icon: <HiShieldCheck className="h-8 w-8 text-primary-600" />,
      title: "Верификация",
      description: "Проверка документов, подтверждение здоровья и родословной для максимальной безопасности."
    },
    {
      icon: <HiChat className="h-8 w-8 text-primary-600" />,
      title: "Коммуникация",
      description: "Удобный чат с владельцами, календарь встреч и оповещения о важных событиях."
    },
    {
      icon: <HiDocumentText className="h-8 w-8 text-primary-600" />,
      title: "Документы",
      description: "Автоматическое формирование договоров для оформления всех необходимых условий."
    }
  ];

  const testimonials = [
    {
      quote: "Благодаря этой платформе мы нашли идеального партнера для нашей собаки. Всё прошло гладко, без лишних хлопот!",
      author: "Елена К.",
      role: "Владелец собаки"
    },
    {
      quote: "Как владелец питомника, я ценю возможность демонстрировать все документы и достижения наших животных. Это повышает доверие клиентов.",
      author: "Игорь П.",
      role: "Заводчик"
    }
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-secondary-700 rounded-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Специализированная платформа<br />для случки животных
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-white/90 mb-10 max-w-3xl mx-auto"
          >
            Объединяем владельцев и заводчиков для безопасной и удобной организации случки животных с подтверждёнными данными и прозрачными условиями
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/browse" className="btn-accent py-3 px-8 text-lg font-medium rounded-xl">
              Начать поиск
            </Link>
            <Link to="/register" className="bg-white text-primary-700 py-3 px-8 rounded-xl text-lg font-medium hover:bg-gray-100 transition">
              Создать аккаунт
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Преимущества нашей платформы</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы создали специализированный сервис, который учитывает все нюансы организации случки животных
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-100 py-20 rounded-3xl">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Как это работает</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Четыре простых шага для организации случки вашего животного
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative">
              <div className="absolute top-0 left-0 -ml-4 -mt-4 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">1</div>
              <div className="bg-white p-8 rounded-2xl shadow-md h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Создайте профиль животного</h3>
                <p className="text-gray-600">
                  Добавьте все необходимые данные о своем питомце, загрузите документы, фотографии и подтвердите родословную.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-0 left-0 -ml-4 -mt-4 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">2</div>
              <div className="bg-white p-8 rounded-2xl shadow-md h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Создайте объявление</h3>
                <p className="text-gray-600">
                  Опишите условия случки, добавьте необходимые требования и прикрепите профиль своего животного.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-0 left-0 -ml-4 -mt-4 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">3</div>
              <div className="bg-white p-8 rounded-2xl shadow-md h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Общайтесь с потенциальными партнерами</h3>
                <p className="text-gray-600">
                  Используйте встроенный чат для обсуждения деталей, проверки документов и согласования условий встречи.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-0 left-0 -ml-4 -mt-4 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">4</div>
              <div className="bg-white p-8 rounded-2xl shadow-md h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Заключите договор и организуйте встречу</h3>
                <p className="text-gray-600">
                  Сформируйте договор с помощью нашего генератора, назначьте встречу через календарь и завершите сделку.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Отзывы наших пользователей</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Что говорят клиенты о нашей платформе
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-md border border-gray-100"
            >
              <svg className="h-10 w-10 text-primary-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-700 mb-6 text-lg italic">{testimonial.quote}</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 py-16 rounded-3xl">
        <div className="text-center max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-6">Готовы начать?</h2>
          <p className="text-xl text-white/90 mb-10">
            Присоединяйтесь к нашей платформе уже сегодня и найдите идеального партнера для вашего питомца!
          </p>
          <Link to="/register" className="bg-white text-primary-700 py-3 px-8 rounded-xl text-lg font-medium hover:bg-gray-100 transition">
            Создать бесплатный аккаунт
          </Link>
        </div>
      </section>
    </div>
  );
}
