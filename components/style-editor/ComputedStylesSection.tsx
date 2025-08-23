"use client";

import React from "react";

type KV = { prop: string; value: string };

type Props = {
  computedCollapsed: boolean;
  setComputedCollapsed: (updater: (v: boolean) => boolean | boolean) => void;
  computedStyles: KV[];
};

const ComputedStylesSection: React.FC<Props> = ({
  computedCollapsed,
  setComputedCollapsed,
  computedStyles,
}) => {
  return (
    <div className="pt-3">
      <button
        className="text-xs font-semibold text-slate-200 hover:underline mb-2"
        onClick={() => setComputedCollapsed((v: boolean) => !v)}
      >
        {computedCollapsed ? "Show computed styles" : "Hide computed styles"}
      </button>
      {!computedCollapsed && (
        <div className="mt-3 max-h-48 overflow-auto rounded-md border border-white/10 bg-[#0f0f0f] p-3">
          {computedStyles.map(({ prop, value }) => (
            <div key={prop} className="text-[11px] text-slate-300 flex justify-between gap-3 py-0.5">
              <span className="font-mono text-slate-400">{prop}</span>
              <span className="font-mono text-slate-200">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ComputedStylesSection);
