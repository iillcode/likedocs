"use client";

import React from "react";
import CompactSelect from "../ui/CompactSelect";
import {
  LayoutGrid,
  List,
  ArrowLeftRight,
  ArrowUpDown,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";

type Props = {
  qcDisplay: string;
  setQcDisplay: (v: string) => void;
  qcFlexDirection: string;
  setQcFlexDirection: (v: string) => void;
  qcJustifyContent: string;
  setQcJustifyContent: (v: string) => void;
  qcAlignItems: string;
  setQcAlignItems: (v: string) => void;
  qcFlexWrap: string;
  setQcFlexWrap: (v: string) => void;
  applyInlineStyle: (prop: string, value: string) => void;
};

const LayoutSection: React.FC<Props> = ({
  qcDisplay,
  setQcDisplay,
  qcFlexDirection,
  setQcFlexDirection,
  qcJustifyContent,
  setQcJustifyContent,
  qcAlignItems,
  setQcAlignItems,
  qcFlexWrap,
  setQcFlexWrap,
  applyInlineStyle,
}) => {
  const isFlex = !!qcDisplay && qcDisplay.includes("flex");
  const isGrid = !!qcDisplay && qcDisplay.includes("grid");
  const isVertical = isFlex && qcFlexDirection?.startsWith("column");

  return (
    <div className="space-y-4 mb-4">
      <div className="text-[11px] text-slate-400 mb-1">Layout</div>

      {/* Layout Type and Direction */}
      <div className="space-y-4">
        <div>
          <div className="text-[11px] text-slate-400 mb-1">Layout Type</div>
          <div className="flex items-center gap-3 w-full">
            <button
              className={`flex-1 px-4 py-2.5 rounded-md border text-[11px] flex items-center justify-center gap-1 transition ${
                isFlex
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title="Stack (flex)"
              onClick={() => {
                setQcDisplay("flex");
                applyInlineStyle("display", "flex");
              }}
            >
              <List size={14} />
              Stack
            </button>
            <button
              className={`flex-1 px-4 py-2.5 rounded-md border text-[11px] flex items-center justify-center gap-1 transition ${
                isGrid
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title="Grid"
              onClick={() => {
                setQcDisplay("grid");
                applyInlineStyle("display", "grid");
              }}
            >
              <LayoutGrid size={14} />
              Grid
            </button>
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 mb-1">Direction</div>
          <div className="flex items-center gap-3 w-full">
            <button
              className={`flex-1 px-4 py-2.5 rounded-md border transition flex items-center justify-center gap-1 text-[11px] ${
                !isFlex
                  ? "opacity-40 cursor-not-allowed border-white/10 text-slate-400"
                  : qcFlexDirection?.startsWith("row")
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title="Horizontal"
              disabled={!isFlex}
              onClick={() => {
                if (!isFlex) return;
                setQcFlexDirection("row");
                applyInlineStyle("flex-direction", "row");
              }}
            >
              <ArrowLeftRight size={14} />
              Horizontal
            </button>
            <button
              className={`flex-1 px-4 py-2.5 rounded-md border transition flex items-center justify-center gap-1 text-[11px] ${
                !isFlex
                  ? "opacity-40 cursor-not-allowed border-white/10 text-slate-400"
                  : qcFlexDirection?.startsWith("column")
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : "border-white/10 hover:bg-white/10 text-slate-300"
              }`}
              title="Vertical"
              disabled={!isFlex}
              onClick={() => {
                if (!isFlex) return;
                setQcFlexDirection("column");
                applyInlineStyle("flex-direction", "column");
              }}
            >
              <ArrowUpDown size={14} />
              Vertical
            </button>
          </div>
        </div>
      </div>

      {/* Distribute / Align / Wrap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] text-slate-400 mb-1">Distribute</div>
          <CompactSelect
            className="w-full"
            value={qcJustifyContent}
            onChange={(e) => {
              const v = e.target.value;
              setQcJustifyContent(v);
              applyInlineStyle("justify-content", v || "");
            }}
          >
            {[
              { k: "", l: "auto" },
              { k: "flex-start", l: "Start" },
              { k: "center", l: "Center" },
              { k: "flex-end", l: "End" },
              { k: "space-between", l: "Between" },
              { k: "space-around", l: "Around" },
              { k: "space-evenly", l: "Evenly" },
            ].map((o) => (
              <option key={o.k} value={o.k}>
                {o.l}
              </option>
            ))}
          </CompactSelect>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 mb-1">Align</div>
          <div className="flex items-center gap-3">
            {(!isVertical
              ? ([
                  { v: "flex-start", Icon: AlignStartHorizontal, t: "Left" },
                  { v: "center", Icon: AlignCenterHorizontal, t: "Center" },
                  { v: "flex-end", Icon: AlignEndHorizontal, t: "Right" },
                ] as const)
              : ([
                  { v: "flex-start", Icon: AlignStartVertical, t: "Top" },
                  { v: "center", Icon: AlignCenterVertical, t: "Middle" },
                  { v: "flex-end", Icon: AlignEndVertical, t: "Bottom" },
                ] as const)
            ).map(({ v, Icon, t }) => (
              <button
                key={v}
                className={`p-2 rounded-md border transition ${
                  qcAlignItems === v
                    ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                    : "border-white/10 hover:bg-white/10 text-slate-300"
                }`}
                title={t}
                onClick={() => {
                  setQcAlignItems(v);
                  applyInlineStyle("align-items", v);
                }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 mb-1">Wrap</div>
          <div className="flex items-center gap-3">
            <button
              className={`px-3 py-2 rounded-md border text-[11px] transition ${
                isFlex && qcFlexWrap === "wrap"
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : isFlex
                  ? "border-white/10 hover:bg-white/10 text-slate-300"
                  : "opacity-40 cursor-not-allowed border-white/10 text-slate-400"
              }`}
              title="Wrap"
              disabled={!isFlex}
              onClick={() => {
                if (!isFlex) return;
                setQcFlexWrap("wrap");
                applyInlineStyle("flex-wrap", "wrap");
              }}
            >
              Yes
            </button>
            <button
              className={`px-3 py-2 rounded-md border text-[11px] transition ${
                isFlex && (qcFlexWrap === "nowrap" || !qcFlexWrap)
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                  : isFlex
                  ? "border-white/10 hover:bg-white/10 text-slate-300"
                  : "opacity-40 cursor-not-allowed border-white/10 text-slate-400"
              }`}
              title="No wrap"
              disabled={!isFlex}
              onClick={() => {
                if (!isFlex) return;
                setQcFlexWrap("nowrap");
                applyInlineStyle("flex-wrap", "nowrap");
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LayoutSection);
