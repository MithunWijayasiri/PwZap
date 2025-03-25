import React from "react";

type ButtonSize = "small" | "medium";

interface SingleSelectButtonGroupProps<T extends string> {
  options: T[];
  selected: T;
  onChange: (value: T) => void;
  size?: ButtonSize;
}

function SingleSelectButtonGroup<T extends string>({
  options,
  selected,
  onChange,
  size = "small",
}: SingleSelectButtonGroupProps<T>) {
  const paddingClass = size === "medium" ? "px-4 py-2" : "px-2 py-1";
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`${paddingClass} rounded-lg transition-colors text-sm ${
            selected === option
              ? "bg-[var(--color-primary)] text-[var(--selected-text-color)]"
              : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default SingleSelectButtonGroup; 