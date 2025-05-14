"use client";

import { FieldError, UseFormRegister } from "react-hook-form";
import { ReactNode } from "react";

type InputFieldProps = {
  label: string;
  name: string;
  defaultValue?: any;
  register: UseFormRegister<any>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  textarea?: boolean; // Added textarea prop
  rows?: number; 
  className?: string;
  children?: ReactNode;
};

const InputField = ({
  label,
  name,
  defaultValue,
  register,
  error,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  hidden = false,
  textarea = false, // Default to false
  rows = 4,
  className = "",
  children,
}: InputFieldProps) => {
  if (hidden) {
    return (
      <input
        type="hidden"
        id={name}
        defaultValue={defaultValue || ""}
        {...register(name)}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {textarea ? (
        <textarea
          id={name}
          rows={rows}
          defaultValue={defaultValue || ""}
          placeholder={placeholder}
          disabled={disabled}
          className={`p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaSky ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 text-gray-500" : ""}`}
          {...register(name)}
        ></textarea>
      ) : (
        <input
          type={type}
          id={name}
          defaultValue={defaultValue || ""}
          placeholder={placeholder}
          disabled={disabled}
          className={`p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaSky ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 text-gray-500" : ""}`}
          {...register(name)}
        />
      )}
      
      {children}
      
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
};

export default InputField;
