import React from "react";
import { GeneratorMode, SeparatorOption, SymbolOption } from "../types/generator";
import Slider from "./UI/Slider";
import SingleSelectButtonGroup from "./UI/SingleSelectButtonGroup";
import MultiSelectButtonGroup from "./UI/MultiSelectButtonGroup";

interface PassphraseSettingsProps {
  mode: GeneratorMode;
  setMode: (mode: GeneratorMode) => void;
  wordCount: number;
  setWordCount: (count: number) => void;
  separator: SeparatorOption;
  setSeparator: (separator: SeparatorOption) => void;
  selectedSymbols: SymbolOption[];
  setSelectedSymbols: (symbols: SymbolOption[]) => void;
  capitalize: boolean;
  setCapitalize: (capitalize: boolean) => void;
}

const PassphraseSettings: React.FC<PassphraseSettingsProps> = ({
  mode,
  setMode,
  wordCount,
  setWordCount,
  separator,
  setSeparator,
  selectedSymbols,
  setSelectedSymbols,
  capitalize,
  setCapitalize
}) => {
  const separatorOptions: SeparatorOption[] = ["-", "_", ".", "+"];
  const symbolOptions: SymbolOption[] = ["#", "*", "!", "%"];

  return (
    <>
      <div className="mb-6">
        <SingleSelectButtonGroup
          options={["basic", "advanced"] as const}
          selected={mode}
          onChange={setMode}
          size="medium"
        />
        <p className="text-sm text-[var(--color-text-muted)] text-center">
          {mode === "basic"
            ? "Simple words separated by chosen separator"
            : "Enhanced security with numbers and symbols inside words"}
        </p>
      </div>

      <Slider
        min={4}
        max={16}
        value={wordCount}
        onChange={setWordCount}
        label="Number of Words"
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-base text-[var(--color-text-primary)] text-center">Separator</h3>
          <SingleSelectButtonGroup
            options={separatorOptions}
            selected={separator}
            onChange={setSeparator}
            size="small"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-base text-[var(--color-text-primary)] text-center">Symbols</h3>
          <MultiSelectButtonGroup
            options={symbolOptions}
            selected={selectedSymbols}
            onChange={setSelectedSymbols}
            size="small"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-base text-[var(--color-text-primary)] text-center">Format</h3>
          <div className="flex justify-center">
            <button
              onClick={() => setCapitalize(!capitalize)}
              className={`px-4 py-1 rounded-lg transition-colors text-sm ${
                capitalize
                  ? "bg-[var(--color-primary)] text-[var(--selected-text-color)]"
                  : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Capitalize
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PassphraseSettings; 