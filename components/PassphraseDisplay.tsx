import React from "react";
import { FiCopy, FiRefreshCw } from "react-icons/fi";

interface PassphraseDisplayProps {
  value: string;
  loading: boolean;
  error: string | null;
  onCopy: () => void;
  onRefresh: () => void;
  copied: boolean;
}

const PassphraseDisplay: React.FC<PassphraseDisplayProps> = ({
  value,
  loading,
  error,
  onCopy,
  onRefresh,
  copied
}) => {
  return (
    <div className="relative mb-6">
      <div className="bg-[var(--color-background)] p-4 rounded-lg border border-[var(--box-border-color)] min-h-24 flex items-center justify-center overflow-hidden">
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
            {value}
          </p>
        )}
      </div>
      <div className="absolute right-2 top-2 flex space-x-2">
        <button
          onClick={onCopy}
          disabled={!value || loading}
          className="p-2 rounded-lg bg-[var(--color-surface-light)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Copy to clipboard"
        >
          <FiCopy className={`${copied ? "text-[var(--color-success)]" : "text-[var(--color-primary-light)]"} transition-colors`} />
        </button>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-[var(--color-surface-light)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate new passphrase"
        >
          <FiRefreshCw className={`text-[var(--color-primary-light)] ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
};

export default PassphraseDisplay; 