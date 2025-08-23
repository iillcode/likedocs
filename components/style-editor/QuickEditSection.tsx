"use client";

import React from "react";
import CompactInput from "../ui/CompactInput";
import ColorSwatchInput from "../ui/ColorSwatchInput";

type Props = {
  qcText: string;
  setQcText: (v: string) => void;
  applyQuickText: (text: string) => void;
  qcColor: string;
  setQcColor: (v: string) => void;
  qcBg: string;
  setQcBg: (v: string) => void;
  qcBorderColor: string;
  setQcBorderColor: (v: string) => void;
  applyInlineStyle: (prop: string, value: string) => void;
  onClose?: () => void;
};

const QuickEditSection: React.FC<Props> = ({
  qcText,
  setQcText,
  applyQuickText,
  qcColor,
  setQcColor,
  qcBg,
  setQcBg,
  qcBorderColor,
  setQcBorderColor,
  applyInlineStyle,
  onClose,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-slate-200/80">Quick edit</div>
        {onClose && (
          <button
            className="text-white/80 hover:text-white text-lg leading-none rounded-md p-2 hover:bg-white/5 transition"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>
      {/* Text content */}
      <div className="mb-4">
        <div className="text-[11px] text-slate-400 mb-1">Text content</div>
        <CompactInput
          placeholder="Enter text"
          value={qcText}
          onChange={(e) => {
            const v = e.target.value;
            setQcText(v);
            applyQuickText(v);
          }}
        />
      </div>
      {/* Colors */}
      <div className="space-y-4 mb-4">
        <div>
          <div className="text-[11px] text-slate-400 mb-1">Text Color</div>
          <ColorSwatchInput
            value={qcColor}
            defaultColor="#000000"
            onChange={(val) => {
              setQcColor(val);
              applyInlineStyle("color", val || "");
            }}
          />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 mb-1">Background Color</div>
          <ColorSwatchInput
            value={qcBg}
            defaultColor="#ffffff"
            onChange={(val) => {
              setQcBg(val);
              applyInlineStyle("background-color", val || "");
            }}
          />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 mb-1">Border Color</div>
          <ColorSwatchInput
            value={qcBorderColor}
            defaultColor="#000000"
            onChange={(val) => {
              setQcBorderColor(val);
              applyInlineStyle("border-color", val || "");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuickEditSection);
