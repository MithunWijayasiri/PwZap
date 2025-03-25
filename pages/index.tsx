import { useState, useEffect, useRef } from "react";
import { FiCopy, FiRefreshCw } from "react-icons/fi";
import Head from "next/head";
import { EXTERNAL_LINKS } from "../config/links";

// Types
import { GeneratorMode, GeneratorType, SeparatorOption, SymbolOption } from "../types/generator";

// Components
import SingleSelectButtonGroup from "../components/UI/SingleSelectButtonGroup";
import PassphraseDisplay from "../components/PassphraseDisplay";
import PasswordSettings from "../components/PasswordSettings";
import PassphraseSettings from "../components/PassphraseSettings";
import SecurityInfo from "../components/SecurityInfo";
import Footer from "../components/Footer";

// Utils
import { copyToClipboard } from "../utils/clipboard";
import { setupColorSchemeDetection } from "../utils/colorScheme";

// Generator functions
import { generateRandomPassword } from "../components/generator/PasswordGenerator";
import { 
  fetchRandomWords, 
  enhanceWordsForAdvancedMode, 
  capitalizeFirstLetter 
} from "../components/generator/PassphraseGenerator";

// Main Component
export default function PasswordGenerator() {
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
  
  // Add ref at the component level
  const initialRenderSettings = useRef(true);

  const generatePassword = () => {
    const password = generateRandomPassword(passwordLength, mode);
    setPassphrase(password);
  };

  const generatePassphrase = async () => {
    setLoading(true);
    setError(null);
    try {
      const words = await fetchRandomWords(wordCount);
      
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
      setError("Failed to generate passphrase. Using fallback.");
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

  const handleCopyToClipboard = () => {
    if (!passphrase) return;
    
    copyToClipboard(passphrase).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 800);
      } else {
        setError("Failed to copy to clipboard");
      }
    });
  };

  // Update settings when generator type changes, but don't trigger generation
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

  // This effect handles all generation based on state changes
  useEffect(() => {
    // Skip the initial render - the dedicated first-render effect will handle it
    if (initialRenderSettings.current) {
      initialRenderSettings.current = false;
      return;
    }
    
    // Use a short delay to ensure all state changes are applied first
    // This prevents double API calls when switching between generator types
    const timer = setTimeout(() => {
      handleGenerate();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [mode, wordCount, separator, capitalize, passwordLength, selectedSymbols, generatorType]);

  // Detect and apply color scheme
  useEffect(() => {
    const cleanup = setupColorSchemeDetection();
    return cleanup;
  }, []);

  // Run once on initial render to generate the first password/passphrase
  useEffect(() => {
    handleGenerate();
    // Empty dependency array means this runs once on mount
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col items-center justify-center p-4">
      <Head>
        <title>PwZap</title>
        <meta name="description" content="Secure passwords, made simple." />
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
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

        {generatorType === "password" ? (
          <PasswordSettings
            mode={mode}
            setMode={setMode}
            passwordLength={passwordLength}
            setPasswordLength={setPasswordLength}
          />
        ) : (
          <PassphraseSettings
            mode={mode}
            setMode={setMode}
            wordCount={wordCount}
            setWordCount={setWordCount}
            separator={separator}
            setSeparator={setSeparator}
            selectedSymbols={selectedSymbols}
            setSelectedSymbols={setSelectedSymbols}
            capitalize={capitalize}
            setCapitalize={setCapitalize}
          />
        )}

        <PassphraseDisplay
          value={passphrase}
          loading={loading}
          error={error}
          onCopy={handleCopyToClipboard}
          onRefresh={handleGenerate}
          copied={copied}
        />

        <SecurityInfo generatorType={generatorType} mode={mode} />
      </div>

      <Footer />
    </div>
  );
}