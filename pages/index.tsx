import { useState, useEffect } from "react";
import { FiCopy, FiRefreshCw } from "react-icons/fi";
import Head from "next/head";
import { fetchRandomWords } from "../services/wordService";
import { 
  getWordnikRandomWordUrl, 
  getWordnikRandomWordsUrl, 
  getRandomWordApiUrl,
  WordnikWord,
  RandomWordApiResponse
} from "../config/api";

type GeneratorMode = "basic" | "advanced";
type SeparatorOption = "-" | "_" | "." | "+";
type GeneratorType = "password" | "passphrase";
type SymbolOption = "#" | "*" | "!" | "%";
type ButtonSize = "small" | "medium";

// Helper Components
function SingleSelectButtonGroup<T extends string>({
  options,
  selected,
  onChange,
  size = "small",
}: {
  options: T[];
  selected: T;
  onChange: (value: T) => void;
  size?: ButtonSize;
}) {
  const paddingClass = size === "medium" ? "px-4 py-2" : "px-2 py-1";
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`${paddingClass} rounded-lg transition-colors text-sm ${
            selected === option
              ? "bg-[var(--color-primary)] text-black"
              : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}

function MultiSelectButtonGroup<T extends string>({
  options,
  selected,
  onChange,
  size = "small",
}: {
  options: T[];
  selected: T[];
  onChange: (values: T[]) => void;
  size?: ButtonSize;
}) {
  const paddingClass = size === "medium" ? "px-4 py-2" : "px-2 py-1";
  const toggleOption = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => toggleOption(option)}
          className={`${paddingClass} rounded-lg transition-colors text-sm ${
            selected.includes(option)
              ? "bg-[var(--color-primary)] text-black"
              : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Slider({
  min,
  max,
  value,
  onChange,
  label,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="mb-6">
      <label className="block text-[var(--color-text-secondary)] mb-2">
        {label}: <span className="font-bold text-[var(--color-primary)]">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-[var(--color-surface-light)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary-border)]"
      />
      <div className="flex justify-between text-xs text-[var(--color-text-dim)] mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// Base64-encoded blocked words (refined list)
const encodedBlockedWords = "WyJkaWNrIiwiZnVjayIsInNoaXQiLCJhc3MiLCJiaXRjaCIsImN1bnQiLCJkYW1uIiwicGlzcyIsImNvY2siLCJwdXNzeSIsImNyaW5nZSIsInNleCIsImtpbGwiLCJpZGlvdCJd";
const blockedWords = JSON.parse(atob(encodedBlockedWords)).map((word: string) => word.toLowerCase());

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

// Main Component
export default function PassphraseGenerator() {
  const [mode, setMode] = useState<GeneratorMode>("advanced");
  const [generatorType, setGeneratorType] = useState<GeneratorType>("password");
  const [wordCount, setWordCount] = useState<number>(4);
  const [passwordLength, setPasswordLength] = useState<number>(12);
  const [separator, setSeparator] = useState<SeparatorOption>("-");
  const [passphrase, setPassphrase] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [capitalize, setCapitalize] = useState<boolean>(false);
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolOption[]>([]);

  const separatorOptions: SeparatorOption[] = ["-", "_", ".", "+"];
  const symbolOptions: SymbolOption[] = ["#", "*", "!", "%"];

  const generatePassword = () => {
    const password = generateRandomPassword(passwordLength, mode);
    setPassphrase(password);
  };

  const generatePassphrase = async () => {
    setLoading(true);
    setError(null);
    try {
      let words = await fetchRandomWords(wordCount, blockedWords).catch(async (error) => {
        console.error("Failed to fetch words, using fallback:", error);
        return Array(wordCount).fill(0).map((_, i) => `word${i+1}`);
      });
      
      if (!words || words.length === 0) {
        words = Array(wordCount).fill(0).map((_, i) => `word${i+1}`);
      }
      
      let processedWords = enhanceWordsForAdvancedMode(words, mode);
      if (capitalize) processedWords = capitalizeFirstLetter(processedWords);
      let passphrase = processedWords.join(separator);
      if (selectedSymbols.length > 0) {
        for (const symbol of selectedSymbols) {
          let count = 0;
          while (count < 2) {
            const position = Math.floor(Math.random() * passphrase.length);
            passphrase = passphrase.slice(0, position) + symbol + passphrase.slice(position);
            count++;
          }
        }
      }
      setPassphrase(passphrase);
    } catch (err) {
      console.error("Error in passphrase generation:", err);
      // Use fallback even if everything fails
      const fallbackWords = Array(wordCount).fill(0).map((_, i) => `word${i+1}`);
      const processedWords = enhanceWordsForAdvancedMode(fallbackWords, mode);
      setPassphrase(processedWords.join(separator));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      if (generatorType === "password") {
        generatePassword();
      } else {
        await generatePassphrase();
      }
    } catch (err) {
      setError("An error occurred while generating.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!passphrase) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(passphrase).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 800);
      }).catch(() => {
        fallbackCopyTextToClipboard(passphrase);
      });
    } else {
      fallbackCopyTextToClipboard(passphrase);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 800);
      } else {
        setError("Failed to copy to clipboard");
      }
    } catch (err) {
      setError("Failed to copy to clipboard");
    } finally {
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [mode, wordCount, separator, capitalize, generatorType, passwordLength, selectedSymbols]);

  useEffect(() => {
    if (generatorType === "password") {
      setMode("advanced");
    } else {
      setMode("basic");
      setCapitalize(false);
      setSeparator("-");
      setWordCount(4);
      setPasswordLength(12);
      setSelectedSymbols([]);
    }
  }, [generatorType]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col items-center justify-center p-4">
      <Head>
        <title>PwZap</title>
        <meta name="description" content="Secure passwords, made simple." />
      </Head>

      <div className="w-full max-w-2xl bg-[var(--color-surface)] rounded-xl shadow-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-[var(--color-primary-text)]">
          Secure Password Generator
        </h1>

        <div className="mb-6">
          <SingleSelectButtonGroup
            options={["password", "passphrase"] as const}
            selected={generatorType}
            onChange={setGeneratorType}
            size="medium"
          />
          <p className="text-sm text-[var(--color-text-muted)] text-center">
            {generatorType === "password" ? "Generate a random password" : "Generate a secure passphrase"}
          </p>
        </div>

        <div className="mb-6">
          <SingleSelectButtonGroup
            options={["basic", "advanced"] as const}
            selected={mode}
            onChange={setMode}
            size="medium"
          />
          <p className="text-sm text-[var(--color-text-muted)] text-center">
            {mode === "basic"
              ? generatorType === "password"
                ? "Simple capital letters and numbers"
                : "Simple words separated by chosen separator"
              : generatorType === "password"
              ? "Includes symbols"
              : "Enhanced security with numbers and symbols inside words"}
          </p>
        </div>

        {generatorType === "password" ? (
          <Slider
            min={8}
            max={32}
            value={passwordLength}
            onChange={setPasswordLength}
            label="Password Length"
          />
        ) : (
          <Slider
            min={4}
            max={16}
            value={wordCount}
            onChange={setWordCount}
            label="Number of Words"
          />
        )}

        {generatorType === "passphrase" && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-base text-black text-center">Separator</h3>
              <SingleSelectButtonGroup
                options={separatorOptions}
                selected={separator}
                onChange={setSeparator}
                size="small"
              />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base text-black text-center">Symbols</h3>
              <MultiSelectButtonGroup
                options={symbolOptions}
                selected={selectedSymbols}
                onChange={setSelectedSymbols}
                size="small"
              />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base text-black text-center">Format</h3>
              <div className="flex justify-center">
                <button
                  onClick={() => setCapitalize(!capitalize)}
                  className={`px-4 py-1 rounded-lg transition-colors text-sm ${
                    capitalize
                      ? "bg-[var(--color-primary)] text-black"
                      : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  Capitalize
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative mb-6">
          <div className="bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-surface-light)] min-h-24 flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[var(--color-primary-border)]"></div>
              </div>
            ) : error ? (
              <p className="text-[var(--color-error)] text-center">{error}</p>
            ) : (
              <p
                className="text-lg md:text-xl text-center break-all font-mono whitespace-nowrap"
                style={{
                  width: "100%",
                  overflow: "hidden",
                  textOverflow: "clip",
                  textAlign: "center",
                }}
              >
                {passphrase}
              </p>
            )}
          </div>
          <div className="absolute right-2 top-2 flex space-x-2">
            <button
              onClick={copyToClipboard}
              disabled={!passphrase || loading}
              className="p-2 rounded-lg bg-[var(--color-surface-light)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy to clipboard"
            >
              <FiCopy className={`${copied ? "text-[var(--color-success)]" : "text-[var(--color-primary-light)]"} transition-colors`} />
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="p-2 rounded-lg bg-[var(--color-surface-light)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate new passphrase"
            >
              <FiRefreshCw className={`text-[var(--color-primary-light)] ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mt-8 bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-surface-light)]">
          <h2 className="text-lg font-semibold mb-2 text-[var(--color-primary-text)]">Security Information</h2>
          <div className="text-xs text-[var(--color-text-dim)] space-y-1">
            <p>• All processing happens in your browser</p>
            <p>• For maximum security, consider adding your own modifications</p>
            {generatorType === "passphrase" && mode === "advanced" && (
              <p>• Passphrase includes numbers and symbols</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}