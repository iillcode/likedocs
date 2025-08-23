"use client";

import React, { Dispatch, SetStateAction } from "react";
import ColorSwatchInput from "./ui/ColorSwatchInput";
import SizeInput from "./ui/SizeInput";
import CompactInput from "./ui/CompactInput";
import CompactSelect from "./ui/CompactSelect";

interface KV { prop: string; value: string }

interface Spacing { t: string; r: string; b: string; l: string }

interface StyleEditorPanelProps {
  visible: boolean;
  onClose: () => void;
  styleTargetTag?: string;
  // Layout mode: floating panel (default) or right-hand sidebar
  mode?: "sidebar" | "floating";

  // Inline styles list
  inlineStyles: KV[];
  setInlineStyles: Dispatch<SetStateAction<KV[]>>;
  applyInlineStyle: (prop: string, value: string) => void;
  newProp: string;
  setNewProp: Dispatch<SetStateAction<string>>;
  newVal: string;
  setNewVal: Dispatch<SetStateAction<string>>;

  // Computed styles
  computedCollapsed: boolean;
  setComputedCollapsed: Dispatch<SetStateAction<boolean>>;
  computedStyles: KV[];

  // Quick controls
  qcText: string;
  setQcText: Dispatch<SetStateAction<string>>;
  applyQuickText: (text: string) => void;

  qcColor: string; setQcColor: Dispatch<SetStateAction<string>>;
  qcBg: string; setQcBg: Dispatch<SetStateAction<string>>;
  qcBorderColor: string; setQcBorderColor: Dispatch<SetStateAction<string>>;

  qcWidth: string; setQcWidth: Dispatch<SetStateAction<string>>;
  qcWidthUnit: string; setQcWidthUnit: Dispatch<SetStateAction<string>>;
  qcHeight: string; setQcHeight: Dispatch<SetStateAction<string>>;
  qcHeightUnit: string; setQcHeightUnit: Dispatch<SetStateAction<string>>;

  qcPad: Spacing; setQcPad: Dispatch<SetStateAction<Spacing>>;
  qcMar: Spacing; setQcMar: Dispatch<SetStateAction<Spacing>>;

  qcBorderWidth: string; setQcBorderWidth: Dispatch<SetStateAction<string>>;
  qcBorderWidthUnit: string; setQcBorderWidthUnit: Dispatch<SetStateAction<string>>;
  qcBorderStyle: string; setQcBorderStyle: Dispatch<SetStateAction<string>>;
  qcBorderRadius: string; setQcBorderRadius: Dispatch<SetStateAction<string>>;
  qcBorderRadiusUnit: string; setQcBorderRadiusUnit: Dispatch<SetStateAction<string>>;

  qcFontSize: string; setQcFontSize: Dispatch<SetStateAction<string>>;
  qcFontSizeUnit: string; setQcFontSizeUnit: Dispatch<SetStateAction<string>>;
  qcFontWeight: string; setQcFontWeight: Dispatch<SetStateAction<string>>;
  qcTextAlign: string; setQcTextAlign: Dispatch<SetStateAction<string>>;

  // Layout
  qcDisplay: string; setQcDisplay: Dispatch<SetStateAction<string>>;
  qcFlexDirection: string; setQcFlexDirection: Dispatch<SetStateAction<string>>;
  qcJustifyContent: string; setQcJustifyContent: Dispatch<SetStateAction<string>>;
  qcAlignItems: string; setQcAlignItems: Dispatch<SetStateAction<string>>;
  qcFlexWrap: string; setQcFlexWrap: Dispatch<SetStateAction<string>>;
  qcGap: string; setQcGap: Dispatch<SetStateAction<string>>;
  qcGapUnit: string; setQcGapUnit: Dispatch<SetStateAction<string>>;
}

const StyleEditorPanel: React.FC<StyleEditorPanelProps> = (props) => {
  if (!props.visible) return null;
  const tagLabel = props.styleTargetTag ? `- <${props.styleTargetTag}>` : "";
  const sidebar = props.mode === "sidebar";

  return (
    <div
      className={
        sidebar
          ? "w-80 md:w-96 h-full border-l border-white/10 bg-[#0e0e0e] text-gray-100 flex flex-col overflow-hidden"
          : "absolute inset-x-2 bottom-2 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[420px] md:w-[460px] max-h-[72vh] rounded-2xl border border-white/10 bg-[#101010]/95 backdrop-blur-xl shadow-2xl text-gray-100 flex flex-col overflow-hidden"
      }
    >
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d0d0d] border-b border-white/10 text-white sticky top-0 z-10">
        <div className="text-sm font-semibold">Style editor {tagLabel}</div>
        <button className="text-white/80 hover:text-white text-lg leading-none rounded-md p-1 hover:bg-white/5 transition" onClick={props.onClose}>×</button>
      </div>

      <div className={["p-3 space-y-4 overflow-auto", sidebar ? "flex-1" : ""].join(" ")}>
        {/* Quick Edit Section */}
        <div>
          <div className="text-xs font-semibold text-slate-200/80 mb-2">Quick edit</div>
          {/* Text content */}
          <div className="mb-3">
            <div className="text-[11px] text-slate-400 mb-1">Text content</div>
            <CompactInput
              placeholder="Enter text"
              value={props.qcText}
              onChange={(e) => { const v = e.target.value; props.setQcText(v); props.applyQuickText(v); }}
            />
          </div>
          {/* Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <div className="text-[11px] text-slate-400 mb-1">Text</div>
              <ColorSwatchInput
                value={props.qcColor}
                defaultColor="#000000"
                onChange={(val) => { props.setQcColor(val); props.applyInlineStyle("color", val || ""); }}
              />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-1">Background</div>
              <ColorSwatchInput
                value={props.qcBg}
                defaultColor="#ffffff"
                onChange={(val) => { props.setQcBg(val); props.applyInlineStyle("background-color", val || ""); }}
              />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-1">Border color</div>
              <ColorSwatchInput
                value={props.qcBorderColor}
                defaultColor="#000000"
                onChange={(val) => { props.setQcBorderColor(val); props.applyInlineStyle("border-color", val || ""); }}
              />
            </div>
          </div>

          {/* Layout */}
          <div className="space-y-2 mb-3">
            <div className="text-[11px] text-slate-400 mb-1">Layout</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-slate-400 mb-1">Display</div>
                <CompactSelect className="w-full" value={props.qcDisplay}
                  onChange={(e) => { const v = e.target.value; props.setQcDisplay(v); props.applyInlineStyle("display", v || ""); }}>
                  {["","block","inline","inline-block","flex","inline-flex","grid","inline-grid"].map(opt => (
                    <option key={opt} value={opt}>{opt || 'auto'}</option>
                  ))}
                </CompactSelect>
              </div>
              <div>
                <SizeInput
                  label="Gap"
                  num={props.qcGap}
                  unit={props.qcGapUnit}
                  units={["px","rem","em","%"]}
                  onNumChange={(v) => { props.setQcGap(v); props.applyInlineStyle("gap", v ? `${v}${props.qcGapUnit}` : ""); }}
                  onUnitChange={(u) => { props.setQcGapUnit(u); props.applyInlineStyle("gap", props.qcGap ? `${props.qcGap}${u}` : ""); }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <CompactSelect className="w-full" value={props.qcJustifyContent}
                onChange={(e) => { const v = e.target.value; props.setQcJustifyContent(v); props.applyInlineStyle("justify-content", v || ""); }}>
                {["","flex-start","center","flex-end","space-between","space-around","space-evenly"].map(opt => (
                  <option key={opt} value={opt}>{opt || 'auto'}</option>
                ))}
              </CompactSelect>
              <CompactSelect className="w-full" value={props.qcAlignItems}
                onChange={(e) => { const v = e.target.value; props.setQcAlignItems(v); props.applyInlineStyle("align-items", v || ""); }}>
                {["","stretch","center","flex-start","flex-end","baseline"].map(opt => (
                  <option key={opt} value={opt}>{opt || 'auto'}</option>
                ))}
              </CompactSelect>
              <CompactSelect className="w-full" value={props.qcFlexDirection}
                onChange={(e) => { const v = e.target.value; props.setQcFlexDirection(v); props.applyInlineStyle("flex-direction", v || ""); }}>
                {["","row","row-reverse","column","column-reverse"].map(opt => (
                  <option key={opt} value={opt}>{opt || 'auto'}</option>
                ))}
              </CompactSelect>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <CompactSelect className="w-full" value={props.qcFlexWrap}
                onChange={(e) => { const v = e.target.value; props.setQcFlexWrap(v); props.applyInlineStyle("flex-wrap", v || ""); }}>
                {["","nowrap","wrap","wrap-reverse"].map(opt => (
                  <option key={opt} value={opt}>{opt || 'auto'}</option>
                ))}
              </CompactSelect>
            </div>
          </div>

          {/* Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <SizeInput
                label="Width"
                num={props.qcWidth}
                unit={props.qcWidthUnit}
                units={["px","%","rem","em","vw","vh"]}
                onNumChange={(v) => { props.setQcWidth(v); props.applyInlineStyle("width", v ? `${v}${props.qcWidthUnit}` : ""); }}
                onUnitChange={(u) => { props.setQcWidthUnit(u); props.applyInlineStyle("width", props.qcWidth ? `${props.qcWidth}${u}` : ""); }}
                inputClassName="h-10"
                selectWidthClass="w-10"
              />
            </div>
            <div>
              <SizeInput
                label="Height"
                num={props.qcHeight}
                unit={props.qcHeightUnit}
                units={["px","%","rem","em","vw","vh"]}
                onNumChange={(v) => { props.setQcHeight(v); props.applyInlineStyle("height", v ? `${v}${props.qcHeightUnit}` : ""); }}
                onUnitChange={(u) => { props.setQcHeightUnit(u); props.applyInlineStyle("height", props.qcHeight ? `${props.qcHeight}${u}` : ""); }}
                inputClassName="h-10"
                selectWidthClass="w-10"
              />
            </div>
          </div>

          {/* Spacing */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-[11px] text-slate-400 mb-1">Padding (T R B L)</div>
              <div className="grid grid-cols-4 gap-1">
                {(["t","r","b","l"] as const).map((k) => (
                  <input key={k} type="number" className="rounded-md border border-white/10 px-1 py-1 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                    value={props.qcPad[k]}
                    onChange={(e) => {
                      const v = e.target.value; const next = { ...props.qcPad, [k]: v } as any; props.setQcPad(next);
                      const prop = k === "t" ? "padding-top" : k === "r" ? "padding-right" : k === "b" ? "padding-bottom" : "padding-left";
                      props.applyInlineStyle(prop, v ? `${v}px` : "");
                    }} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-1">Margin (T R B L)</div>
              <div className="grid grid-cols-4 gap-1">
                {(["t","r","b","l"] as const).map((k) => (
                  <input key={k} type="number" className="rounded-md border border-white/10 px-1 py-1 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                    value={props.qcMar[k]}
                    onChange={(e) => {
                      const v = e.target.value; const next = { ...props.qcMar, [k]: v } as any; props.setQcMar(next);
                      const prop = k === "t" ? "margin-top" : k === "r" ? "margin-right" : k === "b" ? "margin-bottom" : "margin-left";
                      props.applyInlineStyle(prop, v ? `${v}px` : "");
                    }} />
                ))}
              </div>
            </div>
          </div>

          {/* Border */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <SizeInput
                label="Border width"
                num={props.qcBorderWidth}
                unit={props.qcBorderWidthUnit}
                units={["px","rem","em"]}
                onNumChange={(v) => { props.setQcBorderWidth(v); props.applyInlineStyle("border-width", v ? `${v}${props.qcBorderWidthUnit}` : ""); }}
                onUnitChange={(u) => { props.setQcBorderWidthUnit(u); props.applyInlineStyle("border-width", props.qcBorderWidth ? `${props.qcBorderWidth}${u}` : ""); }}
              />
              <div className="text-[11px] text-slate-400 mb-1 mt-2">Border style</div>
              <CompactSelect className="w-full" value={props.qcBorderStyle}
                onChange={(e) => { props.setQcBorderStyle(e.target.value); props.applyInlineStyle("border-style", e.target.value); }}>
                {['none','solid','dashed','dotted','double','groove','ridge','inset','outset'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </CompactSelect>
            </div>
            <div>
              <SizeInput
                label="Border radius"
                num={props.qcBorderRadius}
                unit={props.qcBorderRadiusUnit}
                units={["px","%","rem","em"]}
                onNumChange={(v) => { props.setQcBorderRadius(v); props.applyInlineStyle("border-radius", v ? `${v}${props.qcBorderRadiusUnit}` : ""); }}
                onUnitChange={(u) => { props.setQcBorderRadiusUnit(u); props.applyInlineStyle("border-radius", props.qcBorderRadius ? `${props.qcBorderRadius}${u}` : ""); }}
              />
            </div>
          </div>

          {/* Typography */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <SizeInput
                label="Font size"
                num={props.qcFontSize}
                unit={props.qcFontSizeUnit}
                units={["px","rem","em","%"]}
                onNumChange={(v) => { props.setQcFontSize(v); props.applyInlineStyle("font-size", v ? `${v}${props.qcFontSizeUnit}` : ""); }}
                onUnitChange={(u) => { props.setQcFontSizeUnit(u); props.applyInlineStyle("font-size", props.qcFontSize ? `${props.qcFontSize}${u}` : ""); }}
              />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-1">Weight & Align</div>
              <div className="flex items-center gap-2">
                <CompactSelect className="flex-1" value={props.qcFontWeight}
                  onChange={(e) => { props.setQcFontWeight(e.target.value); props.applyInlineStyle("font-weight", e.target.value || ""); }}>
                  {["","normal","bold","100","200","300","400","500","600","700","800","900"].map(opt => (
                    <option key={opt} value={opt}>{opt || 'default'}</option>
                  ))}
                </CompactSelect>
                <CompactSelect className="w-24" value={props.qcTextAlign}
                  onChange={(e) => { props.setQcTextAlign(e.target.value); props.applyInlineStyle("text-align", e.target.value || ""); }}>
                  {["","left","center","right","justify"].map(opt => (
                    <option key={opt} value={opt}>{opt || 'auto'}</option>
                  ))}
                </CompactSelect>
              </div>
            </div>
          </div>
        </div>

        {/* Inline styles list */}
        <div>
          <div className="text-xs font-semibold text-slate-200/80 mb-2">Inline styles</div>
          <div className="space-y-2">
            {props.inlineStyles.length === 0 && (
              <div className="text-xs text-slate-400">No inline styles. Add one below.</div>
            )}
            {props.inlineStyles.map(({ prop, value }, idx) => (
              <div key={prop + idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="col-span-5 rounded-md border border-white/10 px-2 py-1 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                  value={prop}
                  onChange={(e) => {
                    const newProp = e.target.value;
                    const current = [...props.inlineStyles];
                    const oldProp = current[idx].prop;
                    current[idx] = { prop: newProp, value };
                    props.setInlineStyles(current);
                    // Remove old prop and set new
                    if (oldProp && oldProp !== newProp) props.applyInlineStyle(oldProp, "");
                    if (newProp) props.applyInlineStyle(newProp, value);
                  }}
                />
                <input
                  className="col-span-6 rounded-md border border-white/10 px-2 py-1 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                  value={value}
                  onChange={(e) => props.applyInlineStyle(prop, e.target.value)}
                />
                <button
                  className="col-span-1 text-xs text-red-400 hover:text-red-300"
                  onClick={() => props.applyInlineStyle(prop, "")}
                  title="Remove property"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <input
            className="col-span-5 rounded-md border border-white/10 px-2 py-1 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
            placeholder="property (e.g., color)"
            value={props.newProp}
            onChange={(e) => props.setNewProp(e.target.value)}
          />
          <input
            className="col-span-6 rounded-md border border-white/10 px-2 py-1 text-xs bg-[#151515] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
            placeholder="value (e.g., #111)"
            value={props.newVal}
            onChange={(e) => props.setNewVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.applyInlineStyle(props.newProp.trim(), props.newVal);
                props.setNewProp("");
                props.setNewVal("");
              }
            }}
          />
          <button
            className="col-span-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 transition"
            onClick={() => {
              props.applyInlineStyle(props.newProp.trim(), props.newVal);
              props.setNewProp("");
              props.setNewVal("");
            }}
          >
            +
          </button>
        </div>

        <div className="pt-2">
          <button
            className="text-xs font-semibold text-slate-200 hover:underline"
            onClick={() => props.setComputedCollapsed((v) => !v)}
          >
            {props.computedCollapsed ? "Show computed styles" : "Hide computed styles"}
          </button>
          {!props.computedCollapsed && (
            <div className="mt-2 max-h-48 overflow-auto rounded-md border border-white/10 bg-[#0f0f0f] p-2">
              {props.computedStyles.map(({ prop, value }) => (
                <div key={prop} className="text-[11px] text-slate-300 flex justify-between gap-2">
                  <span className="font-mono text-slate-400">{prop}</span>
                  <span className="font-mono text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleEditorPanel;
