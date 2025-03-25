import React from "react";
import { SymbolOption, GeneratorMode } from "../../types/generator";

const generateRandomPassword = (length: number, mode: GeneratorMode): string => {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  const symbolOptions: SymbolOption[] = ["#", "*", "!", "%"];

  if (mode === "advanced") {
    let symbolCount = 2;
    if (length > 12 && length <= 20) symbolCount = 3;
    else if (length > 20 && length <= 28) symbolCount = 4;
    else if (length > 28) symbolCount = 5;

    let passwordWithoutSymbols = "";
    for (let i = 0; i < length - symbolCount; i++) {
      passwordWithoutSymbols += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    let symbolsToAdd = "";
    for (let i = 0; i < symbolCount; i++) {
      const symbol = symbolOptions[Math.floor(Math.random() * symbolOptions.length)];
      symbolsToAdd += symbol;
    }

    password = passwordWithoutSymbols + symbolsToAdd;
    password = password.split("").sort(() => Math.random() - 0.5).join("");
  } else {
    for (let i = 0; i < length; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }
  return password;
};

export { generateRandomPassword }; 