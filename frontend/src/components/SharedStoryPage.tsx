import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storyApi } from '../api';
import type { GeneratedStory } from '../types';

export const SharedStoryPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      if (!shareToken) {
        setError('共有URLが正しくありません');
        setIsLoading(false);
        return;
      }

      try {
        const response = await storyApi.getByToken(shareToken);
        setStory(response.story);
      } catch (error) {
        console.error('共有文章の取得エラー:', error);
        setError('文章が見つかりませんでした');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [shareToken]);

  const copyToClipboard = async () => {
    if (!story) return;

    try {
      await navigator.clipboard.writeText(story.story_text);
      alert('文章をコピーしました！');
    } catch (error) {
      console.error('コピーエラー:', error);
      alert('文章のコピーに失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="shared-story-page">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="shared-story-page">
        <div className="error-message">
          <h2>エラー</h2>
          <p>{error || '文章が見つかりませんでした'}</p>
          <Link to="/" className="back-link">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="shared-story-page">
      <header className="shared-story-header">
        <h1>ことばガチャ</h1>
        <p>共有された面白い文章</p>
      </header>

      <main className="shared-story-main">
        <div className="shared-story-container">
          <div className="story-display shared-story">
            <h3>生成された文章</h3>
            <div className="story-content">
              {story.story_text}
            </div>
          </div>

          <div className="story-info">
            <p className="creation-date">
              作成日時: {formatDate(story.created_at)}
            </p>
            <div className="story-actions">
              <button onClick={copyToClipboard} className="copy-story-button">
                文章をコピー
              </button>
            </div>
          </div>

          <div className="call-to-action">
            <p>あなたも面白い文章を作ってみませんか？</p>
            <Link to="/" className="create-button">
              ことばガチャを始める
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};