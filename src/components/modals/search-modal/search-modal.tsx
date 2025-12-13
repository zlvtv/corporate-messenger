// src/components/modals/search-modal/search-modal.tsx
import React, { useState } from 'react';
import Modal from '../../ui/modal/modal';
import Button from '../../ui/button/button';
import styles from './search-modal.module.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Поиск по чатам">
      <input
        type="text"
        className={styles.input}
        placeholder="Введите название чата..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className={styles.results}>
        {query ? (
          <p>Результаты для "{query}"</p>
        ) : (
          <p>Введите запрос для поиска</p>
        )}
      </div>
      <div className={styles.actions}>
        <Button variant="primary" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </Modal>
  );
};

export default SearchModal;
