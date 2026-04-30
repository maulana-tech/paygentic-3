"use client";

import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="focus-ring field-shell flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-text-main hover:bg-white/40 dark:hover:bg-slate-800/40"
      >
        <span
          className={selectedOption ? "text-text-main" : "text-text-secondary"}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="glass-panel-strong absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-[1.25rem] py-2 shadow-xl outline-none">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-text-secondary">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-700/50 ${
                  value === option.value
                    ? "bg-brand/10 font-medium text-brand dark:text-brand-hover"
                    : "text-text-main"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
