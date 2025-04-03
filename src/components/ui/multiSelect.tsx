// src/shared/ui/multiSelectDropdown.tsx
import React, { useState, useRef, useEffect } from "react";

export interface MultiSelectDropdownOption {
  value: string;
  label: string;
}

export interface MultiSelectDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectDropdownOption[];
  disabled?: boolean;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "Set Shops",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((val) => val !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // When nothing is selected, show the placeholder
  const displayText =
    value.length > 0
      ? options
          .filter((opt) => value.includes(opt.value))
          .map((opt) => opt.label)
          .join(", ")
      : placeholder;

  return (
    <div ref={containerRef} className="relative inline-block w-full md:w-auto">
      <button
        type="button"
        className="border border-gray-400 text-black bg-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 hover:cursor-pointer w-full text-left"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        {displayText}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 left-0 w-64 bg-white border border-gray-400 rounded shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={value.includes(option.value)}
                onChange={() => toggleOption(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
