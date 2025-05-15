"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { FieldError, UseFormRegister, UseFormSetValue } from "react-hook-form";

type SwitchFieldProps = {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  defaultChecked?: boolean;
  setValue: UseFormSetValue<any>;
  error?: FieldError;
  disabled?: boolean;
};

const SwitchField = ({
  label,
  name,
  register,
  defaultChecked = false,
  setValue,
  error,
  disabled = false,
}: SwitchFieldProps) => {
  const [checked, setChecked] = useState(defaultChecked);

  // Register the field with react-hook-form but handle the onChange ourselves
  const { ref } = register(name);

  // Handle the toggle state change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setChecked(newValue);
    setValue(name, newValue);
  };

  // Initialize the value when component mounts
  useEffect(() => {
    setValue(name, defaultChecked);
  }, [setValue, name, defaultChecked]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label 
          htmlFor={name} 
          className="text-sm text-gray-600 font-medium mb-1 cursor-pointer"
        >
          {label}
        </label>
        
        <div className="relative inline-block w-12 align-middle select-none">
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={checked}
            onChange={handleChange}
            ref={ref}
            disabled={disabled}
            className="sr-only"
          />
          <div 
            className={`block h-6 rounded-full transition-colors duration-200 ease-in-out ${
              checked ? 'bg-blue-400' : 'bg-gray-300'
            } ${disabled ? 'opacity-50' : ''}`}
          ></div>
          <div 
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
              checked ? 'transform translate-x-6' : ''
            }`}
          ></div>
        </div>
      </div>
      
      {error && (
        <span className="text-xs text-red-500 mt-1">{error.message}</span>
      )}
    </div>
  );
};

export default SwitchField;
