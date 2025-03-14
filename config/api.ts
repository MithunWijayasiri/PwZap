if (!process.env.NEXT_PUBLIC_WORDNIK_API_KEY) {
  console.warn('Warning: NEXT_PUBLIC_WORDNIK_API_KEY is not set in environment variables');
}

export const WORDNIK_API_KEY = process.env.NEXT_PUBLIC_WORDNIK_API_KEY || '';

export const API_ENDPOINTS = {
  WORDNIK: {
    RANDOM_WORD: 'https://api.wordnik.com/v4/words.json/randomWord',
    RANDOM_WORDS: 'https://api.wordnik.com/v4/words.json/randomWords',
  },
  RANDOM_WORD_API: {
    BASE: 'https://random-word-api.herokuapp.com/word',
  },
} as const;

// API Response Types
export interface WordnikWord {
  id: number;
  word: string;
}

export type RandomWordApiResponse = string[];

export const getWordnikRandomWordUrl = () => 
  `${API_ENDPOINTS.WORDNIK.RANDOM_WORD}?hasDictionaryDef=true&minCorpusCount=10000&minLength=3&maxLength=8&api_key=${WORDNIK_API_KEY}`;

export const getWordnikRandomWordsUrl = (count: number) => 
  `${API_ENDPOINTS.WORDNIK.RANDOM_WORDS}?hasDictionaryDef=true&minCorpusCount=10000&minLength=3&maxLength=8&limit=${count}&api_key=${WORDNIK_API_KEY}`;

export const getRandomWordApiUrl = (count: number) => 
  `${API_ENDPOINTS.RANDOM_WORD_API.BASE}?number=${count}&length=5`; 