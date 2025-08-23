"use client";

import React from "react";
import SizeInput from "../ui/SizeInput";

type Props = {
  qcWidth: string;
  setQcWidth: (v: string) => void;
  qcWidthUnit: string;
  setQcWidthUnit: (u: string) => void;
  qcHeight: string;
  setQcHeight: (v: string) => void;
  qcHeightUnit: string;
  setQcHeightUnit: (u: string) => void;
  applyInlineStyle: (prop: string, value: string) => void;
  debouncedApplyInlineStyle: (prop: string, value: string) => void;
};

const SizeSection: React.FC<Props> = ({
  qcWidth,
  setQcWidth,
  qcWidthUnit,
  setQcWidthUnit,
  qcHeight,
  setQcHeight,
  qcHeightUnit,
  setQcHeightUnit,
  applyInlineStyle,
  debouncedApplyInlineStyle,
}) => {
  return (
    <div className="space-y-4 mb-4">
      <div>
        <SizeInput
          label="Width"
          num={qcWidth}
          unit={qcWidthUnit}
          units={["px", "%", "rem", "em", "vw", "vh"]}
          onNumChange={(v) => {
            setQcWidth(v);
            debouncedApplyInlineStyle("width", v ? `${v}${qcWidthUnit}` : "");
          }}
          onUnitChange={(u) => {
            setQcWidthUnit(u);
            applyInlineStyle("width", qcWidth ? `${qcWidth}${u}` : "");
          }}
          inputClassName="h-10"
          selectWidthClass="w-32"
        />
      </div>
      <div>
        <SizeInput
          label="Height"
          num={qcHeight}
          unit={qcHeightUnit}
          units={["px", "%", "rem", "em", "vw", "vh"]}
          onNumChange={(v) => {
            setQcHeight(v);
            debouncedApplyInlineStyle("height", v ? `${v}${qcHeightUnit}` : "");
          }}
          onUnitChange={(u) => {
            setQcHeightUnit(u);
            applyInlineStyle("height", qcHeight ? `${qcHeight}${u}` : "");
          }}
          inputClassName="h-10"
          selectWidthClass="w-32"
        />
      </div>
    </div>
  );
};

export default React.memo(SizeSection);
