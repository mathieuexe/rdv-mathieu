"use client";

import React, { forwardRef, useState } from "react";
import PhoneInputLib from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./phone-input.css"; // We'll add some custom styles to match the design

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value: controlledValue, onChange: controlledOnChange, defaultValue, className, name, required, disabled }, ref) => {
    // If it's used in an uncontrolled form (like our server actions), we need to manage state locally
    const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
    
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const onChange = (val?: string) => {
      setInternalValue(val);
      if (controlledOnChange) {
        controlledOnChange(val);
      }
    };

    return (
      <div className="relative">
        <PhoneInputLib
          ref={ref as any}
          international
          defaultCountry="FR"
          countries={["FR", "CA", "BE", "CH"]}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={className}
          numberInputProps={{
            required,
            className: "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          }}
        />
        {/* Hidden input to ensure the value is submitted in native forms */}
        {name && <input type="hidden" name={name} value={value || ""} />}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
