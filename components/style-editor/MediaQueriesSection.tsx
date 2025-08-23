"use client";

import React from "react";

type Rule = { id: string; label: string; min: number | null; prop: string; value: string };

type Props = {
  mqMinWidth: string;
  setMqMinWidth: (v: string) => void;
  mqProp: string;
  setMqProp: (v: string) => void;
  mqVal: string;
  setMqVal: (v: string) => void;
  mqRules: Rule[];
  onAddMqProp: (min: string, prop: string, value: string) => void;
  onDeleteMqProp: (id: string) => void;
};

const MediaQueriesSection: React.FC<Props> = ({
  mqMinWidth,
  setMqMinWidth,
  mqProp,
  setMqProp,
  mqVal,
  setMqVal,
  mqRules,
  onAddMqProp,
  onDeleteMqProp,
}) => {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold text-slate-200/80 mb-3">Media queries</div>
      <div className="space-y-3">
        {mqRules.length === 0 && (
          <div className="text-xs text-slate-400">No media rules yet. Add one below.</div>
        )}
        {mqRules.length > 0 && (
          <div className="max-h-36 overflow-auto rounded-md border border-white/10 bg-[#0f0f0f] divide-y divide-white/10">
            {mqRules.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2 text-[11px] text-slate-200">
                <div className="truncate">{r.label}</div>
                <button
                  className="ml-2 text-red-400 hover:text-red-300 text-xs"
                  title="Remove rule"
                  onClick={() => onDeleteMqProp(r.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-12 gap-3 items-center">
        <input
          type="number"
          className="col-span-3 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
          placeholder="min px"
          value={mqMinWidth}
          onChange={(e) => setMqMinWidth(e.target.value)}
        />
        <input
          className="col-span-4 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
          placeholder="property (e.g., font-size)"
          value={mqProp}
          onChange={(e) => setMqProp(e.target.value)}
        />
        <input
          className="col-span-4 rounded-md border border-white/10 px-3 py-1.5 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
          placeholder="value (e.g., 18px)"
          value={mqVal}
          onChange={(e) => setMqVal(e.target.value)}
          onKeyDown={(e) => {
            if ((e as any).key === "Enter") {
              onAddMqProp(mqMinWidth, mqProp, mqVal);
              setMqMinWidth("");
              setMqProp("");
              setMqVal("");
            }
          }}
        />
        <button
          className="col-span-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 transition"
          onClick={() => {
            onAddMqProp(mqMinWidth, mqProp, mqVal);
            setMqMinWidth("");
            setMqProp("");
            setMqVal("");
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default React.memo(MediaQueriesSection);
