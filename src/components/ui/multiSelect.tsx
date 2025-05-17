// src/shared/ui/multiSelectDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';

export interface MultiSelectDropdownOption {
  value: string;
  label: string;
}

export interface MultiSelectDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectDropdownOption[];
  disabled?: boolean;
  label: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  value,
  onChange,
  options,
  label,
  disabled = false,
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((val) => val !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  let displayText: string;
  if (value.length === 0) {
    displayText = label;
  } else if (value.length === 1) {
    const selectedOption = options.find((opt) => opt.value === value[0]);
    displayText = selectedOption ? selectedOption.label : label;
  } else {
    displayText = `${value.length} ${label} selected`;
  }

  return (
    <div ref={containerRef} className="relative inline-block w-full md:w-auto">
      <button
        type="button"
        className="border border-gray-400 text-black bg-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 hover:cursor-pointer w-full flex items-center justify-between"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        <span>{displayText}</span>
        <svg
          className="w-3 h-3 ml-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
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
