// src/components/ui/Modal/Modal.tsx
import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  anchorEl?: HTMLElement | null; // ← новый проп
  position?: 'bottom-start' | 'bottom-end' | 'right-start'; // ← позиция
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  anchorEl,
  position = 'bottom-start',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Расчёт позиции
  let style = {};
  if (anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const space = 8;

    switch (position) {
      case 'bottom-start':
        style = { top: rect.bottom + space, left: rect.left };
        break;
      case 'bottom-end':
        style = { top: rect.bottom + space, right: window.innerWidth - rect.right };
        break;
      case 'right-start':
        style = { top: rect.top, left: rect.right + space };
        break;
      default:
        break;
    }
  }

  return (
    <div
      className={styles.modal__backdrop}
      onClick={handleClickOutside}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${styles[`modal--${size}`]}`}
        style={style}
      >
        <div className={styles.modal__header}>
          <h2 className={styles.modal__title}>{title}</h2>
          <button
            className={styles.modal__closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className={styles.modal__content}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
