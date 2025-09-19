import { useState, useCallback } from 'react';
import type { FlashMessageData } from '../components/FlashMessage';

export const useFlashMessage = () => {
  const [messages, setMessages] = useState<FlashMessageData[]>([]);

  const addMessage = useCallback((
    type: 'success' | 'error' | 'info',
    message: string,
    options?: {
      icon?: string;
      duration?: number;
    }
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newMessage: FlashMessageData = {
      id,
      type,
      message,
      icon: options?.icon,
      duration: options?.duration,
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
  }, []);

  const showSuccess = useCallback((message: string, options?: { icon?: string; duration?: number }) => {
    addMessage('success', message, options);
  }, [addMessage]);

  const showError = useCallback((message: string, options?: { icon?: string; duration?: number }) => {
    addMessage('error', message, options);
  }, [addMessage]);

  const showInfo = useCallback((message: string, options?: { icon?: string; duration?: number }) => {
    addMessage('info', message, options);
  }, [addMessage]);

  return {
    messages,
    removeMessage,
    clearAll,
    showSuccess,
    showError,
    showInfo,
  };
};