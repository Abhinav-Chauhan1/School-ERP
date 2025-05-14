"use client";

import { FieldError, UseFormRegister } from "react-hook-form";

type Option = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError | undefined; // Updated error type definition
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const SelectField = ({
  label,
  name,
  register,
  error,
  options,
  defaultValue,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = "",
}: SelectFieldProps) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        defaultValue={defaultValue || ""}
        className={`p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaSky ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 text-gray-500" : ""}`}
        disabled={disabled}
        {...register(name)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
};

export default SelectField;
