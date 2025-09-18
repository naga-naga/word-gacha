import axios from 'axios';
import type { SentenceElements, RandomStoryResponse, CreateSentenceResponse } from './types';

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