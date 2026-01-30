import React from 'react';
import Modal from '../../ui/modal/modal';
import styles from './confirm-modal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={styles.confirmButton}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
