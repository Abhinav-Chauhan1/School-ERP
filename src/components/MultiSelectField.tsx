"use client";

import { FieldError } from "react-hook-form";
import { useState, useEffect } from "react";

type Option = {
  value: string;
  label: string;
};

type MultiSelectFieldProps = {
  label: string;
  options: Option[];
  defaultValues?: string[];
  onChange: (selectedValues: string[]) => void;
  error?: any; // Use a more flexible error type
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const MultiSelectField = ({
  label,
  options,
  defaultValues = [],
  onChange,
  error,
  placeholder = "Select options",
  required = false,
  disabled = false,
  className = "",
}: MultiSelectFieldProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Update parent form when selections change
    onChange(selectedOptions);
  }, [selectedOptions, onChange]);

  const toggleOption = (value: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const getSelectedLabels = () => {
    if (selectedOptions.length === 0) return placeholder;
    
    return selectedOptions
      .map((value) => options.find((option) => option.value === value)?.label)
      .join(", ");
  };

  return (
    <div className={`flex flex-col gap-2 w-full relative ${className}`}>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        className={`p-3 border rounded-md cursor-pointer relative min-h-[42px] ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 text-gray-500" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedOptions.length > 0 ? (
            <div className="text-sm truncate">{getSelectedLabels()}</div>
          ) : (
            <div className="text-gray-400">{placeholder}</div>
          )}
        </div>
        <div className="absolute right-2 top-3">
          <svg
            className={`h-4 w-4 transform ${isOpen ? 'rotate-180' : ''}`}
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
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto top-[72px] border border-gray-300">
          <div className="py-1">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => !disabled && toggleOption(option.value)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedOptions.includes(option.value) ? 'bg-lamaSkyLight' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.value)}
                    readOnly
                    className="h-4 w-4 accent-lamaSky rounded"
                  />
                  <span>{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
};

export default MultiSelectField;
