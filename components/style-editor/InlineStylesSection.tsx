"use client";

import React from "react";

type KV = { prop: string; value: string };

type Props = {
  inlineStyles: KV[];
  setInlineStyles: (v: KV[]) => void;
  newProp: string;
  setNewProp: (v: string) => void;
  newVal: string;
  setNewVal: (v: string) => void;
  applyInlineStyle: (prop: string, value: string) => void;
};

const InlineStylesSection: React.FC<Props> = ({
  inlineStyles,
  setInlineStyles,
  newProp,
  setNewProp,
  newVal,
  setNewVal,
  applyInlineStyle,
}) => {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-200/80 mb-3">Inline styles</div>
      <div className="space-y-3">
        {inlineStyles.length === 0 && (
          <div className="text-xs text-slate-400">No inline styles. Add one below.</div>
        )}
        {inlineStyles.map(({ prop, value }, idx) => (
          <div key={prop + idx} className="grid grid-cols-12 gap-3 items-center">
            <input
              className="col-span-5 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={prop}
              onChange={(e) => {
                const newPropVal = e.target.value;
                const current = [...inlineStyles];
                const oldProp = current[idx].prop;
                current[idx] = { prop: newPropVal, value };
                setInlineStyles(current);
                if (oldProp && oldProp !== newPropVal) applyInlineStyle(oldProp, "");
                if (newPropVal) applyInlineStyle(newPropVal, value);
              }}
            />
            <input
              className="col-span-6 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={value}
              onChange={(e) => applyInlineStyle(prop, e.target.value)}
            />
            <button
              className="col-span-1 text-xs text-red-400 hover:text-red-300"
              onClick={() => applyInlineStyle(prop, "")}
              title="Remove property"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3 items-center mt-3">
        <input
          className="col-span-5 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
          placeholder="property (e.g., color)"
          value={newProp}
          onChange={(e) => setNewProp(e.target.value)}
        />
        <input
          className="col-span-6 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
          placeholder="value (e.g., #111)"
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          onKeyDown={(e) => {
            if ((e as any).key === "Enter") {
              applyInlineStyle(newProp.trim(), newVal);
              setNewProp("");
              setNewVal("");
            }
          }}
        />
        <button
          className="col-span-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 transition"
          onClick={() => {
            applyInlineStyle(newProp.trim(), newVal);
            setNewProp("");
            setNewVal("");
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default React.memo(InlineStylesSection);
