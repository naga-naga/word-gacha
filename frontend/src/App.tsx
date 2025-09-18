import { useState } from 'react';
import { SentenceForm } from './components/SentenceForm';
import { RandomGenerator } from './components/RandomGenerator';
import { StoryDisplay } from './components/StoryDisplay';
import { sentenceApi } from './api';
import type { SentenceElements, Story } from './types';
import './App.css';

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleSubmitSentence = async (sentence: SentenceElements) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await sentenceApi.create(sentence);
      setMessage(response.message);
    } catch (error) {
      console.error('センテンス投稿エラー:', error);
      setMessage('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setMessage('');

    try {
      const response = await sentenceApi.getRandom();
      setStory(response.story);
    } catch (error) {
      console.error('ランダム生成エラー:', error);
      setMessage('文章生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('失敗') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
