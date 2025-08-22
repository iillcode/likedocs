"use client";

import React, { useId, useRef } from "react";
import CompactInput from "./CompactInput";

interface ColorSwatchInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  defaultColor?: string; // fallback when value is empty
}

const ColorSwatchInput: React.FC<ColorSwatchInputProps> = ({ label, value, onChange, defaultColor = "#000000" }) => {
  const id = useId();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const swatchColor = value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : defaultColor;

  return (
    <div className="w-full">
      {label && <div className="text-[11px] text-slate-400 mb-1">{label}</div>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={label ? `${label} color` : "Pick color"}
          onClick={() => colorInputRef.current?.click()}
          className="h-8 w-8 rounded-md border border-white/10 p-0.5 overflow-hidden relative"
          style={{ backgroundColor: swatchColor }}
        >
          <span className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10" />
        </button>
        <input
          ref={colorInputRef}
          id={id}
          type="color"
          className="sr-only"
          value={value || defaultColor}
          onChange={(e) => onChange(e.target.value)}
        />
        <CompactInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ColorSwatchInput;
