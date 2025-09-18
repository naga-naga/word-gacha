import React from 'react';

interface RandomGeneratorProps {
  onGenerate: () => void;
  isLoading: boolean;
}

export const RandomGenerator: React.FC<RandomGeneratorProps> = ({ onGenerate, isLoading }) => {
  return (
    <div className="random-generator">
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="generate-button"
      >
        {isLoading ? 'ランダム生成中...' : 'ランダム生成'}
      </button>
    </div>
  );
};