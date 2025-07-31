import React, { useState } from "react";
import { countries } from "../utils/countries";
import type { Country } from "../utils/countries";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error = false,
  helperText,
  className = "",
}) => {
  const [country, setCountry] = useState<Country>(countries[0]);
  const [phone, setPhone] = useState<string>("");

  // Split the value into country code and phone number
  React.useEffect(() => {
    if (value) {
      const parts = value.split(" ");
      if (parts.length === 2) {
        const foundCountry = countries.find(
          (c: Country) => c.dialCode === parts[0]
        );
        if (foundCountry) {
          setCountry(foundCountry);
          setPhone(parts[1]);
        }
      }
    }
  }, [value]);

  // Combine country code and phone number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    onChange(`${country.dialCode} ${e.target.value}`);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = countries.find(
      (c: Country) => c.dialCode === e.target.value
    );
    if (selectedCountry) {
      setCountry(selectedCountry);
      onChange(`${selectedCountry.dialCode} ${phone}`);
    }
  };

  const inputClasses = `
    flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors
    ${
      error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
    }
  `;

  const selectClasses = `
    px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors min-w-32
    ${
      error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
    }
  `;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-2">
        <select
          value={country.dialCode}
          onChange={handleCountryChange}
          className={selectClasses}
        >
          {countries.map((country: Country) => (
            <option key={country.code} value={country.dialCode}>
              {country.name} ({country.dialCode})
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="Phone number"
          className={inputClasses}
        />
      </div>
      {error && helperText && (
        <p className="mt-1 text-sm text-red-600">{helperText}</p>
      )}
    </div>
  );
};

export default PhoneInput;
