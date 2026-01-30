import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Landing.css';
import Carousel from '../../components/carousel/carousel';
import Slide from '../../components/slide/slide';

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
        <p>Посмотрите, как TeamBridge упрощает командную работу</p>
        
        <Carousel>
          <Slide 
            title="Чат и задачи в одном месте" 
            description="Обсуждайте идеи в чате и мгновенно превращайте важные сообщения в задачи с исполнителями и сроками." 
            imageUrl="/images/demo-chat-to-task.jpg" 
          />
          <Slide 
            title="Удобная доска задач" 
            description="Организуйте работу с помощью гибкой доски задач: группируйте, перемещайте и отслеживайте прогресс в реальном времени." 
            imageUrl="/images/demo-task-board.jpg" 
          />
          <Slide 
            title="Календарь и планирование" 
            description="Визуализируйте загрузку команды и сроки выполнения задач в удобном календаре." 
            imageUrl="/images/demo-calendar.jpg" 
          />
        </Carousel>
      </section>

      <section className="landing__features">
        <div className="feature">
          <div className="feature-icon">💬</div>
          <h3>Шифрованный чат</h3>
          <p>Обсуждайте идеи в защищенном чате. Все сообщения шифруются на серверe.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📋</div>
          <h3>Умные задачи</h3>
          <p>Превращайте сообщения в задачи с приоритетами, статусами и сроками выполнения. Отслеживайте прогресс команды.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📊</div>
          <h3>Гибкое планирование</h3>
          <p>Управляйте проектами с помощью доски задач и календаря. Планируйте загрузку команды и отслеживайте сроки.</p>
        </div>
      </section>

      <section className="landing__cta">
        <h2>Начните работать эффективно уже сегодня</h2>
        <Link to="/signup" className="btn btn-primary btn-large">
          Попробовать бесплатно
        </Link>
      </section>

      <footer className="landing__footer">
        <p>&copy; 2026 TeamBridge.</p>
      </footer>
    </div>
  );
};

export default Landing;
