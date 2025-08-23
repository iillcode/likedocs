"use client";

import React from "react";
import SizeInput from "../ui/SizeInput";
import CompactSelect from "../ui/CompactSelect";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

type Props = {
  qcFontSize: string;
  setQcFontSize: (v: string) => void;
  qcFontSizeUnit: string;
  setQcFontSizeUnit: (u: string) => void;
  qcFontWeight: string;
  setQcFontWeight: (v: string) => void;
  qcTextAlign: string;
  setQcTextAlign: (v: string) => void;
  applyInlineStyle: (prop: string, value: string) => void;
  debouncedApplyInlineStyle: (prop: string, value: string) => void;
};

const TypographySection: React.FC<Props> = ({
  qcFontSize,
  setQcFontSize,
  qcFontSizeUnit,
  setQcFontSizeUnit,
  qcFontWeight,
  setQcFontWeight,
  qcTextAlign,
  setQcTextAlign,
  applyInlineStyle,
  debouncedApplyInlineStyle,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <SizeInput
          label="Font size"
          num={qcFontSize}
          unit={qcFontSizeUnit}
          units={["px", "rem", "em", "%"]}
          onNumChange={(v) => {
            setQcFontSize(v);
            debouncedApplyInlineStyle("font-size", v ? `${v}${qcFontSizeUnit}` : "");
          }}
          onUnitChange={(u) => {
            setQcFontSizeUnit(u);
            applyInlineStyle("font-size", qcFontSize ? `${qcFontSize}${u}` : "");
          }}
        />
      </div>
      <div>
        <div className="text-[11px] text-slate-400 mb-1">Font Weight</div>
        <CompactSelect
          className="w-full"
          value={qcFontWeight}
          onChange={(e) => {
            setQcFontWeight(e.target.value);
            applyInlineStyle("font-weight", e.target.value || "");
          }}
        >
          {["", "normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"].map(
            (opt) => (
              <option key={opt} value={opt}>
                {opt || "default"}
              </option>
            )
          )}
        </CompactSelect>
      </div>
      <div>
        <div className="text-[11px] text-slate-400 mb-1">Text Alignment</div>
        <div className="flex items-center gap-3">
          {([
            { k: "left", Icon: AlignLeft },
            { k: "center", Icon: AlignCenter },
            { k: "right", Icon: AlignRight },
            { k: "justify", Icon: AlignJustify },
          ] as const).map(({ k, Icon }) => (
            <button
              key={k}
              className={`flex-1 px-3 py-2 rounded-md border transition flex items-center justify-center ${
                qcTextAlign === k
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title={`Align ${k}`}
              onClick={() => {
                setQcTextAlign(k);
                applyInlineStyle("text-align", k);
              }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TypographySection);
