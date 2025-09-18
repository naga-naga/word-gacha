import React, { useState } from 'react';
import type { SentenceElements } from '../types';

interface SentenceFormProps {
  onSubmit: (sentence: SentenceElements) => void;
  isLoading: boolean;
}

export const SentenceForm: React.FC<SentenceFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SentenceElements>({
    when_element: '',
    where_element: '',
    who_element: '',
    what_element: '',
    how_element: '',
    result_element: '',
  });

  const handleChange = (field: keyof SentenceElements) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value.trim() !== '')
    ) as SentenceElements;

    onSubmit(filteredData);

    setFormData({
      when_element: '',
      where_element: '',
      who_element: '',
      what_element: '',
      how_element: '',
      result_element: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="sentence-form">
      <h2>センテンス投稿</h2>

      <div className="form-group">
        <label htmlFor="when">いつ:</label>
        <input
          id="when"
          type="text"
          value={formData.when_element}
          onChange={handleChange('when_element')}
          placeholder="昨日の夜、今朝、夏休みに..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="where">どこで:</label>
        <input
          id="where"
          type="text"
          value={formData.where_element}
          onChange={handleChange('where_element')}
          placeholder="公園で、学校で、家で..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="who">誰が:</label>
        <input
          id="who"
          type="text"
          value={formData.who_element}
          onChange={handleChange('who_element')}
          placeholder="太郎が、先生が、猫が..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="what">何を:</label>
        <input
          id="what"
          type="text"
          value={formData.what_element}
          onChange={handleChange('what_element')}
          placeholder="りんごを、宿題を、ボールを..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="how">どうした:</label>
        <input
          id="how"
          type="text"
          value={formData.how_element}
          onChange={handleChange('how_element')}
          placeholder="食べた、忘れた、投げた..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="result">そしてどうなった:</label>
        <input
          id="result"
          type="text"
          value={formData.result_element}
          onChange={handleChange('result_element')}
          placeholder="お腹が痛くなった、怒られた、窓が割れた..."
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? '投稿中...' : '投稿する'}
      </button>
    </form>
  );
};