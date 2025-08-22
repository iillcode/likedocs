"use client";

import React from "react";

interface CompactSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const CompactSelect: React.FC<CompactSelectProps> = ({ className = "", children, ...rest }) => {
  return (
    <select
      {...rest}
      className={[
        "w-20 h-8 rounded-md border border-white/10 bg-[#151515]",
        "px-2 text-xs text-gray-100",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
        "transition",
        className,
      ].join(" ")}
    >
      {children}
    </select>
  );
};

export default CompactSelect;
