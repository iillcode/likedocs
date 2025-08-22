"use client";

import React from "react";
import CompactInput from "./CompactInput";
import CompactSelect from "./CompactSelect";

interface SizeInputProps {
  label?: string;
  num: string; // numeric part as string
  unit: string;
  units?: string[];
  min?: number;
  max?: number;
  step?: number | string;
  onNumChange: (num: string) => void;
  onUnitChange: (unit: string) => void;
  onApply?: (num: string, unit: string) => void; // optional immediate apply
  className?: string;
  selectWidthClass?: string; // tailwind width for the unit selector
  inputClassName?: string; // tailwind classes for the number input
}

const SizeInput: React.FC<SizeInputProps> = ({
  label,
  num,
  unit,
  units = ["px", "%", "rem", "em", "vw", "vh"],
  min,
  max,
  step,
  onNumChange,
  onUnitChange,
  onApply,
  className = "",
  selectWidthClass = "w-20",
  inputClassName = "",
}) => {
  const apply = (n: string, u: string) => onApply?.(n, u);

  return (
    <div className={"w-full " + className}>
      {label && <div className="text-[11px] text-slate-400 mb-1">{label}</div>}
      <div className="flex items-center gap-2">
        <CompactInput
          type="number"
          value={num}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value;
            onNumChange(v);
            apply(v, unit);
          }}
          className={["flex-1", inputClassName].join(" ")}
        />
        <CompactSelect
          value={unit}
          onChange={(e) => {
            const u = e.target.value;
            onUnitChange(u);
            apply(num, u);
          }}
          className={selectWidthClass}
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </CompactSelect>
      </div>
    </div>
  );
};

export default SizeInput;
