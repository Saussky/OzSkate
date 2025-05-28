'use client';
import React from 'react';

interface DropdownSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  multiple?: boolean;
}

export default function DropdownSelector({
  label,
  value,
  onChange,
  options,
  disabled = false,
  multiple = false,
}: DropdownSelectorProps) {
  return (
    <div className="inline-block w-full md:w-auto">
      <select
        multiple={multiple}
        className="
          border border-gray-400 text-black bg-white 
          rounded px-3 py-1 text-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500
          hover:cursor-pointer w-full md:w-auto
          disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
        "
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {/* First option acts like a placeholder label */}
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
