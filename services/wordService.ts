import { 
  getWordnikRandomWordUrl, 
  getWordnikRandomWordsUrl, 
  getRandomWordApiUrl,
  WordnikWord,
  RandomWordApiResponse,
  WORDNIK_API_KEY
} from "../config/api";
import { RateLimiter } from "../utils/rateLimiter";

// Create rate limiters for each API
// Wordnik allows 1000 requests per day, so we'll limit to 500 to be safe
const wordnikLimiter = new RateLimiter(500, 86400); // 500 requests per day
// Random Word API doesn't specify limits, but we'll be conservative
const randomWordLimiter = new RateLimiter(100, 3600); // 100 requests per hour

/**
 * Fetch multiple words from the specified API with rate limiting
 */
export const fetchWordsBulk = async (count: number, api: "wordnik" | "random-word"): Promise<string[]> => {
  const limiter = api === "wordnik" ? wordnikLimiter : randomWordLimiter;
  
  if (!limiter.canMakeRequest()) {
    const waitTime = limiter.getTimeUntilNextRequest();
    console.warn(`Rate limit reached for ${api} API. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    return []; // Return empty array instead of throwing
  }
  
  try {
    if (api === "wordnik") {
      // Check if API key is available
      if (!WORDNIK_API_KEY || WORDNIK_API_KEY.trim() === '') {
        console.error("Wordnik API key is missing or invalid");
        return []; // Return empty array instead of throwing
      }
      
      const response = await fetch(getWordnikRandomWordsUrl(count));
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Wordnik API error (${response.status}):`, errorText);
        return []; // Return empty array instead of throwing
      }
      const data = await response.json() as WordnikWord[];
      return data.map((wordObj) => wordObj.word.toLowerCase());
    } else {
      const response = await fetch(getRandomWordApiUrl(count));
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Random Word API error (${response.status}):`, errorText);
        return []; // Return empty array instead of throwing
      }
      return await response.json() as RandomWordApiResponse;
    }
  } catch (error) {
    console.error(`Error fetching words from ${api}:`, error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Fetch a single random word from the specified API with rate limiting
 */
export const fetchSingleRandomWord = async (api: "wordnik" | "random-word"): Promise<string> => {
  const limiter = api === "wordnik" ? wordnikLimiter : randomWordLimiter;
  
  if (!limiter.canMakeRequest()) {
    const waitTime = limiter.getTimeUntilNextRequest();
    console.warn(`Rate limit reached for ${api} API. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    return 'safe';
  }
  
  try {
    if (api === "wordnik") {
      // Check if API key is available
      if (!WORDNIK_API_KEY || WORDNIK_API_KEY.trim() === '') {
        console.error("Wordnik API key is missing or invalid");
        return 'safe';
      }
      
      const response = await fetch(getWordnikRandomWordUrl());
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Wordnik API error (${response.status}):`, errorText);
        return 'safe';
      }
      const data = await response.json() as WordnikWord;
      return data.word.toLowerCase();
    } else {
      const response = await fetch(getRandomWordApiUrl(1));
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Random Word API error (${response.status}):`, errorText);
        return 'safe';
      }
      const [word] = await response.json() as RandomWordApiResponse;
      return word.toLowerCase();
    }
  } catch (error) {
    console.error(`Error fetching word from ${api}:`, error);
    return 'safe';
  }
};

/**
 * Fetch random words with fallback between APIs and filtering for blocked words
 */
export const fetchRandomWords = async (count: number, blockedWords: string[]): Promise<string[]> => {
  let words: string[] = [];
  
  // Try bulk fetch from Wordnik first
  words = await fetchWordsBulk(count, "wordnik");
  
  // If Wordnik fails, try random-word API
  if (!words || words.length === 0) {
    console.log("Wordnik API failed, trying random-word API");
    words = await fetchWordsBulk(count, "random-word");
  }

  // If both APIs fail, use fallback
  if (!words || words.length === 0) {
    console.log("Both APIs failed, using fallback words");
    return Array(count).fill(0).map((_, i) => `word${i+1}`);
  }

  // Filter out blocked words and replace them
  const replacementsNeeded = words.filter(word => blockedWords.includes(word)).length;
  if (replacementsNeeded > 0) {
    const replacementPromises = Array(replacementsNeeded).fill(null).map(async () => {
      let word = await fetchSingleRandomWord("wordnik");
      if (blockedWords.includes(word)) {
        word = await fetchSingleRandomWord("random-word");
      }
      return word;
    });

    const replacements = await Promise.all(replacementPromises);
    let replacementIndex = 0;
    words = words.map(word => 
      blockedWords.includes(word) ? replacements[replacementIndex++] : word
    );
  }

  return words;
}; 