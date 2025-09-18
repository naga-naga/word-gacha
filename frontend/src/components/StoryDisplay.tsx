import React from 'react';
import type { Story } from '../types';

interface StoryDisplayProps {
  story: Story | null;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story }) => {
  if (!story) {
    return (
      <div className="story-display">
        <h3>生成された文章</h3>
        <div className="story-content empty">
          「ランダム生成」ボタンを押して面白い文章を作ってみましょう！
        </div>
      </div>
    );
  }

  const formatStory = (story: Story) => {
    const parts = [];

    if (story.when) parts.push(story.when);
    if (story.where) parts.push(story.where);
    if (story.who) parts.push(story.who);
    if (story.what) parts.push(story.what);
    if (story.how) parts.push(story.how);

    let sentence = parts.join(' ');
    if (sentence && !sentence.endsWith('。')) {
      sentence += '。';
    }

    if (story.result) {
      if (sentence) sentence += ' そして';
      sentence += story.result;
      if (!story.result.endsWith('。')) {
        sentence += '。';
      }
    }

    return sentence || '文章が生成できませんでした。もう少しセンテンスを投稿してみてください。';
  };

  return (
    <div className="story-display">
      <h3>生成された文章</h3>
      <div className="story-content">
        {formatStory(story)}
      </div>
    </div>
  );
};