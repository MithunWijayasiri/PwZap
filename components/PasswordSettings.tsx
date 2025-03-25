import React from "react";
import { GeneratorMode } from "../types/generator";
import Slider from "./UI/Slider";
import SingleSelectButtonGroup from "./UI/SingleSelectButtonGroup";

interface PasswordSettingsProps {
  mode: GeneratorMode;
  setMode: (mode: GeneratorMode) => void;
  passwordLength: number;
  setPasswordLength: (length: number) => void;
}

const PasswordSettings: React.FC<PasswordSettingsProps> = ({
  mode,
  setMode,
  passwordLength,
  setPasswordLength
}) => {
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
            ? "Simple capital letters and numbers"
            : "Includes symbols"}
        </p>
      </div>

      <Slider
        min={8}
        max={32}
        value={passwordLength}
        onChange={setPasswordLength}
        label="Password Length"
      />
    </>
  );
};

export default PasswordSettings; 