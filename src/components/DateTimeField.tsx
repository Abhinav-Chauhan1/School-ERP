"use client";

import { ChangeEvent, useEffect } from "react";
import { FieldError, UseFormRegister, UseFormSetValue } from "react-hook-form";

type DateTimeFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | Date;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
};

const DateTimeField = ({
  label,
  name,
  defaultValue,
  register,
  setValue,
  error,
  required = false,
  disabled = false,
}: DateTimeFieldProps) => {
  // Format the date and time for the input
  const formatDateTimeForInput = (date: Date | string | undefined): string => {
    if (!date) return "";
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) return "";
    
    // Format as YYYY-MM-DDThh:mm (format required by datetime-local input)
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle date changes
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setValue(name, new Date(value));
    } else {
      setValue(name, null);
    }
  };

  // Register the input with React Hook Form
  const { ref } = register(name);

  // Initialize the field with the default value on component mount
  useEffect(() => {
    if (defaultValue) {
      setValue(name, new Date(defaultValue));
    }
  }, [defaultValue, name, setValue]);

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm text-gray-600 font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <input
        id={name}
        type="datetime-local"
        className={`border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
        onChange={handleDateChange}
        defaultValue={formatDateTimeForInput(defaultValue)}
        ref={ref}
        disabled={disabled}
      />
      
      {error && (
        <span className="text-xs text-red-500 mt-1">{error.message}</span>
      )}
    </div>
  );
};

export default DateTimeField;
