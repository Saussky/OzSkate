'use client';
import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  RefObject,
} from 'react';
import ChevronDown from './icons/chevronDown';

export interface MultiSelectDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  label: string;
  disabled?: boolean;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options]); // <= runs only when dropdown toggles or the source list changes

  const optionRefs = useRef<RefObject<HTMLLabelElement>[]>([]);
  if (optionRefs.current.length !== displayOptions.length) {
    optionRefs.current = displayOptions.map(
      (_, i) => optionRefs.current[i] || React.createRef<HTMLLabelElement>()
    );
  }

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

  const lastKeyRef = useRef<string>('');
  const lastMatchIndexRef = useRef<number>(-1);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : '';
    if (!/^[a-z0-9]$/.test(key)) return;

    e.preventDefault();

    const len = displayOptions.length;
    const start =
      key === lastKeyRef.current ? lastMatchIndexRef.current + 1 : 0;

    for (let i = 0; i < len; i++) {
      const idx = (start + i) % len;
      const opt = displayOptions[idx];
      if (value.includes(opt)) continue; // ← skip selected
      if (opt.toLowerCase().startsWith(key)) {
        optionRefs.current[idx].current?.scrollIntoView({ block: 'nearest' });
        lastKeyRef.current = key;
        lastMatchIndexRef.current = idx;
        return;
      }
    }

    for (let i = 0; i < len; i++) {
      const idx = (start + i) % len;
      const opt = displayOptions[idx];
      if (opt.toLowerCase().startsWith(key)) {
        optionRefs.current[idx].current?.scrollIntoView({ block: 'nearest' });
        lastKeyRef.current = key;
        lastMatchIndexRef.current = idx;
        return;
      }
    }
  };

  const toggleOption = (opt: string) =>
    value.includes(opt)
      ? onChange(value.filter((v) => v !== opt))
      : onChange([...value, opt]);

  const displayText =
    value.length === 0
      ? label
      : value.length === 1
      ? value[0]
      : `${value.length} ${label} selected`;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative inline-block w-full md:w-auto outline-none"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="
          w-full flex items-center justify-between
          border border-gray-400 bg-white px-3 py-1 text-sm text-black
          rounded focus:outline-none focus:ring-1 focus:ring-blue-500
          hover:cursor-pointer
        "
      >
        <span>{displayText}</span>
        <ChevronDown className="w-3 h-3 ml-4" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-64 max-h-60 overflow-auto rounded border border-gray-400 bg-white shadow-lg z-10">
          {displayOptions.map((opt, idx) => (
            <label
              key={opt}
              ref={optionRefs.current[idx]}
              className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer select-none"
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
