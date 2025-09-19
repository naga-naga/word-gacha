import React, { useEffect, useState } from 'react';

export interface FlashMessageData {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  icon?: string;
  duration?: number;
}

interface FlashMessageProps {
  message: FlashMessageData;
  onClose: (id: string) => void;
}

export const FlashMessage: React.FC<FlashMessageProps> = ({ message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, message.duration || 5000);

    return () => clearTimeout(timer);
  }, [message.duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(message.id);
    }, 300); // Animation duration
  };

  const getIcon = () => {
    if (message.icon) return message.icon;

    switch (message.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`flash-message ${message.type} ${isClosing ? 'closing' : ''}`}>
      <div className="flash-message-content">
        <span className="flash-message-icon">{getIcon()}</span>
        <span>{message.message}</span>
      </div>
      <button
        className="flash-message-close"
        onClick={handleClose}
        aria-label="メッセージを閉じる"
      >
        ×
      </button>
    </div>
  );
};