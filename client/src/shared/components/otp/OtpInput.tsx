import React, { useRef, useEffect, useState } from "react";

interface OTPInputProps {
  otp: string;
  setOtp: (otp: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  length?: number; // Allow dynamic OTP length
  error?: boolean;
}

const OtpInput: React.FC<OTPInputProps> = ({
  otp,
  setOtp,
  isLoading,
  disabled,
  length = 6,
  error = false,
}) => {
  const [animateError, setAnimateError] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (/^\d?$/.test(value)) {
      const newOtp = otp.split("");
      newOtp[index] = value;
      setOtp(newOtp.join(""));

      if (value && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      !otp[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (/^\d*$/.test(pastedData)) {
      setOtp(pastedData.padEnd(length, ""));
      inputsRef.current[Math.min(pastedData.length, length) - 1]?.focus();
    }
  };

  useEffect(() => {
    if (error) {
      setAnimateError(true);
      setTimeout(() => {
        setAnimateError(false);
      }, 500);
    }
  }, [error]);

  return (
    <div
      className={`flex justify-center gap-1 
        ${animateError && "animate-shake"}
        ${isLoading || disabled ? "opacity-50 " : ""}`}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={isLoading || disabled}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          onPaste={handlePaste}
          className={`w-9 h-12 text-center text-2xl bg-gray-700  rounded  outline-none 
          ${animateError ? "outline !outline-error" : "outline focus:outline-accent-500"}
          ${isLoading ? `animate-pulse-fast ` : ""} transition-all duration-150 ease-in-out`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
