import React, { useState, useEffect, useRef } from 'react';
import styles from './project-chat.module.css';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import DOMPurify from 'dompurify';
import CreateTaskModal from '../../components/modals/create-task-modal/create-task-modal';
import { getMessages, sendMessage, subscribeToMessages } from '../../lib/firestore';
import { encryptMessage, decryptMessage } from '../../lib/crypto';

const ProjectChat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentProject } = useProject();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    message: any;
    type: 'message' | 'text';
  }>({
    show: false,
    x: 0,
    y: 0,
    message: null,
    type: 'text',
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    if (!currentProject?.id) return;

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToMessages(currentProject.id, (fetchedMessages) => {
      const sortedMessages = [...fetchedMessages].sort((a, b) => {
        const aTime = a.created_at?.seconds || 0;
        const bTime = b.created_at?.seconds || 0;
        return aTime - bTime;
      });
      setMessages(sortedMessages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentProject?.id]);



  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentProject || !user) return;
    if (newMessage.length > 4000) {
      setError('Сообщение не может быть длиннее 4000 символов');
      return;
    }

    setError(null);

    try {
      const encryptedText = encryptMessage(newMessage.trim(), currentProject.id);
      await sendMessage(currentProject.id, encryptedText, user.id);
      setNewMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err: any) {
      setError('Ошибка отправки сообщения');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        return; 
      }
      setContextMenu({ show: false, x: 0, y: 0, message: null });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const renderContent = (content: string) => {
    try {
      const decrypted = content ? decryptMessage(content, currentProject!.id) : '';
      return {
        __html: DOMPurify.sanitize(decrypted, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        }),
      };
    } catch (err) {
      return { __html: '' }; 
    }
  };

  const formatTime = (dateString: string) => {
    try {
      if (dateString && typeof dateString === 'object' && 'seconds' in dateString) {
        const date = new Date(dateString.seconds * 1000);
        return date.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (err) {
      return '';
    }
  };

  if (!currentProject) {
    return (
      <div className={styles.chat}>
        <div className={styles.placeholder}>Выберите проект</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.chat}>
        <div className={styles.loading}>Загрузка сообщений...</div>
      </div>
    );
  }

  return (
    <div className={styles.chat}>
      <div className={styles['messages-container']}>
        {messages.length === 0 ? (
          <div className={styles.placeholder}>Нет сообщений. Начните общение!</div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.sender_id === user?.id;
            const sender = isMyMessage 
              ? user 
              : (msg.sender_profile || 
                 currentOrganization?.organization_members?.find(m => m.user_id === msg.sender_id)?.user || 
                 { full_name: 'Пользователь', username: 'Пользователь' });

            const senderName = sender?.full_name || sender?.username || sender?.email || 'Пользователь';

            return (
              <div
                key={msg.id}
                className={`${styles.message} ${isMyMessage ? styles['message-mine'] : ''}`}
                onMouseDown={(e) => {
                  const selection = window.getSelection();
                  if (selection && selection.toString().length > 0) {
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const selection = window.getSelection();
                  const textSelected = selection && selection.toString().length > 0;
                  setContextMenu({
                    show: true,
                    x: e.clientX,
                    y: e.clientY,
                    message: msg,
                    type: textSelected ? 'text' : 'message',
                  });
                }}
                title="Правый клик — управление сообщением"
              >
                <div className={styles['avatar']} title={senderName}>
                  {sender?.avatar_url ? (
                    <img src={sender.avatar_url} alt="" />
                  ) : (
                    <span>{senderName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className={styles['message-content']}>
                  <div className={styles['message-sender']}>{senderName}</div>
                  <div
                    className={styles['message-text']}
                    dangerouslySetInnerHTML={renderContent(msg.text)}
                  />
                  <div className={styles['message-time']}>{formatTime(msg.created_at)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />

        {contextMenu.show && (
          <div
            className={styles.contextMenu}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <>
              <button
                className={styles.menuItem}
                onClick={() => {
                  try {
                    const decrypted = decryptMessage(contextMenu.message.text, currentProject!.id);
                    navigator.clipboard.writeText(decrypted);
                  } catch {
                    navigator.clipboard.writeText(contextMenu.message.text);
                  }
                  setContextMenu({ show: false, x: 0, y: 0, message: null, type: 'message' });
                }}
              >
                📋 Копировать
              </button>
              <button
                className={styles.menuItem}
                onClick={() => {
                  setIsTaskModalOpen(true);
                  setContextMenu({ show: false, x: 0, y: 0, message: null, type: 'message' });
                }}
              >
                Сделать задачей
              </button>
              {contextMenu.message.sender_id === user?.id && (
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setContextMenu({ show: false, x: 0, y: 0, message: null, type: 'message' });
                    alert('Удаление сообщения пока не реализовано');
                  }}
                >
                  🗑️ Удалить
                </button>
              )}
            </>
          </div>
        )}

        {isTaskModalOpen && (
          <CreateTaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            sourceMessageId={contextMenu.message?.id}
            initialContent={contextMenu.message?.text}
          />
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSendMessage} className={styles['input-form']}>
        <textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value.slice(0, 4000));
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          placeholder="Напишите сообщение..."
          className={styles['input-textarea']}
          maxLength={4000}
          rows={1}
        />
        <button type="submit" className={styles['send-button']} disabled={!newMessage.trim()}>
          Отправить
        </button>
      </form>
    </div>
  );
};

export default ProjectChat;
