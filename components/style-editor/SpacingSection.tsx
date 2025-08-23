"use client";

import React, { useState } from "react";
import { Square, BoxSelect } from "lucide-react";

type Spacing = { t: string; r: string; b: string; l: string };

type Props = {
  // Gap
  qcGap: string;
  setQcGap: (v: string) => void;
  debouncedApplyInlineStyle: (prop: string, value: string) => void;
  // Padding
  qcPad: Spacing;
  setQcPad: (v: Spacing) => void;
  applyInlineStyle: (prop: string, value: string) => void;
  // Margin
  qcMar: Spacing;
  setQcMar: (v: Spacing) => void;
};

const SpacingSection: React.FC<Props> = ({
  qcGap,
  setQcGap,
  debouncedApplyInlineStyle,
  qcPad,
  setQcPad,
  applyInlineStyle,
  qcMar,
  setQcMar,
}) => {
  const [padMode, setPadMode] = useState<"all" | "sides">("sides");
  const [padAllVal, setPadAllVal] = useState<string>(qcPad?.t || "");
  const [marMode, setMarMode] = useState<"all" | "sides">("sides");
  const [marAllVal, setMarAllVal] = useState<string>(qcMar?.t || "");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Gap */}
      <div>
        <div className="text-[11px] text-slate-400 mb-1">Gap</div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            className="w-24 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
            value={qcGap}
            onChange={(e) => {
              const v = e.target.value;
              setQcGap(v);
              debouncedApplyInlineStyle("gap", v ? `${v}px` : "");
            }}
          />
          <input
            type="range"
            min={0}
            max={160}
            value={Number(qcGap || 0)}
            onChange={(e) => {
              const v = String((e.target as HTMLInputElement).value);
              setQcGap(v);
              debouncedApplyInlineStyle("gap", v ? `${v}px` : "");
            }}
            className="flex-1 accent-blue-500"
          />
        </div>
      </div>

      {/* Padding */}
      <div className="sm:col-span-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-slate-400 mb-1">Padding</div>
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-md border transition ${
                padMode === "all"
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title="Uniform padding"
              onClick={() => setPadMode("all")}
            >
              <Square size={14} />
            </button>
            <button
              className={`p-2 rounded-md border transition ${
                padMode === "sides"
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title="Separate sides"
              onClick={() => setPadMode("sides")}
            >
              <BoxSelect size={14} />
            </button>
          </div>
        </div>
        {padMode === "all" ? (
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="w-28 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={padAllVal}
              onChange={(e) => {
                const v = e.target.value;
                setPadAllVal(v);
                debouncedApplyInlineStyle("padding", v ? `${v}px` : "");
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 items-center justify-items-center">
            {/* Top */}
            <input
              type="number"
              placeholder="T"
              className="w-20 col-span-3 justify-self-center rounded-md border border-white/10 px-2 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={qcPad.t}
              onChange={(e) => {
                const v = e.target.value;
                const next = { ...qcPad, t: v } as Spacing;
                setQcPad(next);
                debouncedApplyInlineStyle("padding-top", v ? `${v}px` : "");
              }}
            />
            {/* Left */}
            <input
              type="number"
              placeholder="L"
              className="w-20 justify-self-start rounded-md border border-white/10 px-2 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={qcPad.l}
              onChange={(e) => {
                const v = e.target.value;
                const next = { ...qcPad, l: v } as Spacing;
                setQcPad(next);
                debouncedApplyInlineStyle("padding-left", v ? `${v}px` : "");
              }}
            />
            {/* Spacer */}
            <div />
            {/* Right */}
            <input
              type="number"
              placeholder="R"
              className="w-20 justify-self-end rounded-md border border-white/10 px-2 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={qcPad.r}
              onChange={(e) => {
                const v = e.target.value;
                const next = { ...qcPad, r: v } as Spacing;
                setQcPad(next);
                debouncedApplyInlineStyle("padding-right", v ? `${v}px` : "");
              }}
            />
            {/* Bottom */}
            <input
              type="number"
              placeholder="B"
              className="w-20 col-span-3 justify-self-center rounded-md border border-white/10 px-2 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={qcPad.b}
              onChange={(e) => {
                const v = e.target.value;
                const next = { ...qcPad, b: v } as Spacing;
                setQcPad(next);
                debouncedApplyInlineStyle("padding-bottom", v ? `${v}px` : "");
              }}
            />
          </div>
        )}
      </div>

      {/* Margin */}
      <div className="sm:col-span-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-slate-400 mb-1">Margin</div>
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-md border transition ${
                marMode === "all"
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title="Uniform margin"
              onClick={() => setMarMode("all")}
            >
              <Square size={14} />
            </button>
            <button
              className={`p-2 rounded-md border transition ${
                marMode === "sides"
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title="Separate sides"
              onClick={() => setMarMode("sides")}
            >
              <BoxSelect size={14} />
            </button>
          </div>
        </div>
        {marMode === "all" ? (
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="w-28 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={marAllVal}
              onChange={(e) => {
                const v = e.target.value;
                setMarAllVal(v);
                debouncedApplyInlineStyle("margin", v ? `${v}px` : "");
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 items-center justify-items-center">
            {/* Top */}
            <input
              type="number"
              placeholder="T"
              className="w-20 col-span-3 justify-self-center rounded-md border border-white/10 px-2 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={qcMar.t}
              onChange={(e) => {
                const v = e.target.value;
                const next = { ...qcMar, t: v } as Spacing;
                setQcMar(next);
                debouncedApplyInlineStyle("margin-top", v ? `${v}px` : "");
              }}
            />
            {/* Left */}
            <input
              type="number"
              placeholder="L"
              className="w-20 justify-self-start rounded-md border border-white/10 px-2 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={qcMar.l}
              onChange={(e) => {
                const v = e.target.value;
                const next = { ...qcMar, l: v } as Spacing;
                setQcMar(next);
                debouncedApplyInlineStyle("margin-left", v ? `${v}px` : "");
              }}
            />
            {/* Spacer */}
            <div />
            {/* Right */}
            <input
              type="number"
              placeholder="R"
              className="w-20 justify-self-end rounded-md border border-white/10 px-2 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={qcMar.r}
              onChange={(e) => {
                const v = e.target.value;
                const next = { ...qcMar, r: v } as Spacing;
                setQcMar(next);
                debouncedApplyInlineStyle("margin-right", v ? `${v}px` : "");
              }}
            />
            {/* Bottom */}
            <input
              type="number"
              placeholder="B"
              className="w-20 col-span-3 justify-self-center rounded-md border border-white/10 px-2 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              value={qcMar.b}
              onChange={(e) => {
                const v = e.target.value;
                const next = { ...qcMar, b: v } as Spacing;
                setQcMar(next);
                debouncedApplyInlineStyle("margin-bottom", v ? `${v}px` : "");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SpacingSection);
