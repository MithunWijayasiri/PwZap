import { 
  getWordnikRandomWordUrl, 
  getWordnikRandomWordsUrl, 
  getRandomWordApiUrl,
  WordnikWord,
  RandomWordApiResponse
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
    throw new Error(`Rate limit reached for ${api} API. Please try again later.`);
  }
  
  try {
    if (api === "wordnik") {
      const response = await fetch(getWordnikRandomWordsUrl(count));
      if (!response.ok) throw new Error("Failed to fetch words from Wordnik");
      const data = await response.json() as WordnikWord[];
      return data.map((wordObj) => wordObj.word.toLowerCase());
    } else {
      const response = await fetch(getRandomWordApiUrl(count));
      if (!response.ok) throw new Error("Failed to fetch words from random-word API");
      return await response.json() as RandomWordApiResponse;
    }
  } catch (error) {
    console.error(`Error fetching words from ${api}:`, error);
    throw error;
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
    throw new Error(`Rate limit reached for ${api} API. Please try again later.`);
  }
  
  try {
    if (api === "wordnik") {
      const response = await fetch(getWordnikRandomWordUrl());
      if (!response.ok) throw new Error("Failed to fetch word from Wordnik");
      const data = await response.json() as WordnikWord;
      return data.word.toLowerCase();
    } else {
      const response = await fetch(getRandomWordApiUrl(1));
      if (!response.ok) throw new Error("Failed to fetch word from random-word API");
      const [word] = await response.json() as RandomWordApiResponse;
      return word.toLowerCase();
    }
  } catch (error) {
    console.error(`Error fetching word from ${api}:`, error);
    throw error;
  }
};

/**
 * Fetch random words with fallback between APIs and filtering for blocked words
 */
export const fetchRandomWords = async (count: number, blockedWords: string[]): Promise<string[]> => {
  let words: string[] = [];
  
  // Try bulk fetch from Wordnik first
  try {
    words = await fetchWordsBulk(count, "wordnik");
  } catch (error) {
    // Fallback to random-word API if Wordnik fails
    try {
      words = await fetchWordsBulk(count, "random-word");
    } catch (secondError) {
      return Array(count).fill("safe"); // Ultimate fallback
    }
  }

  // Filter out blocked words and replace them
  const replacementsNeeded = words.filter(word => blockedWords.includes(word)).length;
  if (replacementsNeeded > 0) {
    const replacementPromises = Array(replacementsNeeded).fill(null).map(async () => {
      let word: string;
      let attempts = 0;
      const maxAttempts = 5; // Reduced retries for speed
      
      do {
        attempts++;
        try {
          word = await fetchSingleRandomWord("wordnik");
        } catch (error) {
          try {
            word = await fetchSingleRandomWord("random-word");
          } catch (secondError) {
            word = "safe";
            break;
          }
        }
      } while (blockedWords.includes(word) && attempts < maxAttempts);
      
      return blockedWords.includes(word) ? "safe" : word;
    });

    const replacements = await Promise.all(replacementPromises);
    let replacementIndex = 0;
    words = words.map(word => 
      blockedWords.includes(word) ? replacements[replacementIndex++] : word
    );
  }

  return words;
}; 