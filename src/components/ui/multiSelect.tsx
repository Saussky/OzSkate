'use client';
import React, { useState, useRef, useEffect } from 'react';
import ChevronDown from './icons/chevronDown';

export interface MultiSelectDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
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
  const [displayOptions, setDisplayOptions] = useState<string[]>(options);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update option order only when dropdown opens
  useEffect(() => {
    if (open) {
      const sorted = [...options].sort((a, b) => {
        const aSel = value.includes(a) ? 0 : 1;
        const bSel = value.includes(b) ? 0 : 1;
        if (aSel !== bSel) return aSel - bSel;
        return a.localeCompare(b);
      });
      setDisplayOptions(sorted);
    }
  }, [open]);

  const toggleOption = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  let displayText = label;
  if (value.length === 1) displayText = value[0];
  else if (value.length > 1) displayText = `${value.length} ${label} selected`;

  return (
    <div ref={containerRef} className="relative inline-block w-full md:w-auto">
      <button
        type="button"
        disabled={disabled}
        className="w-full flex items-center justify-between border border-gray-400 bg-white px-3 py-1 text-sm text-black rounded focus:outline-none focus:ring-1 focus:ring-blue-500 hover:cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{displayText}</span>
        <ChevronDown className="w-3 h-3 ml-4" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-64 max-h-60 overflow-auto rounded border border-gray-400 bg-white shadow-lg z-10">
          {displayOptions.map((opt) => (
            <label
              key={opt}
              className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={value.includes(opt)}
                onChange={() => toggleOption(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
