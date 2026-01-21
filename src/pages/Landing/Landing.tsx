import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Landing.css';

const Landing: React.FC = () => {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing__hero">
        <div className="landing__hero-content">
          <h1>TeamBridge</h1>
          <p>Управляйте проектами, общайтесь в чате и превращайте сообщения в задачи — в одном месте.</p>

          {isInitialized && !user ? (
            <div className="landing__hero-buttons">
              <Link to="/login" className="btn btn-primary">Войти</Link>
              <Link to="/signup" className="btn btn-secondary">Зарегистрироваться</Link>
            </div>
          ) : isInitialized && user ? (
            <div className="landing__hero-buttons">
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Перейти в проекты
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <section className="landing__demo">
        <h2>Как это работает</h2>
        <div className="landing__demo-content">
          <div className="demo-placeholder">
            <p>интерфейс</p>
          </div>
        </div>
      </section>

      <section className="landing__features">
        <div className="feature">
          <h3>Чат в реальном времени</h3>
          <p>Обсуждайте идеи, делитесь файлами и сразу переходите к делу.</p>
        </div>
        <div className="feature">
          <h3>Задачи из сообщений</h3>
          <p>Превращайте любое сообщение в задачу с дедлайном и исполнителем.</p>
        </div>
        <div className="feature">
          <h3>Доска и календарь</h3>
          <p>Контролируйте выполнение в удобном виде — списком или по дням.</p>
        </div>
      </section>

      <section className="landing__cta">
        <h2>Начните работать эффективно уже сегодня</h2>
        <Link to="/signup" className="btn btn-primary btn-large">
          Попробовать бесплатно
        </Link>
      </section>

      <footer className="landing__footer">
        <p>&copy; 2025 TeamBridge. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Landing;