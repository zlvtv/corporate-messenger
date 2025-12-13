// src/components/ui/modal/modal.tsx
import React, { useEffect, useRef } from 'react';
import styles from './modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  title?: string;
  disableEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 500,
  title,
  disableEscape = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Закрытие по Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, disableEscape]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleOutsideClick}
      role="button"
      tabIndex={-1}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Модальное окно'}
      >
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
