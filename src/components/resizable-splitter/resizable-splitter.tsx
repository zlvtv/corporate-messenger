// src/components/resizable-splitter/resizable-splitter.tsx
import React, { useRef, useEffect } from 'react';
import { useUI } from '../../contexts/UIContext';
import styles from './resizable-splitter.module.css';

const ResizableSplitter: React.FC = () => {
  const { chatWidth, setChatWidth } = useUI();
  const splitterRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !splitterRef.current) return;
      const newWidth = e.clientX - splitterRef.current.getBoundingClientRect().width / 2;
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'default';
    };

    if (isDraggingRef.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setChatWidth]);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  return (
    <div
      ref={splitterRef}
      className={styles['resizable-splitter']}
      onMouseDown={handleMouseDown}
      aria-label="Разделитель окон"
      title="Перетащите, чтобы изменить ширину"
    />
  );
};

export default ResizableSplitter;
