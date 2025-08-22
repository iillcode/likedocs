export interface KV { prop: string; value: string }

export const parseInline = (styleAttr: string | null): KV[] => {
  if (!styleAttr) return [];
  return styleAttr
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf(":");
      if (idx === -1) return { prop: pair.trim(), value: "" };
      return {
        prop: pair.slice(0, idx).trim(),
        value: pair.slice(idx + 1).trim(),
      };
    });
};

export const parseUnit = (val: string): { num: string; unit: string } => {
  const m = String(val || "").trim().match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  return { num: m ? m[1] : "", unit: m && m[2] ? m[2] : "px" };
};

export const rgbToHex = (input: string): string => {
  const s = input.trim();
  const rgba = s.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)$/i);
  if (!rgba) return "";
  const r = Math.max(0, Math.min(255, parseInt(rgba[1], 10)));
  const g = Math.max(0, Math.min(255, parseInt(rgba[2], 10)));
  const b = Math.max(0, Math.min(255, parseInt(rgba[3], 10)));
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const getComputed = (el: HTMLElement, prop: string): string => {
  const comp = el.ownerDocument?.defaultView?.getComputedStyle(el);
  return comp?.getPropertyValue(prop) || "";
};
