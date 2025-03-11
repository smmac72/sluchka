import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

export const formatDate = (date) => {
  if (!date) return "";
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Сегодня, ${format(dateObj, "HH:mm")}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Вчера, ${format(dateObj, "HH:mm")}`;
  }
  
  return format(dateObj, "d MMMM yyyy, HH:mm", { locale: ru });
};

export const formatDateShort = (date) => {
  if (!date) return "";
  
  const dateObj = new Date(date);
  
  return format(dateObj, "d MMM yyyy", { locale: ru });
};

export const formatTime = (date) => {
  if (!date) return "";
  
  const dateObj = new Date(date);
  
  return format(dateObj, "HH:mm");
};

export const formatRelativeTime = (date) => {
  if (!date) return "";
  
  const dateObj = new Date(date);
  
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ru });
};

export const formatDateForInput = (date) => {
  if (!date) return "";
  
  const dateObj = new Date(date);
  
  return format(dateObj, "yyyy-MM-dd");
};

// Calculate age from birthdate
export const calculateAge = (birthdate) => {
  if (!birthdate) return "Не указано";
  
  const birth = new Date(birthdate);
  const today = new Date();
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  
  // Format age string based on Russian grammar rules
  const formatYears = (years) => {
    if (years === 0) return "";
    
    const lastDigit = years % 10;
    const lastTwoDigits = years % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return `${years} лет`;
    }
    
    if (lastDigit === 1) {
      return `${years} год`;
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${years} года`;
    }
    
    return `${years} лет`;
  };
  
  const formatMonths = (months) => {
    if (months === 0) return "";
    
    const lastDigit = months % 10;
    
    if (months >= 11 && months <= 19) {
      return `${months} месяцев`;
    }
    
    if (lastDigit === 1) {
      return `${months} месяц`;
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${months} месяца`;
    }
    
    return `${months} месяцев`;
  };
  
  const yearsStr = formatYears(years);
  const monthsStr = formatMonths(months);
  
  if (yearsStr && monthsStr) {
    return `${yearsStr} ${monthsStr}`;
  }
  
  return yearsStr || monthsStr || "Менее месяца";
};
