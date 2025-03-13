import { useState, useEffect } from "react";
import { FiCopy, FiRefreshCw } from "react-icons/fi";
import Head from "next/head";

type GeneratorMode = "basic" | "advanced";
type SeparatorOption = "-" | "_" | "." | "+";
type GeneratorType = "password" | "passphrase";
type SymbolOption = "#" | "*" | "!" | "%";
type ButtonSize = "small" | "medium";

// ### Helper Components

/** Single-Select Button Group */
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
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}

/** Multi-Select Button Group */
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
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/** Slider Component */
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
      <label className="block text-gray-300 mb-2">
        {label}: <span className="font-bold text-indigo-400">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ### Utility Functions

/** Fetch Random Words from API */
const fetchRandomWords = async (count: number): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=10000&minLength=3&maxLength=8&limit=${count}&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5`
    );
    if (!response.ok) throw new Error("Failed to fetch words");
    const data = await response.json();
    return data.map((wordObj: any) => wordObj.word.toLowerCase());
  } catch (error) {
    try {
      const response = await fetch(
        `https://random-word-api.herokuapp.com/word?number=${count}&length=5`
      );
      if (!response.ok) throw new Error("Failed to fetch words from backup API");
      return await response.json();
    } catch (secondError) {
      return [];
    }
  }
};

/** Generate Random Password */
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

/** Enhance Words for Advanced Mode */
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

/** Capitalize First Letter of Words */
const capitalizeFirstLetter = (words: string[]): string[] => {
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
};

// ### Main Component
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

  // ### Event Handlers

  const generatePassword = () => {
    const password = generateRandomPassword(passwordLength, mode);
    setPassphrase(password);
  };

  const generatePassphrase = async () => {
    setLoading(true);
    setError(null);
    try {
      let words = await fetchRandomWords(wordCount);
      if (words.length === 0) {
        setError("Failed to fetch words. Please try again.");
        return;
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
      setError("An error occurred while generating the passphrase.");
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

  // ### Effects

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

  // ### Render
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <Head>
        <title>PwZap</title>
        <meta name="description" content="Generate secure passphrases with customizable options" />
      </Head>

      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-400">
          Secure Password Generator
        </h1>

        {/* Type Selection */}
        <div className="mb-6">
          <SingleSelectButtonGroup
            options={["password", "passphrase"] as const}
            selected={generatorType}
            onChange={setGeneratorType}
            size="medium" // Larger buttons for password/passphrase
          />
          <p className="text-sm text-gray-400 text-center">
            {generatorType === "password" ? "Generate a random password" : "Generate a secure passphrase"}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <SingleSelectButtonGroup
            options={["basic", "advanced"] as const}
            selected={mode}
            onChange={setMode}
            size="medium" // Larger buttons for basic/advanced
          />
          <p className="text-sm text-gray-400 text-center">
            {mode === "basic"
              ? generatorType === "password"
                ? "Simple capital letters and numbers"
                : "Simple words separated by chosen separator"
              : generatorType === "password"
              ? "Includes symbols"
              : "Enhanced security with numbers and symbols inside words"}
          </p>
        </div>

        {/* Slider */}
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

        {/* Passphrase Controls */}
        {generatorType === "passphrase" && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-base text-gray-300 text-center">Separator</h3>
              <SingleSelectButtonGroup
                options={separatorOptions}
                selected={separator}
                onChange={setSeparator}
                size="small" // Smaller buttons for separators
              />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base text-gray-300 text-center">Symbols</h3>
              <MultiSelectButtonGroup
                options={symbolOptions}
                selected={selectedSymbols}
                onChange={setSelectedSymbols}
                size="small" // Smaller buttons for symbols
              />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base text-gray-300 text-center">Format</h3>
              <div className="flex justify-center">
                <button
                  onClick={() => setCapitalize(!capitalize)}
                  className={`px-4 py-1 rounded-lg transition-colors text-sm ${
                    capitalize
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Capitalize
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Passphrase */}
        <div className="relative mb-6">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-24 flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-400 text-center">{error}</p>
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
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy to clipboard"
            >
              <FiCopy className={`${copied ? "text-green-400" : "text-indigo-300"} transition-colors`} />
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate new passphrase"
            >
              <FiRefreshCw className={`text-indigo-300 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-gray-900 p-4 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-indigo-400">Security Information</h2>
          <div className="text-xs text-gray-500 space-y-1">
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