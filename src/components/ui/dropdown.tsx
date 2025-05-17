'use client';
import React from 'react';

interface DropdownSelectorProps {
  label: string; // Label shown as the first option (e.g., "Category")
  value: string; // Currently selected value
  onChange: (value: string) => void; // Callback when user selects a new value
  options: string[]; // List of dropdown options
  disabled?: boolean;
  multiple?: boolean;
}

/**
 * A generic dropdown selector component with a placeholder-like label
 * and simple Tailwind styling to mimic the screenshot’s style.
 */
export default function DropdownSelector({
  label,
  value,
  onChange,
  options,
  disabled = false,
  multiple = false,
}: DropdownSelectorProps) {
  return (
    <div className="inline-block">
      <select
        multiple={multiple}
        className="
          border border-gray-400 text-black bg-white 
          rounded px-3 py-1 text-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500
          hover:cursor-pointer
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
