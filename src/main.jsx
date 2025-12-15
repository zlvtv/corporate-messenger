// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';

// ✅ Проверяем хэш ДО запуска React
const handleAuthCallback = () => {
  const hash = window.location.hash;

  // Если есть access_token, refresh_token или confirmation — это callback от Supabase
  if (
    hash.includes('access_token') ||
    hash.includes('refresh_token') ||
    hash.includes('confirmation') ||
    hash.includes('recovery') ||
    hash.includes('redirect_url')
  ) {
    // Перенаправляем на /confirm, чтобы там обработать
    window.location.href = '/confirm';
    return true;
  }

  return false;
};

// Если это callback — не запускаем React
if (!handleAuthCallback()) {
  // Запускаем прилоtжение
  createRoot(document.getElementById('root')).render(
      <App />
  );
}
