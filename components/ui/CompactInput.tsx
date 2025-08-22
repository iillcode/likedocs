"use client";

import React from "react";

interface CompactInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CompactInput: React.FC<CompactInputProps> = ({ className = "", ...rest }) => {
  return (
    <input
      {...rest}
      className={[
        "w-26 min-h-8 rounded-md border border-white/10 bg-[#151515]",
        "px-2 text-xs text-gray-100 placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
        "transition",
        className,
      ].join(" ")}
    />
  );
};

export default CompactInput;
