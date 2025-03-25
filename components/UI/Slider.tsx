import React, { useState, useEffect } from "react";

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
}

function Slider({ min, max, value, onChange, label }: SliderProps) {
  const [localValue, setLocalValue] = useState(value);
  
  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(parseInt(e.target.value));
  };

  const handleFinalChange = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-[var(--color-text-secondary)] mb-2">
        {label}: <span className="font-bold text-[var(--color-primary)]">{localValue}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={localValue}
        onChange={handleChange}
        onMouseUp={handleFinalChange}
        onTouchEnd={handleFinalChange}
        onKeyUp={handleFinalChange}
        className="w-full h-2 bg-[var(--color-surface-light)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary-border)]"
      />
      <div className="flex justify-between text-xs text-[var(--color-text-dim)] mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default Slider; 