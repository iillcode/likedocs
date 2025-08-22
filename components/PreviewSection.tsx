"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import StyleEditorPanel from "./StyleEditorPanel";
import { parseInline, parseUnit, rgbToHex, getComputed } from "../utils/styleUtils";

interface PreviewSectionProps {
  htmlCode: string;
  onBackToEditor: () => void;
  onCodeUpdate: (newCode: string) => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  htmlCode,
  onBackToEditor,
  onCodeUpdate,
}) => {
  const [sanitizedHTML, setSanitizedHTML] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingElement, setEditingElement] = useState<HTMLElement | null>(
    null
  );
  const [originalHTML, setOriginalHTML] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentHtml, setCurrentHtml] = useState(htmlCode);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Style panel state
  const [stylePanelVisible, setStylePanelVisible] = useState(false);
  const styleTargetRef = useRef<HTMLElement | null>(null);
  const [inlineStyles, setInlineStyles] = useState<
    Array<{ prop: string; value: string }>
  >([]);
  const [computedStyles, setComputedStyles] = useState<
    Array<{ prop: string; value: string }>
  >([]);
  const [computedCollapsed, setComputedCollapsed] = useState(true);
  const [newProp, setNewProp] = useState("");
  const [newVal, setNewVal] = useState("");
  const updateTimerRef = useRef<number | null>(null);
  const prevOutlineRef = useRef<
    WeakMap<HTMLElement, { outline?: string; outlineOffset?: string }>
  >(new WeakMap());
  // Overlay highlights
  const hoverOverlayRef = useRef<HTMLDivElement | null>(null);
  const selectOverlayRef = useRef<HTMLDivElement | null>(null);
  // Quick controls state
  const [qcColor, setQcColor] = useState<string>("");
  const [qcBg, setQcBg] = useState<string>("");
  const [qcBorderColor, setQcBorderColor] = useState<string>("");
  const [qcWidth, setQcWidth] = useState<string>("");
  const [qcWidthUnit, setQcWidthUnit] = useState<string>("px");
  const [qcHeight, setQcHeight] = useState<string>("");
  const [qcHeightUnit, setQcHeightUnit] = useState<string>("px");
  const [qcPad, setQcPad] = useState<{ t: string; r: string; b: string; l: string }>({
    t: "",
    r: "",
    b: "",
    l: "",
  });
  const [qcMar, setQcMar] = useState<{ t: string; r: string; b: string; l: string }>({
    t: "",
    r: "",
    b: "",
    l: "",
  });
  const [qcBorderWidth, setQcBorderWidth] = useState<string>("");
  const [qcBorderWidthUnit, setQcBorderWidthUnit] = useState<string>("px");
  const [qcBorderStyle, setQcBorderStyle] = useState<string>("none");
  const [qcBorderRadius, setQcBorderRadius] = useState<string>("");
  const [qcBorderRadiusUnit, setQcBorderRadiusUnit] = useState<string>("px");
  const [qcFontSize, setQcFontSize] = useState<string>("");
  const [qcFontSizeUnit, setQcFontSizeUnit] = useState<string>("px");
  const [qcFontWeight, setQcFontWeight] = useState<string>("");
  const [qcTextAlign, setQcTextAlign] = useState<string>("");
  // Layout
  const [qcDisplay, setQcDisplay] = useState<string>("");
  const [qcFlexDirection, setQcFlexDirection] = useState<string>("");
  const [qcJustifyContent, setQcJustifyContent] = useState<string>("");
  const [qcAlignItems, setQcAlignItems] = useState<string>("");
  const [qcFlexWrap, setQcFlexWrap] = useState<string>("");
  const [qcGap, setQcGap] = useState<string>("");
  const [qcGapUnit, setQcGapUnit] = useState<string>("px");
  // Quick text edit
  const [qcText, setQcText] = useState<string>("");
  const quickTextTargetRef = useRef<HTMLElement | null>(null);
  // Prevent iframe reload on internal updates
  const internalUpdateRef = useRef<boolean>(false);

  useEffect(() => {
    // Sanitize while allowing full-document HTML and scripts/styles for previewing user content
    const sanitized = DOMPurify.sanitize(htmlCode, {
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ["style", "script"],
      ADD_ATTR: [
        "style",
        // Common inline events to support interactive HTML
        "onclick",
        "onload",
        "oninput",
        "onchange",
        "onsubmit",
        "onreset",
        "onfocus",
        "onblur",
        "onkeydown",
        "onkeyup",
        "onkeypress",
        "onmouseover",
        "onmouseout",
        "onmouseenter",
        "onmouseleave",
        "onerror",
      ],
      ALLOW_DATA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: true,
    });
    // If the change originated from internal editing, don't reload the iframe.
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      setCurrentHtml(sanitized);
      return;
    }
    // External code change: clear selection to avoid stale refs
    clearSelection();
    setSanitizedHTML(sanitized);
    setCurrentHtml(sanitized);
  }, [htmlCode]);

  useEffect(() => {
    if (iframeRef.current && sanitizedHTML) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(sanitizedHTML);
        iframeDoc.close();

        // Add editing functionality after the content loads
        setTimeout(() => {
          addEditingListeners(iframeDoc);
        }, 100);
      }
    }
  }, [sanitizedHTML]);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearSelection();
      }
    };
    document.addEventListener("keydown", escHandler, true);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("keydown", escHandler, true);
    };
  }, []);

  // Helpers for style panel

  const scheduleUpdateHtml = () => {
    if (updateTimerRef.current) {
      window.clearTimeout(updateTimerRef.current);
    }
    updateTimerRef.current = window.setTimeout(() => {
      updateHtmlCode();
    }, 400) as unknown as number;
  };

  const refreshComputedStyles = (el: HTMLElement) => {
    const view = el.ownerDocument?.defaultView;
    const comp = view?.getComputedStyle(el);
    if (!comp) {
      setComputedStyles([]);
      return;
    }
    const props = Array.from(comp);
    const list = props.map((p) => ({
      prop: p,
      value: comp.getPropertyValue(p),
    }));
    setComputedStyles(list);
  };

  const openStylePanelFor = (el: HTMLElement) => {
    styleTargetRef.current = el;
    setInlineStyles(parseInline(el.getAttribute("style")));
    refreshComputedStyles(el);
    setStylePanelVisible(true);
    // Show selection overlay
    const doc = el.ownerDocument as Document;
    ensureOverlays(doc);
    positionOverlay(el, selectOverlayRef.current!, "#3b82f6");
    // Initialize quick controls
    initQuickControls(el);
  };

  const applyInlineStyle = (prop: string, value: string) => {
    const el = styleTargetRef.current;
    if (!el) return;
    if (!prop) return;
    if (value === "") {
      el.style.removeProperty(prop);
    } else {
      try {
        el.style.setProperty(prop, value);
      } catch {}
    }
    // update local inline style state from element.style for normalization
    const styleText = el.getAttribute("style");
    setInlineStyles(parseInline(styleText));
    refreshComputedStyles(el);
    scheduleUpdateHtml();
    // keep selection overlay in sync with size changes
    repositionSelectedOverlay();
  };

  // ========= Overlay helpers =========
  const ensureOverlays = (doc: Document) => {
    const body = doc.body;
    if (!hoverOverlayRef.current) {
      const hov = doc.createElement("div");
      hov.style.position = "absolute";
      hov.style.pointerEvents = "none";
      hov.style.zIndex = "2147483645";
      hov.style.border = "2px solid rgba(255,255,255,0.6)";
      hov.style.borderRadius = "2px";
      hov.style.display = "none";
      body.appendChild(hov);
      hoverOverlayRef.current = hov;
    }
    if (!selectOverlayRef.current) {
      const sel = doc.createElement("div");
      sel.style.position = "absolute";
      sel.style.pointerEvents = "none";
      sel.style.zIndex = "2147483646";
      sel.style.border = "2px solid #3b82f6";
      sel.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.25)";
      sel.style.borderRadius = "2px";
      sel.style.display = "none";
      body.appendChild(sel);
      selectOverlayRef.current = sel;
    }
  };

  const positionOverlay = (el: HTMLElement, overlay: HTMLDivElement, color?: string) => {
    const rect = el.getBoundingClientRect();
    const doc = el.ownerDocument as Document;
    const win = doc.defaultView as Window;
    overlay.style.display = "block";
    overlay.style.left = `${Math.max(0, rect.left + (win?.scrollX || 0))}px`;
    overlay.style.top = `${Math.max(0, rect.top + (win?.scrollY || 0))}px`;
    overlay.style.width = `${Math.max(0, rect.width)}px`;
    overlay.style.height = `${Math.max(0, rect.height)}px`;
    if (color) overlay.style.borderColor = color;
  };

  const hideOverlay = (overlay: HTMLDivElement | null) => {
    if (!overlay) return;
    overlay.style.display = "none";
  };

  const repositionSelectedOverlay = () => {
    const el = styleTargetRef.current;
    const overlay = selectOverlayRef.current;
    if (el && overlay) positionOverlay(el, overlay);
  };

  const clearSelection = () => {
    styleTargetRef.current = null;
    setStylePanelVisible(false);
    hideOverlay(selectOverlayRef.current);
    hideOverlay(hoverOverlayRef.current);
  };

  // ========= Quick controls helpers =========
  // (moved getters and parsers to utils/styleUtils)

  const initQuickControls = (el: HTMLElement) => {
    // Colors
    setQcColor(rgbToHex(getComputed(el, "color")) || "");
    setQcBg(rgbToHex(getComputed(el, "background-color")) || "");
    setQcBorderColor(rgbToHex(getComputed(el, "border-top-color")) || "");
    // Size
    const { num: wNum, unit: wUnit } = parseUnit(getComputed(el, "width"));
    const { num: hNum, unit: hUnit } = parseUnit(getComputed(el, "height"));
    setQcWidth(wNum); setQcWidthUnit(wUnit);
    setQcHeight(hNum); setQcHeightUnit(hUnit);
    // Spacing
    setQcPad({
      t: parseUnit(getComputed(el, "padding-top")).num,
      r: parseUnit(getComputed(el, "padding-right")).num,
      b: parseUnit(getComputed(el, "padding-bottom")).num,
      l: parseUnit(getComputed(el, "padding-left")).num,
    });
    setQcMar({
      t: parseUnit(getComputed(el, "margin-top")).num,
      r: parseUnit(getComputed(el, "margin-right")).num,
      b: parseUnit(getComputed(el, "margin-bottom")).num,
      l: parseUnit(getComputed(el, "margin-left")).num,
    });
    // Border
    setQcBorderWidth(parseUnit(getComputed(el, "border-top-width")).num);
    setQcBorderWidthUnit(parseUnit(getComputed(el, "border-top-width")).unit);
    setQcBorderStyle(getComputed(el, "border-top-style") || "none");
    setQcBorderRadius(parseUnit(getComputed(el, "border-top-left-radius")).num);
    setQcBorderRadiusUnit(parseUnit(getComputed(el, "border-top-left-radius")).unit);
    // Typography
    setQcFontSize(parseUnit(getComputed(el, "font-size")).num);
    setQcFontSizeUnit(parseUnit(getComputed(el, "font-size")).unit);
    setQcFontWeight(getComputed(el, "font-weight") || "");
    setQcTextAlign(getComputed(el, "text-align") || "");
    // Layout
    setQcDisplay(getComputed(el, "display") || "");
    setQcFlexDirection(getComputed(el, "flex-direction") || "");
    setQcJustifyContent(getComputed(el, "justify-content") || "");
    setQcAlignItems(getComputed(el, "align-items") || "");
    setQcFlexWrap(getComputed(el, "flex-wrap") || "");
    setQcGap(parseUnit(getComputed(el, "gap")).num);
    setQcGapUnit(parseUnit(getComputed(el, "gap")).unit || "px");
    // Text content target
    const doc = el.ownerDocument || document;
    const findLeaf = (root: HTMLElement): HTMLElement | null => {
      if (root.children.length === 0 && (root.textContent?.trim() || "")) {
        return root;
      }
      for (const child of Array.from(root.children)) {
        const result = findLeaf(child as HTMLElement);
        if (result) return result;
      }
      for (const node of Array.from(root.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE && (node.textContent?.trim() || "")) {
          const span = (doc as Document).createElement("span");
          span.textContent = node.textContent || "";
          root.replaceChild(span, node);
          return span;
        }
      }
      return null;
    };
    const buttonAncestor = el.closest("button") as HTMLElement | null;
    let target: HTMLElement | null = el;
    if (buttonAncestor) {
      // prefer a text leaf inside button
      if (target === buttonAncestor || target.children.length > 0) {
        const leaf = findLeaf(buttonAncestor);
        if (leaf) target = leaf;
      }
    } else if (target && target.children.length > 0) {
      const leaf = findLeaf(target);
      if (leaf) target = leaf;
    }
    quickTextTargetRef.current = target || null;
    setQcText((target?.textContent || "").trim());
  };

  const applyQuickText = (text: string) => {
    const tgt = quickTextTargetRef.current || styleTargetRef.current;
    if (!tgt) return;
    try {
      tgt.textContent = text;
    } catch {}
    scheduleUpdateHtml();
    repositionSelectedOverlay();
  };

  const addEditingListeners = (doc: Document) => {
    // Avoid duplicate listeners on re-render
    if ((doc as any)._likedocsListenersAdded) return;
    (doc as any)._likedocsListenersAdded = true;
    // Add click listeners to text elements for editing
    const textElements = doc.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, div, a, li, td, th, button"
    );

    textElements.forEach((element) => {
      const htmlElement = element as HTMLElement;

      const isButton = htmlElement.tagName.toLowerCase() === "button";
      const isInsideButton = !!htmlElement.closest("button");
      // Allow buttons even if they contain child elements; otherwise only elements without element children
      if (
        (isButton || isInsideButton || htmlElement.children.length === 0) &&
        htmlElement.textContent?.trim()
      ) {
        // Pointer cursor hint only; visual highlight via overlays
        if (!isButton && !isInsideButton) {
          htmlElement.style.cursor = "pointer";
        }

        // For button contexts, intercept pointerdown early to avoid default active/focus effects
        if (isButton || isInsideButton) {
          htmlElement.addEventListener(
            "pointerdown",
            (e) => {
              e.preventDefault();
              e.stopPropagation();
              // Do not start editing on pointerdown; selection handled by click, text by dblclick
            },
            { capture: true } as AddEventListenerOptions
          );
        }

        htmlElement.addEventListener(
          "dblclick",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Avoid contentEditable on buttons; open style panel instead
            if (isButton || isInsideButton) {
              openStylePanelFor(htmlElement);
            } else {
              startEditing(htmlElement);
            }
          },
          { capture: true } as AddEventListenerOptions
        );
      }
    });

    // Create overlays and global listeners for hover/select across ALL elements
    ensureOverlays(doc);
    const win = doc.defaultView!;
    const onMouseOver = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t || !(t instanceof win.HTMLElement)) return;
      if (selectOverlayRef.current && styleTargetRef.current === t) return; // selected has its own overlay
      positionOverlay(t, hoverOverlayRef.current!);
    };
    const onMouseOut = () => hideOverlay(hoverOverlayRef.current);
    const onClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.target as HTMLElement;
      if (!t || !(t instanceof win.HTMLElement)) return;
      // Click on document root or body clears selection
      if (t === doc.documentElement || t === doc.body) {
        clearSelection();
        return;
      }
      // Toggle off when clicking the same selected element
      if (styleTargetRef.current === t) {
        clearSelection();
        return;
      }
      openStylePanelFor(t);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearSelection();
      }
    };
    const onScroll = () => repositionSelectedOverlay();
    const onResize = () => repositionSelectedOverlay();
    doc.addEventListener("mouseover", onMouseOver, true);
    doc.addEventListener("mouseout", onMouseOut, true);
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("keydown", onKeyDown as any, true);
    win.addEventListener("scroll", onScroll, true);
    win.addEventListener("resize", onResize, true);
  };

  // Hide selection overlay when panel closes
  useEffect(() => {
    if (!stylePanelVisible) hideOverlay(selectOverlayRef.current);
  }, [stylePanelVisible]);

  const startEditing = (element: HTMLElement) => {
    if (isEditing) return;

    setIsEditing(true);
    setEditingElement(element);
    const doc = element.ownerDocument || document;
    const buttonAncestor = element.closest("button") as HTMLElement | null;
    const isButtonContext =
      element.tagName.toLowerCase() === "button" || !!buttonAncestor;

    // Choose the most text-focused target element to edit
    let targetEl: HTMLElement = element;
    const findLeaf = (root: HTMLElement): HTMLElement | null => {
      if (root.children.length === 0 && (root.textContent?.trim() || "")) {
        return root;
      }
      for (const child of Array.from(root.children)) {
        const result = findLeaf(child as HTMLElement);
        if (result) return result;
      }
      // If no element-only leaf found, wrap a text node
      for (const node of Array.from(root.childNodes)) {
        if (
          node.nodeType === Node.TEXT_NODE &&
          (node.textContent?.trim() || "")
        ) {
          const span = doc.createElement("span");
          span.textContent = node.textContent || "";
          root.replaceChild(span, node);
          return span;
        }
      }
      return null;
    };

    if (buttonAncestor) {
      if (targetEl === buttonAncestor) {
        const leaf = findLeaf(buttonAncestor);
        if (leaf) targetEl = leaf;
      } else if (targetEl.children.length > 0) {
        const leaf = findLeaf(targetEl);
        if (leaf) targetEl = leaf;
      }
    }

    setOriginalHTML(targetEl.innerHTML);

    // Inline editing on the selected target only
    targetEl.setAttribute("contenteditable", "plaintext-only");
    // Keep visual styles unchanged for buttons; only show helper outline for non-button context
    if (!isButtonContext) {
      targetEl.style.outline = "2px solid #3b82f6";
      targetEl.style.backgroundColor = "rgba(59, 130, 246, 0.08)";
    }

    // Focus and place caret at end of target
    targetEl.focus();
    // Ensure button wrapper loses focus to keep its styles unchanged
    if (buttonAncestor) {
      try {
        (buttonAncestor as HTMLElement).blur();
      } catch {}
    }
    const range = doc.createRange();
    range.selectNodeContents(targetEl);
    range.collapse(false);
    const sel = doc.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    };

    const cleanup = () => {
      targetEl.removeEventListener("keydown", keyHandler);
      targetEl.removeAttribute("contenteditable");
      targetEl.style.outline = "";
      targetEl.style.backgroundColor = "";
      setIsEditing(false);
      setEditingElement(null);
    };

    const saveEdit = () => {
      cleanup();
      updateHtmlCode();
      clearSelection();
    };

    const cancelEdit = () => {
      targetEl.innerHTML = originalHTML;
      cleanup();
      clearSelection();
    };

    targetEl.addEventListener("keydown", keyHandler);
    targetEl.addEventListener("blur", saveEdit, {
      once: true,
    } as AddEventListenerOptions);
  };

  const updateHtmlCode = () => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        const updatedHtml = iframeDoc.documentElement.outerHTML;
        setCurrentHtml(updatedHtml);
        // mark as internal so htmlCode effect does not force a reload
        internalUpdateRef.current = true;
        onCodeUpdate(updatedHtml);
      }
    }
  };

  const handleExport = () => {
    const blob = new Blob([currentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      // no-op
    }
  };

  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-gray-950">
      {/* Full-screen preview layer */}
      {sanitizedHTML ? (
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full border-0 bg-white"
          title="Portfolio Preview"
          sandbox="allow-scripts allow-popups allow-forms allow-modals allow-pointer-lock allow-downloads allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox allow-same-origin"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl">No content to preview</p>
            <p className="text-sm mt-2">Go back to editor and add some HTML code</p>
          </div>
        </div>
      )}

      {/* Style Editor Panel */}
      <StyleEditorPanel
        visible={stylePanelVisible}
        onClose={clearSelection}
        styleTargetTag={styleTargetRef.current?.tagName.toLowerCase()}

        inlineStyles={inlineStyles}
        setInlineStyles={setInlineStyles}
        applyInlineStyle={applyInlineStyle}
        newProp={newProp}
        setNewProp={setNewProp}
        newVal={newVal}
        setNewVal={setNewVal}

        computedCollapsed={computedCollapsed}
        setComputedCollapsed={setComputedCollapsed}
        computedStyles={computedStyles}

        qcText={qcText}
        setQcText={setQcText}
        applyQuickText={applyQuickText}

        qcColor={qcColor} setQcColor={setQcColor}
        qcBg={qcBg} setQcBg={setQcBg}
        qcBorderColor={qcBorderColor} setQcBorderColor={setQcBorderColor}

        qcWidth={qcWidth} setQcWidth={setQcWidth}
        qcWidthUnit={qcWidthUnit} setQcWidthUnit={setQcWidthUnit}
        qcHeight={qcHeight} setQcHeight={setQcHeight}
        qcHeightUnit={qcHeightUnit} setQcHeightUnit={setQcHeightUnit}

        qcPad={qcPad} setQcPad={setQcPad}
        qcMar={qcMar} setQcMar={setQcMar}

        qcBorderWidth={qcBorderWidth} setQcBorderWidth={setQcBorderWidth}
        qcBorderWidthUnit={qcBorderWidthUnit} setQcBorderWidthUnit={setQcBorderWidthUnit}
        qcBorderStyle={qcBorderStyle} setQcBorderStyle={setQcBorderStyle}
        qcBorderRadius={qcBorderRadius} setQcBorderRadius={setQcBorderRadius}
        qcBorderRadiusUnit={qcBorderRadiusUnit} setQcBorderRadiusUnit={setQcBorderRadiusUnit}

        qcFontSize={qcFontSize} setQcFontSize={setQcFontSize}
        qcFontSizeUnit={qcFontSizeUnit} setQcFontSizeUnit={setQcFontSizeUnit}
        qcFontWeight={qcFontWeight} setQcFontWeight={setQcFontWeight}
        qcTextAlign={qcTextAlign} setQcTextAlign={setQcTextAlign}

        qcDisplay={qcDisplay} setQcDisplay={setQcDisplay}
        qcFlexDirection={qcFlexDirection} setQcFlexDirection={setQcFlexDirection}
        qcJustifyContent={qcJustifyContent} setQcJustifyContent={setQcJustifyContent}
        qcAlignItems={qcAlignItems} setQcAlignItems={setQcAlignItems}
        qcFlexWrap={qcFlexWrap} setQcFlexWrap={setQcFlexWrap}
        qcGap={qcGap} setQcGap={setQcGap}
        qcGapUnit={qcGapUnit} setQcGapUnit={setQcGapUnit}
      />
    </div>
  );
};

export default PreviewSection;
