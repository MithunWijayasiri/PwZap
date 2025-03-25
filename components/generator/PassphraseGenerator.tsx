import React from "react";
import { GeneratorMode } from "../../types/generator";

// Base64-encoded blocked words (refined list)
const encodedBlockedWords = "WyJkaWNrIiwiZnVjayIsInNoaXQiLCJhc3MiLCJiaXRjaCIsImN1bnQiLCJkYW1uIiwicGlzcyIsImNvY2siLCJwdXNzeSIsImNyaW5nZSIsInNleCIsImtpbGwiLCJpZGlvdCJd";
const blockedWords = JSON.parse(atob(encodedBlockedWords)).map((word: string) => word.toLowerCase());

const enhanceWordsForAdvancedMode = (words: string[], mode: GeneratorMode): string[] => {
  if (mode !== "advanced") return words;
  const symbols = ["!", "@", "#", "$", "%", "&", "*", "?", "=", "~"];
  return words.map((word) => {
    let enhancedWord = word;
    if (Math.random() < 0.7) {
      const position = Math.floor(Math.random() * enhancedWord.length);
      const number = Math.floor(Math.random() * 10);
      enhancedWord = enhancedWord.slice(0, position) + number + enhancedWord.slice(position);
    }
    if (Math.random() < 0.5) {
      const position = Math.floor(Math.random() * enhancedWord.length);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      enhancedWord = enhancedWord.slice(0, position) + symbol + enhancedWord.slice(position);
    }
    return enhancedWord;
  });
};

const capitalizeFirstLetter = (words: string[]): string[] => {
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
};

const fetchRandomWords = async (wordCount: number): Promise<string[]> => {
  try {
    const response = await fetch(`/api/words?count=${wordCount}&blockedWords=${encodedBlockedWords}`);
    const data = await response.json();
    
    let words = data.words;
    if (!words || words.length === 0) {
      words = Array(wordCount).fill(0).map((_, i) => `word${i+1}`);
    }
    
    return words;
  } catch (err) {
    console.error("Error in fetching random words:", err);
    // Use fallback even if everything fails
    return Array(wordCount).fill(0).map((_, i) => `word${i+1}`);
  }
};

export { enhanceWordsForAdvancedMode, capitalizeFirstLetter, fetchRandomWords, encodedBlockedWords }; 