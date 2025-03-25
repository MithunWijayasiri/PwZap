import React from "react";

type ButtonSize = "small" | "medium";

interface MultiSelectButtonGroupProps<T extends string> {
  options: T[];
  selected: T[];
  onChange: (values: T[]) => void;
  size?: ButtonSize;
}

function MultiSelectButtonGroup<T extends string>({
  options,
  selected,
  onChange,
  size = "small",
}: MultiSelectButtonGroupProps<T>) {
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
              ? "bg-[var(--color-primary)] text-[var(--selected-text-color)]"
              : "bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default MultiSelectButtonGroup; 