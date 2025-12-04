// src/components/modals/search-modal/search-modal.tsx
import React, { useRef, useState } from 'react';
import { useUI } from '../../../contexts/UIContext';
import styles from './search-modal.module.css';

interface SearchModalProps {
  anchorEl: HTMLElement;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ anchorEl, onClose }) => {
  const [query, setQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Позиционирование — справа от иконки
  const rect = anchorEl.getBoundingClientRect();
  const top = rect.top;
  const left = rect.right + 8; // 8px отступ

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className={styles['search-modal-backdrop']}
      onClick={handleOutsideClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={styles['search-modal']}
        style={{ top, left }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles['search-modal__title']}>Поиск по чатам</h3>
        <input
          type="text"
          className={styles['search-modal__input']}
          placeholder="Введите название чата..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className={styles['search-modal__results']}>
          {query ? (
            <p>Результаты для "{query}"</p>
          ) : (
            <p>Введите запрос для поиска</p>
          )}
        </div>
        <button
          className={styles['search-modal__close']}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SearchModal;
