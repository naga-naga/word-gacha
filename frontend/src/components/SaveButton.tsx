import React from 'react';

interface SaveButtonProps {
  onSave: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ onSave, isLoading, disabled = false }) => {
  return (
    <button
      onClick={onSave}
      disabled={isLoading || disabled}
      className="save-button"
    >
      {isLoading ? '保存中...' : '文章を保存'}
    </button>
  );
};