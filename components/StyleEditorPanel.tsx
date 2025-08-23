"use client";

import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import QuickEditSection from "./style-editor/QuickEditSection";
import LayoutSection from "./style-editor/LayoutSection";
import SpacingSection from "./style-editor/SpacingSection";
import SizeSection from "./style-editor/SizeSection";
import BorderSection from "./style-editor/BorderSection";
import TypographySection from "./style-editor/TypographySection";
import InlineStylesSection from "./style-editor/InlineStylesSection";
import MediaQueriesSection from "./style-editor/MediaQueriesSection";
import ComputedStylesSection from "./style-editor/ComputedStylesSection";

interface KV {
  prop: string;
  value: string;
}

interface Spacing {
  t: string;
  r: string;
  b: string;
  l: string;
}

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

  qcColor: string;
  setQcColor: Dispatch<SetStateAction<string>>;
  qcBg: string;
  setQcBg: Dispatch<SetStateAction<string>>;
  qcBorderColor: string;
  setQcBorderColor: Dispatch<SetStateAction<string>>;

  qcWidth: string;
  setQcWidth: Dispatch<SetStateAction<string>>;
  qcWidthUnit: string;
  setQcWidthUnit: Dispatch<SetStateAction<string>>;
  qcHeight: string;
  setQcHeight: Dispatch<SetStateAction<string>>;
  qcHeightUnit: string;
  setQcHeightUnit: Dispatch<SetStateAction<string>>;

  qcPad: Spacing;
  setQcPad: Dispatch<SetStateAction<Spacing>>;
  qcMar: Spacing;
  setQcMar: Dispatch<SetStateAction<Spacing>>;

  qcBorderWidth: string;
  setQcBorderWidth: Dispatch<SetStateAction<string>>;
  qcBorderWidthUnit: string;
  setQcBorderWidthUnit: Dispatch<SetStateAction<string>>;
  qcBorderStyle: string;
  setQcBorderStyle: Dispatch<SetStateAction<string>>;
  qcBorderRadius: string;
  setQcBorderRadius: Dispatch<SetStateAction<string>>;
  qcBorderRadiusUnit: string;
  setQcBorderRadiusUnit: Dispatch<SetStateAction<string>>;

  qcFontSize: string;
  setQcFontSize: Dispatch<SetStateAction<string>>;
  qcFontSizeUnit: string;
  setQcFontSizeUnit: Dispatch<SetStateAction<string>>;
  qcFontWeight: string;
  setQcFontWeight: Dispatch<SetStateAction<string>>;
  qcTextAlign: string;
  setQcTextAlign: Dispatch<SetStateAction<string>>;

  // Layout
  qcDisplay: string;
  setQcDisplay: Dispatch<SetStateAction<string>>;
  qcFlexDirection: string;
  setQcFlexDirection: Dispatch<SetStateAction<string>>;
  qcJustifyContent: string;
  setQcJustifyContent: Dispatch<SetStateAction<string>>;
  qcAlignItems: string;
  setQcAlignItems: Dispatch<SetStateAction<string>>;
  qcFlexWrap: string;
  setQcFlexWrap: Dispatch<SetStateAction<string>>;
  qcGap: string;
  setQcGap: Dispatch<SetStateAction<string>>;
  qcGapUnit: string;
  setQcGapUnit: Dispatch<SetStateAction<string>>;

  // Media query editing
  mqMinWidth: string;
  setMqMinWidth: Dispatch<SetStateAction<string>>;
  mqProp: string;
  setMqProp: Dispatch<SetStateAction<string>>;
  mqVal: string;
  setMqVal: Dispatch<SetStateAction<string>>;
  mqRules: Array<{
    id: string;
    label: string;
    min: number | null;
    prop: string;
    value: string;
  }>;
  onAddMqProp: (min: string, prop: string, value: string) => void;
  onDeleteMqProp: (id: string) => void;
}

const StyleEditorPanel: React.FC<StyleEditorPanelProps> = (props) => {
  if (!props.visible) return null;
  const tagLabel = props.styleTargetTag ? `- <${props.styleTargetTag}>` : "";
  const sidebar = props.mode === "sidebar";

  // (UI state moved into modular sections where needed)

  // Debounced applyInlineStyle per CSS property to avoid spamming updates on continuous inputs
  const latestApplyRef = useRef(props.applyInlineStyle);
  useEffect(() => {
    latestApplyRef.current = props.applyInlineStyle;
  }, [props.applyInlineStyle]);

  const debouncedTimersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );

  const debouncedApplyInlineStyle = useCallback(
    (prop: string, value: string, wait = 120) => {
      const map = debouncedTimersRef.current;
      const t = map.get(prop);
      if (t) clearTimeout(t);
      const newT = setTimeout(() => {
        latestApplyRef.current(prop, value);
        map.delete(prop);
      }, wait);
      map.set(prop, newT);
    },
    []
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      debouncedTimersRef.current.forEach((t) => clearTimeout(t));
      debouncedTimersRef.current.clear();
    };
  }, []);

  return (
    <div
      className={
        sidebar
          ? "w-80 md:w-96 h-full border-l border-white/10 bg-[#0e0e0e] text-gray-100 flex flex-col overflow-hidden"
          : "absolute inset-x-2 bottom-2 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[420px] md:w-[460px] max-h-[72vh] rounded-2xl border border-white/10 bg-[#101010]/95 backdrop-blur-xl shadow-2xl text-gray-100 flex flex-col overflow-hidden"
      }
    >
      <div className="flex items-center justify-between px-5 py-3 bg-[#0d0d0d] border-b border-white/10 text-white sticky top-0 z-10">
        <div className="text-sm font-semibold">Style editor {tagLabel}</div>
        <button
          className="text-white/80 hover:text-white text-lg leading-none rounded-md p-2 hover:bg-white/5 transition"
          onClick={props.onClose}
        >
          ×
        </button>
      </div>

      <div
        className={[
          "p-5 space-y-6 overflow-auto",
          sidebar ? "flex-1" : "",
        ].join(" ")}
      >
        <QuickEditSection
          qcText={props.qcText}
          setQcText={props.setQcText}
          applyQuickText={props.applyQuickText}
          qcColor={props.qcColor}
          setQcColor={props.setQcColor}
          qcBg={props.qcBg}
          setQcBg={props.setQcBg}
          qcBorderColor={props.qcBorderColor}
          setQcBorderColor={props.setQcBorderColor}
          applyInlineStyle={props.applyInlineStyle}
        />

        <LayoutSection
          qcDisplay={props.qcDisplay}
          setQcDisplay={props.setQcDisplay}
          qcFlexDirection={props.qcFlexDirection}
          setQcFlexDirection={props.setQcFlexDirection}
          qcJustifyContent={props.qcJustifyContent}
          setQcJustifyContent={props.setQcJustifyContent}
          qcAlignItems={props.qcAlignItems}
          setQcAlignItems={props.setQcAlignItems}
          qcFlexWrap={props.qcFlexWrap}
          setQcFlexWrap={props.setQcFlexWrap}
          applyInlineStyle={props.applyInlineStyle}
        />

        <SpacingSection
          qcGap={props.qcGap}
          setQcGap={props.setQcGap}
          debouncedApplyInlineStyle={debouncedApplyInlineStyle}
          qcPad={props.qcPad}
          setQcPad={props.setQcPad}
          applyInlineStyle={props.applyInlineStyle}
          qcMar={props.qcMar}
          setQcMar={props.setQcMar}
        />

        <SizeSection
          qcWidth={props.qcWidth}
          setQcWidth={props.setQcWidth}
          qcWidthUnit={props.qcWidthUnit}
          setQcWidthUnit={props.setQcWidthUnit}
          qcHeight={props.qcHeight}
          setQcHeight={props.setQcHeight}
          qcHeightUnit={props.qcHeightUnit}
          setQcHeightUnit={props.setQcHeightUnit}
          applyInlineStyle={props.applyInlineStyle}
          debouncedApplyInlineStyle={debouncedApplyInlineStyle}
        />

        <BorderSection
          qcBorderWidth={props.qcBorderWidth}
          setQcBorderWidth={props.setQcBorderWidth}
          qcBorderWidthUnit={props.qcBorderWidthUnit}
          setQcBorderWidthUnit={props.setQcBorderWidthUnit}
          qcBorderStyle={props.qcBorderStyle}
          setQcBorderStyle={props.setQcBorderStyle}
          qcBorderRadius={props.qcBorderRadius}
          setQcBorderRadius={props.setQcBorderRadius}
          qcBorderRadiusUnit={props.qcBorderRadiusUnit}
          setQcBorderRadiusUnit={props.setQcBorderRadiusUnit}
          applyInlineStyle={props.applyInlineStyle}
          debouncedApplyInlineStyle={debouncedApplyInlineStyle}
        />

        <TypographySection
          qcFontSize={props.qcFontSize}
          setQcFontSize={props.setQcFontSize}
          qcFontSizeUnit={props.qcFontSizeUnit}
          setQcFontSizeUnit={props.setQcFontSizeUnit}
          qcFontWeight={props.qcFontWeight}
          setQcFontWeight={props.setQcFontWeight}
          qcTextAlign={props.qcTextAlign}
          setQcTextAlign={props.setQcTextAlign}
          applyInlineStyle={props.applyInlineStyle}
          debouncedApplyInlineStyle={debouncedApplyInlineStyle}
        />

        <InlineStylesSection
          inlineStyles={props.inlineStyles}
          setInlineStyles={props.setInlineStyles}
          newProp={props.newProp}
          setNewProp={props.setNewProp}
          newVal={props.newVal}
          setNewVal={props.setNewVal}
          applyInlineStyle={props.applyInlineStyle}
        />

        <MediaQueriesSection
          mqMinWidth={props.mqMinWidth}
          setMqMinWidth={props.setMqMinWidth}
          mqProp={props.mqProp}
          setMqProp={props.setMqProp}
          mqVal={props.mqVal}
          setMqVal={props.setMqVal}
          mqRules={props.mqRules}
          onAddMqProp={props.onAddMqProp}
          onDeleteMqProp={props.onDeleteMqProp}
        />

        <ComputedStylesSection
          computedCollapsed={props.computedCollapsed}
          setComputedCollapsed={props.setComputedCollapsed}
          computedStyles={props.computedStyles}
        />
      </div>
    </div>
  );
};

export default React.memo(StyleEditorPanel);
