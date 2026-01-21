import React, { useState, useEffect, useRef } from 'react';
import styles from './project-chat.module.css';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import DOMPurify from 'dompurify';
import CreateTaskModal from '../../components/modals/create-task-modal/create-task-modal';
import { getMessages, sendMessage, subscribeToMessages } from '../../lib/firestore';

const ProjectChat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentProject } = useProject();
  const { user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    message: any;
  }>({
    show: false,
    x: 0,
    y: 0,
    message: null,
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    if (!currentProject?.id) return;

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToMessages(currentProject.id, (fetchedMessages) => {
      setMessages(fetchedMessages);
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
      await sendMessage(currentProject.id, newMessage.trim(), user.id);
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
    const handleClick = () => {
      setContextMenu({ show: false, x: 0, y: 0, message: null });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const showContextMenu = (e: React.MouseEvent, message: any) => {
    e.preventDefault();
    if (message.sender_id !== user?.id) return; 

    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      message,
    });
  };

  const renderContent = (content: string) => {
    return {
      __html: DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      }),
    };
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
            const sender = isMyMessage ? user : { ...msg.profiles }; 

            return (
              <div
                key={msg.id}
                className={`${styles.message} ${isMyMessage ? styles['message-mine'] : ''}`}
                onContextMenu={(e) => showContextMenu(e, msg)}
                title="Правый клик — создать задачу"
              >
                {!isMyMessage && (
                  <div
                    className={styles['avatar']}
                    style={{ backgroundImage: sender.avatar_url ? `url(${sender.avatar_url})` : 'none' }}
                    title={sender.full_name || sender.username}
                  >
                    {!sender.avatar_url && (
                      <span>{(sender.full_name || sender.username)?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                )}

                <div className={styles['message-content']}>
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
            <button
              className={styles.menuItem}
              onClick={() => {
                setIsTaskModalOpen(true);
                setContextMenu({ show: false, x: 0, y: 0, message: null });
              }}
            >
              📌 Сделать задачей
            </button>
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

      <div className={styles['char-count']}>{newMessage.length}/4000</div>
    </div>
  );
};

export default ProjectChat;
