'use client';
import { SortOption } from '@/lib/product/filter/buildClause';
import React, { useState, useRef, useEffect } from 'react';

export interface SortOptionObject {
  value: SortOption;
  label: string;
}

interface SortDropdownProps {
  options: SortOptionObject[];
  selectedOption: string;
  onChange: (value: SortOption) => void;
}

export default function SortDropdown({
  options,
  selectedOption,
  onChange,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (value: SortOption) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="
        relative inline-block
        text-center md:text-left
        w-full md:w-auto
      "
    >
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="
          flex justify-center md:justify-start items-center
          w-full md:w-auto
          border border-gray-400 bg-white text-black text-sm
          rounded px-3 py-1
          hover:cursor-pointer
        "
      >
        <span className="mr-1">⇅</span>
        <span>Sort</span>
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-48
            bg-white border border-gray-200
            rounded shadow-lg z-50
          "
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              className="
                flex items-center px-3 py-2
                hover:bg-gray-100 cursor-pointer
              "
              onClick={() => handleOptionClick(opt.value)}
            >
              <input
                type="checkbox"
                className="mr-2"
                readOnly
                checked={opt.value === selectedOption}
              />
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
