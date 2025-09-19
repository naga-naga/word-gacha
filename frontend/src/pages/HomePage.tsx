import { useState } from 'react';
import { SentenceForm } from '../components/SentenceForm';
import { RandomGenerator } from '../components/RandomGenerator';
import { StoryDisplay } from '../components/StoryDisplay';
import { SaveButton } from '../components/SaveButton';
import { ShareButton } from '../components/ShareButton';
import { SavedStoriesList } from '../components/SavedStoriesList';
import { FlashMessageManager } from '../components/FlashMessageManager';
import { useFlashMessage } from '../hooks/useFlashMessage';
import { sentenceApi, storyApi } from '../api';
import type { SentenceElements, Story } from '../types';

export const HomePage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [currentStoryText, setCurrentStoryText] = useState<string>('');

  const { messages, removeMessage, showSuccess, showError, showInfo } = useFlashMessage();

  const handleSubmitSentence = async (sentence: SentenceElements) => {
    setIsSubmitting(true);

    try {
      const response = await sentenceApi.create(sentence);
      showSuccess(response.message, { icon: '📝' });
    } catch (error) {
      console.error('センテンス投稿エラー:', error);
      showError('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);

    try {
      const response = await sentenceApi.getRandom();
      setStory(response.story);

      const parts = [];
      if (response.story.when) parts.push(response.story.when);
      if (response.story.where) parts.push(response.story.where);
      if (response.story.who) parts.push(response.story.who);
      if (response.story.what) parts.push(response.story.what);
      if (response.story.how) parts.push(response.story.how);

      let sentence = parts.join(' ');
      if (sentence && !sentence.endsWith('。')) {
        sentence += '。';
      }

      if (response.story.result) {
        if (sentence) sentence += ' そして';
        sentence += response.story.result;
        if (!response.story.result.endsWith('。')) {
          sentence += '。';
        }
      }

      setCurrentStoryText(sentence);
      showInfo('新しい文章が生成されました！', { icon: '🎲' });
    } catch (error) {
      console.error('ランダム生成エラー:', error);
      showError('文章生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStory = async () => {
    if (!currentStoryText) return;

    setIsSaving(true);
    try {
      await storyApi.save(currentStoryText);
      showSuccess('文章が保存されました！', { icon: '💾' });
    } catch (error) {
      console.error('文章保存エラー:', error);
      showError('文章の保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareStory = async (): Promise<string> => {
    if (!currentStoryText) throw new Error('共有する文章がありません');

    const response = await storyApi.save(currentStoryText);
    return response.story.share_url;
  };

  const handleMessage = (msg: string, isError?: boolean) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  };

  return (
    <>
      <FlashMessageManager messages={messages} onRemoveMessage={removeMessage} />

      <div className="app">
        <header className="app-header">
          <h1>ことばガチャ</h1>
          <p>みんなで文章の要素を投稿して、面白い組み合わせを楽しもう！</p>
        </header>

        <main className="app-main">
          <div className="content-grid">
            <div className="form-section">
              <SentenceForm onSubmit={handleSubmitSentence} isLoading={isSubmitting} />
            </div>

            <div className="generator-section">
              <RandomGenerator onGenerate={handleGenerateStory} isLoading={isGenerating} />
              <StoryDisplay story={story} />

              {currentStoryText && (
                <div className="story-actions">
                  <SaveButton onSave={handleSaveStory} isLoading={isSaving} />
                  <ShareButton onShare={handleShareStory} disabled={!currentStoryText} />
                </div>
              )}
            </div>
          </div>

          <div className="saved-stories-section">
            <SavedStoriesList onMessage={handleMessage} />
          </div>
        </main>
      </div>
    </>
  );
};