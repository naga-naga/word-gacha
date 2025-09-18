import axios from 'axios';
import type {
  SentenceElements,
  RandomStoryResponse,
  CreateSentenceResponse,
  SaveStoryResponse,
  StoriesListResponse,
  SharedStoryResponse
} from './types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sentenceApi = {
  create: async (sentence: SentenceElements): Promise<CreateSentenceResponse> => {
    const response = await api.post('/sentences', { sentence });
    return response.data;
  },

  getRandom: async (): Promise<RandomStoryResponse> => {
    const response = await api.get('/sentences/random');
    return response.data;
  },
};

export const storyApi = {
  save: async (storyText: string): Promise<SaveStoryResponse> => {
    const response = await api.post('/stories', { story: { story_text: storyText } });
    return response.data;
  },

  getAll: async (): Promise<StoriesListResponse> => {
    const response = await api.get('/stories');
    return response.data;
  },

  getByToken: async (shareToken: string): Promise<SharedStoryResponse> => {
    const response = await api.get(`/stories/${shareToken}`);
    return response.data;
  },

  delete: async (shareToken: string): Promise<{ message: string }> => {
    const response = await api.delete(`/stories/${shareToken}`);
    return response.data;
  },
};