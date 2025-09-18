import React, { useState, useEffect } from 'react';
import { storyApi } from '../api';
import type { GeneratedStory } from '../types';

interface SavedStoriesListProps {
  onMessage: (message: string, isError?: boolean) => void;
}

export const SavedStoriesList: React.FC<SavedStoriesListProps> = ({ onMessage }) => {
  const [stories, setStories] = useState<GeneratedStory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const response = await storyApi.getAll();
      setStories(response.stories);
    } catch (error) {
      console.error('保存済み文章の取得エラー:', error);
      onMessage('保存済み文章の取得に失敗しました', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (shareToken: string) => {
    if (!confirm('この文章を削除してもよろしいですか？')) return;

    setDeletingIds(prev => new Set([...prev, shareToken]));
    try {
      await storyApi.delete(shareToken);
      setStories(prev => prev.filter(story => story.share_token !== shareToken));
      onMessage('文章が削除されました');
    } catch (error) {
      console.error('文章削除エラー:', error);
      onMessage('文章の削除に失敗しました', true);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(shareToken);
        return newSet;
      });
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      onMessage('URLをコピーしました');
    } catch (error) {
      console.error('コピーエラー:', error);
      onMessage('URLのコピーに失敗しました', true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchStories();
  }, []);

  if (isLoading) {
    return (
      <div className="saved-stories">
        <h3>保存した文章</h3>
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="saved-stories">
      <div className="saved-stories-header">
        <h3>保存した文章</h3>
        <button onClick={fetchStories} className="refresh-button">
          更新
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="empty-state">
          まだ保存された文章がありません
        </div>
      ) : (
        <div className="stories-list">
          {stories.map((story) => (
            <div key={story.id} className="story-item">
              <div className="story-content">
                {story.story_text}
              </div>
              <div className="story-meta">
                <span className="story-date">{formatDate(story.created_at)}</span>
                <div className="story-actions">
                  <button
                    onClick={() => copyToClipboard(story.share_url)}
                    className="copy-button"
                  >
                    URLコピー
                  </button>
                  <button
                    onClick={() => handleDelete(story.share_token)}
                    disabled={deletingIds.has(story.share_token)}
                    className="delete-button"
                  >
                    {deletingIds.has(story.share_token) ? '削除中...' : '削除'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};