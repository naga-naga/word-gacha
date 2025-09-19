import React from 'react';
import { FlashMessage, type FlashMessageData } from './FlashMessage';

interface FlashMessageManagerProps {
  messages: FlashMessageData[];
  onRemoveMessage: (id: string) => void;
}

export const FlashMessageManager: React.FC<FlashMessageManagerProps> = ({
  messages,
  onRemoveMessage,
}) => {
  if (messages.length === 0) return null;

  return (
    <>
      {messages.map((message, index) => (
        <div
          key={message.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 80}px`, // Stack messages vertically
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999 - index, // Ensure newer messages appear on top
          }}
        >
          <FlashMessage
            message={message}
            onClose={onRemoveMessage}
          />
        </div>
      ))}
    </>
  );
};