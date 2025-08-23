"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import StyleEditorPanel from "./StyleEditorPanel";
import DomTree from "./DomTree";
import {
  parseInline,
  parseUnit,
  rgbToHex,
  getComputed,
} from "../utils/styleUtils";

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
  // Tree node type for DOM tree sidebar
  type DomTreeNode = {
    key: string;
    label: string;
    el: HTMLElement;
    children: DomTreeNode[];
  };

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
  // Canvas workspace (pan/zoom) refs
  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<number>(1);
  const translateRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const isPanningRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // DOM tree state
  const [domTree, setDomTree] = useState<DomTreeNode | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
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
  // Track last hover pointer position inside iframe and a RO for selected element
  const lastHoverPosRef = useRef<{ x: number; y: number } | null>(null);
  const selectedRORef = useRef<any>(null);
  const selectedScrollCleanupsRef = useRef<Array<() => void>>([]);
  // Quick controls state
  const [qcColor, setQcColor] = useState<string>("");
  const [qcBg, setQcBg] = useState<string>("");
  const [qcBorderColor, setQcBorderColor] = useState<string>("");
  const [qcWidth, setQcWidth] = useState<string>("");
  const [qcWidthUnit, setQcWidthUnit] = useState<string>("px");
  const [qcHeight, setQcHeight] = useState<string>("");
  const [qcHeightUnit, setQcHeightUnit] = useState<string>("px");
  const [qcPad, setQcPad] = useState<{
    t: string;
    r: string;
    b: string;
    l: string;
  }>({
    t: "",
    r: "",
    b: "",
    l: "",
  });
  const [qcMar, setQcMar] = useState<{
    t: string;
    r: string;
    b: string;
    l: string;
  }>({
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
  // Insert modal state
  const [insertModalOpen, setInsertModalOpen] = useState(false);
  const insertParentRef = useRef<HTMLElement | null>(null);
  const tagOptions = [
    "div",
    "p",
    "span",
    "h1",
    "h2",
    "h3",
    "button",
    "a",
    "img",
    "ul",
    "ol",
    "li",
    "section",
    "header",
    "footer",
    "nav",
    "main",
    "article",
    "aside",
    "input",
    "textarea",
  ];
  // Prevent iframe reload on internal updates
  const internalUpdateRef = useRef<boolean>(false);
  // Context menu state for tree right-click
  const [ctxMenuOpen, setCtxMenuOpen] = useState(false);
  const [ctxMenuPos, setCtxMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const ctxTargetRef = useRef<HTMLElement | null>(null);
  // Drag & drop (tree) state
  const dragSourceRef = useRef<HTMLElement | null>(null);
  // Undo/Redo stacks (store full HTML snapshots)
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  // For inline editing: snapshot taken at edit start, only committed on save
  const pendingEditSnapshotRef = useRef<string | null>(null);
  // Observe DOM/text changes in preview to refresh tree labels
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const observerTimerRef = useRef<number | null>(null);

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

  // ======== Canvas pan/zoom handlers (outside iframe only) ========
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;

    const applyTransform = () => {
      if (!canvasRef.current) return;
      const { x, y } = translateRef.current;
      const s = scaleRef.current;
      canvasRef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      // Keep selection overlay aligned after any transform
      try {
        repositionSelectedOverlay();
      } catch {}
    };

    const isInsideFrame = (clientX: number, clientY: number) => {
      const el = frameRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    };

    const onWheel = (e: WheelEvent) => {
      // Only act if pointer is outside the preview frame
      if (isInsideFrame(e.clientX, e.clientY)) return;
      // Prevent page scroll
      e.preventDefault();
      // Trackpads: pinch-zoom often sets ctrlKey; deltaY sign controls zoom direction
      const zooming = e.ctrlKey || (e as any).metaKey;
      if (zooming) {
        const old = scaleRef.current;
        const factor = Math.exp((-e.deltaY || 0) * 0.0015);
        let next = Math.min(4, Math.max(0.2, old * factor));
        scaleRef.current = next;
      } else {
        // Two-finger scroll pans the canvas
        translateRef.current = {
          x: translateRef.current.x - (e.deltaX || 0),
          y: translateRef.current.y - (e.deltaY || 0),
        };
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyTransform);
    };

    const onPointerDown = (e: PointerEvent) => {
      // Start panning only when the pointer is in canvas background area (not over the frame)
      if (isInsideFrame(e.clientX, e.clientY)) return;
      isPanningRef.current = true;
      lastPointRef.current = { x: e.clientX, y: e.clientY };
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      // If pointer enters the preview frame mid-drag, stop panning (gate interactions)
      if (isInsideFrame(e.clientX, e.clientY)) {
        isPanningRef.current = false;
        try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
        return;
      }
      const dx = e.clientX - lastPointRef.current.x;
      const dy = e.clientY - lastPointRef.current.y;
      lastPointRef.current = { x: e.clientX, y: e.clientY };
      translateRef.current = {
        x: translateRef.current.x + dx,
        y: translateRef.current.y + dy,
      };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyTransform);
    };
    const onPointerUp = (e: PointerEvent) => {
      isPanningRef.current = false;
      try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
    };

    // Initialize transform (center-ish)
    try {
      const rect = ws.getBoundingClientRect();
      translateRef.current = { x: rect.width * 0.5 - 600, y: rect.height * 0.5 - 400 };
      scaleRef.current = 0.9;
      if (canvasRef.current) {
        canvasRef.current.style.transformOrigin = "0 0";
        canvasRef.current.style.willChange = "transform";
      }
      requestAnimationFrame(applyTransform);
    } catch {}

    ws.addEventListener("wheel", onWheel, { passive: false } as AddEventListenerOptions);
    ws.addEventListener("pointerdown", onPointerDown as any, true);
    window.addEventListener("pointermove", onPointerMove as any, true);
    window.addEventListener("pointerup", onPointerUp as any, true);
    return () => {
      ws.removeEventListener("wheel", onWheel as any, true as any);
      ws.removeEventListener("pointerdown", onPointerDown as any, true);
      window.removeEventListener("pointermove", onPointerMove as any, true);
      window.removeEventListener("pointerup", onPointerUp as any, true);
    };
  }, []);

  useEffect(() => {
    if (iframeRef.current && sanitizedHTML) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Disconnect any prior observer before reloading the iframe document
        try {
          mutationObserverRef.current?.disconnect();
          mutationObserverRef.current = null;
        } catch {}
        iframeDoc.open();
        iframeDoc.write(sanitizedHTML);
        iframeDoc.close();

        // Add editing functionality after the content loads
        setTimeout(() => {
          addEditingListeners(iframeDoc);
          // Build initial DOM tree for sidebar
          try {
            refreshDomTreeFromDoc(iframeDoc);
          } catch {}
          // Install a mutation observer to update the DOM tree when content changes
          try {
            const win = iframeDoc.defaultView as Window;
            const MutationObs = (win as any).MutationObserver || MutationObserver;
            const observer = new MutationObs((mutations: MutationRecord[]) => {
              // Skip pure overlay mutations, but respond when at least one non-overlay mutation exists
              const hasNonOverlayMutation = mutations.some((m) => {
                const node = m.target as Node;
                const el = (node.nodeType === Node.TEXT_NODE
                  ? (node.parentElement as HTMLElement | null)
                  : (node as HTMLElement | null));
                if (!el) return true; // treat unknown as real change
                const isOverlay =
                  el.hasAttribute?.("data-likedocs-overlay") ||
                  el.classList?.contains("likedocs-overlay");
                return !isOverlay;
              });
              if (!hasNonOverlayMutation) return;
              // Debounce refreshes
              if (observerTimerRef.current) {
                window.clearTimeout(observerTimerRef.current);
              }
              observerTimerRef.current = window.setTimeout(() => {
                try {
                  refreshDomTreeFromDoc(iframeDoc);
                } catch {}
              }, 120) as unknown as number;
            });
            observer.observe(iframeDoc.body || iframeDoc.documentElement, {
              subtree: true,
              childList: true,
              characterData: true,
              attributes: false,
            });
            mutationObserverRef.current = observer;
          } catch {}
        }, 100);
      }
    }
  }, [sanitizedHTML]);

  // Helpers for delete/clear inline styles
  const deleteElementAndRefresh = (el: HTMLElement | null) => {
    if (!el) return;
    const tag = el.tagName.toLowerCase();
    if (tag === "html" || tag === "body") return;
    const doc = (el.ownerDocument || document) as Document;
    // snapshot before mutation
    try {
      undoStackRef.current.push(doc.documentElement.outerHTML);
      redoStackRef.current = [];
    } catch {}
    try {
      el.parentElement?.removeChild(el);
    } catch {}
    if (styleTargetRef.current === el) clearSelection();
    scheduleUpdateHtml();
    refreshDomTreeFromDoc(doc);
  };

  const clearInlineStylesOn = (el: HTMLElement | null) => {
    if (!el) return;
    const doc = (el.ownerDocument || document) as Document;
    try {
      undoStackRef.current.push(doc.documentElement.outerHTML);
      redoStackRef.current = [];
    } catch {}
    el.removeAttribute("style");
    if (styleTargetRef.current === el) {
      setInlineStyles(parseInline(el.getAttribute("style")));
      refreshComputedStyles(el);
    }
    scheduleUpdateHtml();
  };

  const openContextMenu = (el: HTMLElement, x: number, y: number) => {
    ctxTargetRef.current = el;
    setCtxMenuPos({ x, y });
    setCtxMenuOpen(true);
  };
  const closeContextMenu = () => setCtxMenuOpen(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearSelection();
      } else if (e.key === "Delete") {
        e.preventDefault();
        deleteElementAndRefresh(styleTargetRef.current);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          performRedo();
        } else {
          performUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        performRedo();
      }
    };
    document.addEventListener("keydown", keyHandler, true);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("keydown", keyHandler, true);
    };
  }, []);

  // Helpers for style panel

  // ======== DOM tree helpers ========
  const elementLabel = (el: Element) => {
    // Show only tag name as requested
    const tag = el.tagName.toLowerCase();
    return tag;
  };

  const buildTreeFromElement = (el: Element, keyPath: string): DomTreeNode => {
    const children: DomTreeNode[] = [];
    let idx = 0;
    const excluded = new Set(["script", "style", "title"]);
    for (const child of Array.from(el.children)) {
      const childEl = child as HTMLElement;
      const tag = childEl.tagName.toLowerCase();
      if (excluded.has(tag)) continue;
      // Skip internal overlays used for hover/selection highlighting
      if (
        childEl.hasAttribute("data-likedocs-overlay") ||
        childEl.classList.contains("likedocs-overlay")
      ) {
        continue;
      }
      const childKey = `${keyPath}/${tag}[${idx}]`;
      children.push(buildTreeFromElement(childEl as Element, childKey));
      idx++;
    }
    return {
      key: keyPath,
      label: elementLabel(el),
      el: el as HTMLElement,
      children,
    };
  };

  const refreshDomTreeFromDoc = (doc: Document) => {
    const root = (doc.body || doc.documentElement) as HTMLElement;
    const rootKey =
      root.tagName.toLowerCase() === "body" ? "body[0]" : "html[0]";
    const tree = buildTreeFromElement(root, rootKey);
    setDomTree(tree);
    // Expand root and its immediate children only on first build
    setExpandedKeys((prev) => {
      if (prev.size > 0) return prev;
      const initial = new Set<string>([
        tree.key,
        ...tree.children.map((c) => c.key),
      ]);
      return initial;
    });
  };

  const openInsertModal = (parentEl: HTMLElement) => {
    insertParentRef.current = parentEl;
    setInsertModalOpen(true);
  };

  const closeInsertModal = () => setInsertModalOpen(false);

  const insertTagIntoParent = (tag: string) => {
    const parent = insertParentRef.current;
    if (!parent) return;
    const doc = (parent.ownerDocument || document) as Document;
    try {
      // snapshot before mutation
      try {
        undoStackRef.current.push(doc.documentElement.outerHTML);
        redoStackRef.current = [];
      } catch {}
      const el = doc.createElement(tag);
      switch (tag) {
        case "img":
          el.setAttribute("src", "https://via.placeholder.com/150");
          el.setAttribute("alt", "image");
          (el as HTMLElement).style.display = "block";
          (el as HTMLElement).style.width = "150px";
          (el as HTMLElement).style.height = "150px";
          break;
        case "a":
          (el as HTMLElement).textContent = "Link";
          (el as HTMLAnchorElement).href = "#";
          break;
        case "button":
          (el as HTMLElement).textContent = "Button";
          break;
        case "ul":
        case "ol": {
          const li = doc.createElement("li");
          li.textContent = "Item";
          el.appendChild(li);
          break;
        }
        case "input":
          (el as HTMLInputElement).type = "text";
          (el as HTMLInputElement).placeholder = "input";
          break;
        case "textarea":
          (el as HTMLTextAreaElement).placeholder = "textarea";
          break;
        default: {
          const headings = ["h1", "h2", "h3", "h4", "h5", "h6"];
          if (headings.includes(tag)) {
            (el as HTMLElement).textContent = `${tag.toUpperCase()} heading`;
          } else if (
            [
              "p",
              "span",
              "div",
              "li",
              "section",
              "header",
              "footer",
              "nav",
              "main",
              "article",
              "aside",
            ].includes(tag)
          ) {
            (el as HTMLElement).textContent = `New ${tag}`;
          }
        }
      }
      parent.appendChild(el);
      // Update code and tree while preserving expansion
      scheduleUpdateHtml();
      refreshDomTreeFromDoc(doc);
    } catch {}
    setInsertModalOpen(false);
  };

  // ======== Drag & Drop handlers for DOM tree ========
  const handleTreeDragStart = (el: HTMLElement) => {
    dragSourceRef.current = el;
  };

  const handleTreeDragEnd = () => {
    dragSourceRef.current = null;
  };

  const handleTreeDropOn = (
    targetEl: HTMLElement,
    position: "before" | "after"
  ) => {
    const src = dragSourceRef.current;
    if (!src) return;
    // Disallow no-op or illegal moves
    if (src === targetEl) {
      dragSourceRef.current = null;
      return;
    }
    const srcTag = src.tagName.toLowerCase();
    if (srcTag === "html" || srcTag === "body") {
      dragSourceRef.current = null;
      return;
    }
    // Must be sibling-only reordering
    const parentA = src.parentElement;
    const parentB = targetEl.parentElement;
    if (!parentA || parentA !== parentB) {
      dragSourceRef.current = null;
      return;
    }
    // Prevent moving a parent into its own descendant (shouldn't happen for siblings, but safe-guard)
    if (src.contains(targetEl)) {
      dragSourceRef.current = null;
      return;
    }
    const doc = (targetEl.ownerDocument || document) as Document;
    // snapshot before mutation
    try {
      undoStackRef.current.push(doc.documentElement.outerHTML);
      redoStackRef.current = [];
    } catch {}
    try {
      if (position === "before") {
        parentA.insertBefore(src, targetEl);
      } else {
        parentA.insertBefore(src, targetEl.nextSibling);
      }
    } catch {}
    // Update code and rebuild tree
    scheduleUpdateHtml();
    refreshDomTreeFromDoc(doc);
    // Auto-select moved element in style panel
    openStylePanelFor(src);
    dragSourceRef.current = null;
  };

  // ======== Undo/Redo ========
  const applyHtmlToIframe = (html: string) => {
    const iframe = iframeRef.current;
    const iframeDoc =
      iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!iframeDoc) return;
    try {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
    } catch {}
    // reinitialize listeners and tree
    setTimeout(() => {
      try {
        addEditingListeners(iframeDoc);
      } catch {}
      try {
        refreshDomTreeFromDoc(iframeDoc);
      } catch {}
    }, 50);
    // propagate to code without reloading iframe again
    internalUpdateRef.current = true;
    setCurrentHtml(html);
    onCodeUpdate(html);
  };

  const performUndo = () => {
    const prev = undoStackRef.current.pop();
    if (!prev) return;
    // push current to redo
    try {
      if (iframeRef.current?.contentDocument) {
        const cur = iframeRef.current.contentDocument.documentElement.outerHTML;
        redoStackRef.current.push(cur);
      }
    } catch {}
    applyHtmlToIframe(prev);
    clearSelection();
  };

  const performRedo = () => {
    const next = redoStackRef.current.pop();
    if (!next) return;
    // push current to undo
    try {
      if (iframeRef.current?.contentDocument) {
        const cur = iframeRef.current.contentDocument.documentElement.outerHTML;
        undoStackRef.current.push(cur);
      }
    } catch {}
    applyHtmlToIframe(next);
    clearSelection();
  };

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

  // ======== Auto-expand DOM tree to selected element ========
  const findPathToEl = (
    node: DomTreeNode | null,
    target: HTMLElement,
    acc: string[] = []
  ): string[] | null => {
    if (!node) return null;
    const nextAcc = [...acc, node.key];
    if (node.el === target) return nextAcc;
    for (const child of node.children) {
      const res = findPathToEl(child, target, nextAcc);
      if (res) return res;
    }
    return null;
  };

  const expandPathToElement = (el: HTMLElement) => {
    if (!domTree) return;
    const path = findPathToEl(domTree, el);
    if (!path) return;
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      path.forEach((k) => next.add(k));
      return next;
    });
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
    // Observe size changes on selected element to keep overlay aligned
    try {
      // Disconnect any previous observer
      selectedRORef.current?.disconnect?.();
    } catch {}
    try {
      const win = doc.defaultView as Window | null;
      const RO = (win as any)?.ResizeObserver || (window as any).ResizeObserver;
      if (RO) {
        const ro = new RO(() => {
          try {
            repositionSelectedOverlay();
          } catch {}
        });
        ro.observe(el);
        selectedRORef.current = ro;
      }
    } catch {}
    // Ensure the DOM tree expands to reveal this element
    try {
      expandPathToElement(el);
    } catch {}
    // Attach scroll listeners on the selected element's ancestor chain
    try {
      // cleanup prior
      selectedScrollCleanupsRef.current.forEach((fn) => fn());
    } catch {}
    selectedScrollCleanupsRef.current = [];
    try {
      const onAncestorScroll = () => {
        repositionSelectedOverlay();
      };
      let cur: HTMLElement | null = el;
      while (cur) {
        cur.addEventListener("scroll", onAncestorScroll, true);
        selectedScrollCleanupsRef.current.push(() =>
          cur?.removeEventListener("scroll", onAncestorScroll, true)
        );
        cur = cur.parentElement as HTMLElement | null;
      }
      const w = (el.ownerDocument as Document).defaultView as Window | null;
      if (w) {
        w.addEventListener("scroll", onAncestorScroll, true);
        selectedScrollCleanupsRef.current.push(() =>
          w.removeEventListener("scroll", onAncestorScroll, true)
        );
      }
    } catch {}
  };

  const applyInlineStyle = (prop: string, value: string) => {
    const el = styleTargetRef.current;
    if (!el) return;
    if (!prop) return;
    // snapshot before style mutation
    try {
      const doc = (el.ownerDocument || document) as Document;
      undoStackRef.current.push(doc.documentElement.outerHTML);
      redoStackRef.current = [];
    } catch {}
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
    // DOM tree may need refresh if structure changed (rare for style changes)
  };

  // ========= Overlay helpers =========
  const ensureOverlays = (doc: Document) => {
    const body = doc.body;
    if (!hoverOverlayRef.current) {
      const hov = doc.createElement("div");
      // mark as internal overlay so DOM tree can ignore it
      hov.setAttribute("data-likedocs-overlay", "hover");
      hov.classList.add("likedocs-overlay");
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
      // mark as internal overlay so DOM tree can ignore it
      sel.setAttribute("data-likedocs-overlay", "select");
      sel.classList.add("likedocs-overlay");
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

  const positionOverlay = (
    el: HTMLElement,
    overlay: HTMLDivElement,
    color?: string
  ) => {
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
    // Disconnect any ResizeObserver on selection
    try {
      selectedRORef.current?.disconnect?.();
    } catch {}
    selectedRORef.current = null;
    // Remove any scroll listeners attached to ancestor chain
    try {
      selectedScrollCleanupsRef.current.forEach((fn) => fn());
    } catch {}
    selectedScrollCleanupsRef.current = [];
    hideOverlay(selectOverlayRef.current);
    hideOverlay(hoverOverlayRef.current);
  };

  // Cleanup observer and timers on unmount
  useEffect(() => {
    return () => {
      try {
        mutationObserverRef.current?.disconnect();
      } catch {}
      mutationObserverRef.current = null;
      if (observerTimerRef.current) {
        window.clearTimeout(observerTimerRef.current);
        observerTimerRef.current = null;
      }
    };
  }, []);

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
    setQcWidth(wNum);
    setQcWidthUnit(wUnit);
    setQcHeight(hNum);
    setQcHeightUnit(hUnit);
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
    setQcBorderRadiusUnit(
      parseUnit(getComputed(el, "border-top-left-radius")).unit
    );
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
        if (
          node.nodeType === Node.TEXT_NODE &&
          (node.textContent?.trim() || "")
        ) {
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
    // snapshot before text mutation
    try {
      const doc = (tgt.ownerDocument || document) as Document;
      undoStackRef.current.push(doc.documentElement.outerHTML);
      redoStackRef.current = [];
    } catch {}
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
    const onMouseMove = (e: MouseEvent) => {
      // Track last known pointer position inside iframe viewport
      lastHoverPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.target as HTMLElement;
      if (!t || !(t instanceof win.HTMLElement)) return;
      // Click on document root or body selects the top container (body) with toggle behavior
      if (t === doc.documentElement || t === doc.body) {
        const bodyEl = (doc.body as HTMLElement) || (doc.documentElement as HTMLElement);
        if (styleTargetRef.current === bodyEl) {
          clearSelection();
        } else {
          openStylePanelFor(bodyEl);
        }
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
      } else if (e.key === "Delete") {
        e.preventDefault();
        deleteElementAndRefresh(styleTargetRef.current);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          performRedo();
        } else {
          performUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        performRedo();
      }
    };
    const updateHoverFromLastPos = () => {
      // Reposition hover overlay relative to current viewport position
      const pos = lastHoverPosRef.current;
      if (!pos) {
        hideOverlay(hoverOverlayRef.current);
        return;
      }
      const elAt = doc.elementFromPoint(pos.x, pos.y) as HTMLElement | null;
      if (elAt && hoverOverlayRef.current) {
        if (!(selectOverlayRef.current && styleTargetRef.current === elAt)) {
          positionOverlay(elAt, hoverOverlayRef.current);
        }
      } else {
        hideOverlay(hoverOverlayRef.current);
      }
    };
    const onScroll = () => {
      repositionSelectedOverlay();
      updateHoverFromLastPos();
    };
    const onResize = () => {
      repositionSelectedOverlay();
      updateHoverFromLastPos();
    };
    const onWheel = () => {
      // When user scrolls via wheel/trackpad inside any scrollable container,
      // update overlays to follow moved content.
      repositionSelectedOverlay();
      updateHoverFromLastPos();
    };
    doc.addEventListener("mouseover", onMouseOver, true);
    doc.addEventListener("mouseout", onMouseOut, true);
    doc.addEventListener("mousemove", onMouseMove as any, true);
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("keydown", onKeyDown as any, true);
    win.addEventListener("scroll", onScroll, true);
    win.addEventListener("resize", onResize, true);
    doc.addEventListener("wheel", onWheel as any, { capture: true } as AddEventListenerOptions);
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
    // Capture a pending snapshot of the whole document before any text changes
    try {
      const docHtml = (doc as Document).documentElement.outerHTML;
      pendingEditSnapshotRef.current = docHtml;
    } catch {}

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
      // Commit the pending snapshot to undo stack and clear redo
      if (pendingEditSnapshotRef.current) {
        undoStackRef.current.push(pendingEditSnapshotRef.current);
        redoStackRef.current = [];
        pendingEditSnapshotRef.current = null;
      }
      updateHtmlCode();
      clearSelection();
    };

    const cancelEdit = () => {
      targetEl.innerHTML = originalHTML;
      cleanup();
      // discard pending snapshot on cancel
      pendingEditSnapshotRef.current = null;
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
    <div
      ref={containerRef}
      className="relative h-screen w-screen bg-gray-950 flex"
    >
      {/* Left DOM Tree Sidebar (static attached) */}
      <DomTree
        tree={domTree}
        expandedKeys={expandedKeys}
        onToggle={(key) => {
          setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
          });
        }}
        onSelect={(el) => openStylePanelFor(el)}
        selectedEl={styleTargetRef.current}
        onRequestInsert={openInsertModal}
        onContextMenu={(el, x, y) => openContextMenu(el, x, y)}
        onDragStart={handleTreeDragStart}
        onDragEnd={handleTreeDragEnd}
        onDrop={(el, pos) => handleTreeDropOn(el, pos)}
      />

      {/* Context Menu */}
      {ctxMenuOpen && (
        <div className="fixed inset-0 z-[130]" onClick={closeContextMenu}>
          <div
            className="absolute min-w-40 rounded-md border border-white/10 bg-[#111] text-sm text-gray-100 shadow-xl"
            style={{ left: ctxMenuPos.x + 4, top: ctxMenuPos.y + 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-3 py-2 hover:bg-white/10"
              onClick={() => {
                deleteElementAndRefresh(ctxTargetRef.current);
                closeContextMenu();
              }}
            >
              Delete element
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-white/10"
              onClick={() => {
                clearInlineStylesOn(ctxTargetRef.current);
                closeContextMenu();
              }}
            >
              Clear inline styles
            </button>
          </div>
        </div>
      )}

      {/* Insert Modal */}
      {insertModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeInsertModal}
          />
          <div className="relative mt-16 w-[520px] max-w-[90vw] rounded-lg border border-white/10 bg-[#111] text-gray-100 shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-sm font-semibold">
              Insert element
              <button
                className="text-gray-400 hover:text-white"
                onClick={closeInsertModal}
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-400 mb-2">
                Choose a tag to insert inside the selected div
              </div>
              <div className="grid grid-cols-4 gap-2">
                {tagOptions.map((t) => (
                  <button
                    key={t}
                    className="px-2 py-1 rounded-md border border-white/10 hover:bg-white/10 text-xs"
                    onClick={() => insertTagIntoParent(t)}
                    title={`Insert <${t}>`}
                  >
                    {`<${t}>`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center workspace with canvas (pan/zoom outside preview) */}
      <div className="relative flex-1 h-full overflow-hidden">
        <div
          ref={workspaceRef}
          className="absolute inset-0 overflow-hidden bg-[#0b0b0b]"
          title="Use trackpad: scroll to pan, pinch to zoom (outside preview)"
        >
          {/* Visual grid background */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:18px_18px]" />
          {/* Canvas container */}
          <div ref={canvasRef} className="relative w-max h-max select-none">
            {/* Frame wrapper - treated as 'preview area' */}
            <div
              ref={frameRef}
              className="relative shadow-2xl ring-1 ring-white/10 bg-white rounded-md"
              style={{ width: 1200, height: 800 }}
            >
              {sanitizedHTML ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0 rounded-md bg-white"
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
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar: Style Editor */}
      <StyleEditorPanel
        mode="sidebar"
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
        qcColor={qcColor}
        setQcColor={setQcColor}
        qcBg={qcBg}
        setQcBg={setQcBg}
        qcBorderColor={qcBorderColor}
        setQcBorderColor={setQcBorderColor}
        qcWidth={qcWidth}
        setQcWidth={setQcWidth}
        qcWidthUnit={qcWidthUnit}
        setQcWidthUnit={setQcWidthUnit}
        qcHeight={qcHeight}
        setQcHeight={setQcHeight}
        qcHeightUnit={qcHeightUnit}
        setQcHeightUnit={setQcHeightUnit}
        qcPad={qcPad}
        setQcPad={setQcPad}
        qcMar={qcMar}
        setQcMar={setQcMar}
        qcBorderWidth={qcBorderWidth}
        setQcBorderWidth={setQcBorderWidth}
        qcBorderWidthUnit={qcBorderWidthUnit}
        setQcBorderWidthUnit={setQcBorderWidthUnit}
        qcBorderStyle={qcBorderStyle}
        setQcBorderStyle={setQcBorderStyle}
        qcBorderRadius={qcBorderRadius}
        setQcBorderRadius={setQcBorderRadius}
        qcBorderRadiusUnit={qcBorderRadiusUnit}
        setQcBorderRadiusUnit={setQcBorderRadiusUnit}
        qcFontSize={qcFontSize}
        setQcFontSize={setQcFontSize}
        qcFontSizeUnit={qcFontSizeUnit}
        setQcFontSizeUnit={setQcFontSizeUnit}
        qcFontWeight={qcFontWeight}
        setQcFontWeight={setQcFontWeight}
        qcTextAlign={qcTextAlign}
        setQcTextAlign={setQcTextAlign}
        qcDisplay={qcDisplay}
        setQcDisplay={setQcDisplay}
        qcFlexDirection={qcFlexDirection}
        setQcFlexDirection={setQcFlexDirection}
        qcJustifyContent={qcJustifyContent}
        setQcJustifyContent={setQcJustifyContent}
        qcAlignItems={qcAlignItems}
        setQcAlignItems={setQcAlignItems}
        qcFlexWrap={qcFlexWrap}
        setQcFlexWrap={setQcFlexWrap}
        qcGap={qcGap}
        setQcGap={setQcGap}
        qcGapUnit={qcGapUnit}
        setQcGapUnit={setQcGapUnit}
      />
    </div>
  );
};

export default PreviewSection;
