import React from "react";
import { GeneratorType, GeneratorMode } from "../types/generator";

interface SecurityInfoProps {
  generatorType: GeneratorType;
  mode: GeneratorMode;
}

const SecurityInfo: React.FC<SecurityInfoProps> = ({ generatorType, mode }) => {
  return (
    <div className="mt-8 bg-[var(--color-background)] p-4 rounded-lg border border-[var(--box-border-color)]">
      <h2 className="text-lg font-semibold mb-2 text-[var(--color-primary-text)]">Security Information</h2>
      <div className="text-xs text-[var(--color-text-dim)] space-y-1">
        <p>• All processing happens in your browser</p>
        <p>• For maximum security, consider adding your own modifications</p>
        {generatorType === "passphrase" && mode === "advanced" && (
          <p>• Passphrase includes numbers and symbols</p>
        )}
      </div>
    </div>
  );
};

export default SecurityInfo; 