"use client";

import React from "react";
import SizeInput from "../ui/SizeInput";
import CompactSelect from "../ui/CompactSelect";

type Props = {
  qcBorderWidth: string;
  setQcBorderWidth: (v: string) => void;
  qcBorderWidthUnit: string;
  setQcBorderWidthUnit: (u: string) => void;
  qcBorderStyle: string;
  setQcBorderStyle: (v: string) => void;
  qcBorderRadius: string;
  setQcBorderRadius: (v: string) => void;
  qcBorderRadiusUnit: string;
  setQcBorderRadiusUnit: (u: string) => void;
  applyInlineStyle: (prop: string, value: string) => void;
  debouncedApplyInlineStyle: (prop: string, value: string) => void;
};

const BorderSection: React.FC<Props> = ({
  qcBorderWidth,
  setQcBorderWidth,
  qcBorderWidthUnit,
  setQcBorderWidthUnit,
  qcBorderStyle,
  setQcBorderStyle,
  qcBorderRadius,
  setQcBorderRadius,
  qcBorderRadiusUnit,
  setQcBorderRadiusUnit,
  applyInlineStyle,
  debouncedApplyInlineStyle,
}) => {
  return (
    <div className="space-y-4 mb-4">
      <div>
        <SizeInput
          label="Border width"
          num={qcBorderWidth}
          unit={qcBorderWidthUnit}
          units={["px", "rem", "em"]}
          onNumChange={(v) => {
            setQcBorderWidth(v);
            debouncedApplyInlineStyle("border-width", v ? `${v}${qcBorderWidthUnit}` : "");
          }}
          onUnitChange={(u) => {
            setQcBorderWidthUnit(u);
            applyInlineStyle("border-width", qcBorderWidth ? `${qcBorderWidth}${u}` : "");
          }}
        />
      </div>
      <div>
        <div className="text-[11px] text-slate-400 mb-1">Border style</div>
        <CompactSelect
          className="w-full"
          value={qcBorderStyle}
          onChange={(e) => {
            setQcBorderStyle(e.target.value);
            applyInlineStyle("border-style", e.target.value);
          }}
        >
          {["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"].map(
            (opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            )
          )}
        </CompactSelect>
      </div>
      <div>
        <SizeInput
          label="Border radius"
          num={qcBorderRadius}
          unit={qcBorderRadiusUnit}
          units={["px", "%", "rem", "em"]}
          onNumChange={(v) => {
            setQcBorderRadius(v);
            debouncedApplyInlineStyle("border-radius", v ? `${v}${qcBorderRadiusUnit}` : "");
          }}
          onUnitChange={(u) => {
            setQcBorderRadiusUnit(u);
            applyInlineStyle("border-radius", qcBorderRadius ? `${qcBorderRadius}${u}` : "");
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(BorderSection);
