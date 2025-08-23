"use client";

import React from "react";
import {
  Square,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  List as ListIcon,
  Image as ImageIcon,
  TextCursorInput,
  Menu as MenuIcon,
  FileText,
  Braces,
  LayoutDashboard,
  MousePointer,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type {
  MouseEvent as ReactMouseEvent,
  DragEvent as ReactDragEvent,
} from "react";

interface DomTreeNode {
  key: string;
  label: string;
  el: HTMLElement;
  children: DomTreeNode[];
}

interface DomTreeProps {
  tree: DomTreeNode | null;
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  onSelect: (el: HTMLElement) => void;
  selectedEl?: HTMLElement | null;
  className?: string;
  title?: string;
  onRequestInsert?: (parentEl: HTMLElement) => void;
  onContextMenu?: (el: HTMLElement, x: number, y: number) => void;
  onDragStart?: (el: HTMLElement) => void;
  onDragEnd?: () => void;
  onDrop?: (
    targetEl: HTMLElement,
    position: "before" | "after" | "inside"
  ) => void;
}

const containerTags = new Set([
  "body",
  "div",
  "section",
  "header",
  "footer",
  "main",
  "article",
  "aside",
  "nav",
  "form",
  "span",
  "ul",
  "ol",
]);

// Icon mapping using lucide-react
const iconSizeCls = "w-3.5 h-3.5";
const getIconForTag = (tag: string): React.ReactNode => {
  switch (tag) {
    case "div":
      return <Square className={iconSizeCls} />;
    case "section":
    case "article":
    case "main":
    case "aside":
    case "header":
    case "footer":
      return <LayoutDashboard className={iconSizeCls} />;
    case "p":
      return <Pilcrow className={iconSizeCls} />;
    case "h1":
      return <Heading1 className={iconSizeCls} />;
    case "h2":
      return <Heading2 className={iconSizeCls} />;
    case "h3":
      return <Heading3 className={iconSizeCls} />;
    case "span":
      return <Braces className={iconSizeCls} />;
    case "a":
      return <LinkIcon className={iconSizeCls} />;
    case "button":
      return <MousePointer className={iconSizeCls} />;
    case "ul":
    case "ol":
      return <ListIcon className={iconSizeCls} />;
    case "li":
      return <ListIcon className={iconSizeCls} />;
    case "img":
      return <ImageIcon className={iconSizeCls} />;
    case "input":
    case "textarea":
      return <TextCursorInput className={iconSizeCls} />;
    case "nav":
      return <MenuIcon className={iconSizeCls} />;
    case "form":
      return <FileText className={iconSizeCls} />;
    default:
      return <Square className={iconSizeCls} />;
  }
};

const truncate = (s: string, max = 48) => {
  if (!s) return s;
  return s.length > max ? s.slice(0, max) + "…" : s;
};

const DomTree: React.FC<DomTreeProps> = ({
  tree,
  expandedKeys,
  onToggle,
  onSelect,
  selectedEl,
  className,
  title = "DOM tree",
  onRequestInsert,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDrop,
}) => {
  const draggingElRef = React.useRef<HTMLElement | null>(null);
  const [dropHint, setDropHint] = React.useState<{
    key: string;
    pos: "before" | "after" | "inside";
  } | null>(null);

  // Clear any stale drop hints if the drag ends anywhere in the window
  React.useEffect(() => {
    const clear = () => setDropHint(null);
    window.addEventListener("dragend", clear);
    window.addEventListener("drop", clear);
    return () => {
      window.removeEventListener("dragend", clear);
      window.removeEventListener("drop", clear);
    };
  }, []);

  const NodeView: React.FC<{ node: DomTreeNode; depth: number }> = ({
    node,
    depth,
  }) => {
    const isSelected = selectedEl === node.el;
    const hasChildren = node.children.length > 0;
    const expandedControlled = expandedKeys.has(node.key);
    // Auto-expand if this node is an ancestor of the selected element
    const autoExpand = !!selectedEl && node.el !== selectedEl && node.el.contains(selectedEl);
    const expanded = expandedControlled || autoExpand;
    const isContainer = containerTags.has(node.el.tagName.toLowerCase());
    const rowRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (isSelected && rowRef.current) {
        try {
          rowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } catch {}
      }
    }, [isSelected]);

    // Build display label and icon
    const tag = node.el.tagName.toLowerCase();
    const icon = getIconForTag(tag);
    const showTextInstead =
      tag === "li" ||
      tag === "p" ||
      tag === "h1" ||
      tag === "button" ||
      tag === "i" ||
      tag === "a" ||
      tag === "span";
    const textContent = (node.el.textContent || "").trim().replace(/\s+/g, " ");
    const baseName = tag === "div" ? "rectangle" : tag;
    const labelText = showTextInstead && textContent ? truncate(textContent) : baseName;
    const buttonTitle = showTextInstead && textContent ? `${tag}: ${textContent}` : baseName;

    const toggle = (e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!hasChildren) return;
      onToggle(node.key);
    };

    return (
      <div>
        {/* Drop indicator BEFORE */}
        {dropHint && dropHint.key === node.key && dropHint.pos === "before" && (
          <div
            className="h-0.5 bg-blue-500/80 rounded-sm"
            style={{ marginLeft: depth * 12 + 8 }}
          />
        )}
        <div
          ref={isSelected ? rowRef : undefined}
          className={[
            "flex items-center rounded-md px-2 w-full",
            isSelected ? "bg-blue-600/20 text-blue-300" : "hover:bg-white/5",
          ].join(" ")}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onContextMenu && onContextMenu(node.el, e.clientX, e.clientY);
          }}
          onDragEnter={(e: ReactDragEvent) => {
            const src = draggingElRef.current;
            if (!src) return;
            e.preventDefault();
            const sameParent = src.parentElement === node.el.parentElement;
            const notSelf = src !== node.el;
            const isDescendant = node.el.contains(src);
            const isAncestor = src.contains(node.el);
            // Allow dropping inside ancestor containers (e.g., body). Only forbid into a descendant (cycle) or self.
            const canInside = isContainer && notSelf && !isAncestor;
            try {
              e.dataTransfer.dropEffect = sameParent && notSelf ? "move" : canInside ? "move" : "none";
            } catch {}
          }}
          onDragOver={(e: ReactDragEvent) => {
            const src = draggingElRef.current;
            if (!src) return;
            // Always prevent default during an active drag so drop can fire
            e.preventDefault();
            const sameParent = src.parentElement === node.el.parentElement;
            const notSelf = src !== node.el;
            const isDescendant = node.el.contains(src);
            const isAncestor = src.contains(node.el);
            // Allow dropping inside ancestor containers (e.g., body). Only forbid into a descendant (cycle) or self.
            const canInside = isContainer && notSelf && !isAncestor;
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const y = e.clientY;
            const rel = (y - rect.top) / Math.max(1, rect.height);
            let pos: "before" | "after" | "inside";
            if (canInside && rel > 0.33 && rel < 0.67) {
              pos = "inside";
            } else {
              pos = rel < 0.5 ? "before" : "after";
            }
            const valid =
              (pos === "inside" && canInside) ||
              ((pos === "before" || pos === "after") && sameParent && notSelf);
            if (valid) {
              if (!dropHint || dropHint.key !== node.key || dropHint.pos !== pos) {
                setDropHint({ key: node.key, pos });
              }
              try {
                e.dataTransfer.dropEffect = "move";
              } catch {}
            } else {
              if (dropHint && dropHint.key === node.key) setDropHint(null);
              try {
                e.dataTransfer.dropEffect = "none";
              } catch {}
            }
          }}
          onDragLeave={() => {
            // Clear hint when leaving this row
            if (dropHint && dropHint.key === node.key) setDropHint(null);
          }}
          onDrop={(e: ReactDragEvent) => {
            // Always prevent default on drop to avoid browser default handling
            e.preventDefault();
            e.stopPropagation();
            const src = draggingElRef.current;
            if (!src) {
              setDropHint(null);
              return;
            }
            const sameParent = src.parentElement === node.el.parentElement;
            const notSelf = src !== node.el;
            const isDescendant = node.el.contains(src);
            const isAncestor = src.contains(node.el);
            // Allow dropping inside ancestor containers (e.g., body). Only forbid into a descendant (cycle) or self.
            const canInside = isContainer && notSelf && !isAncestor;
            // Prefer hint; if missing, recompute quickly
            let pos: "before" | "after" | "inside" | null = null;
            if (dropHint && dropHint.key === node.key) {
              pos = dropHint.pos;
            } else {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const rel = (e.clientY - rect.top) / Math.max(1, rect.height);
              if (canInside && rel > 0.33 && rel < 0.67) pos = "inside";
              else pos = rel < 0.5 ? "before" : "after";
            }
            const valid =
              pos !== null &&
              ((pos === "inside" && canInside) ||
                ((pos === "before" || pos === "after") && sameParent && notSelf));
            if (valid && pos) {
              onDrop && onDrop(node.el, pos);
            }
            setDropHint(null);
          }}
        >
          {/* Chevron */}
          <button
            aria-label={expanded ? "Collapse" : "Expand"}
            className={[
              "p-0.5 rounded-md text-gray-400 hover:text-gray-200",
              hasChildren ? "opacity-100" : "opacity-30 cursor-default",
            ].join(" ")}
            style={{ marginLeft: depth * 12 }}
            onClick={toggle}
          >
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )
            ) : (
              <ChevronRight className="w-3 h-3 opacity-0" />
            )}
          </button>
          {/* Label */}
          <button
            className={[
              "flex-1 text-left py-1 truncate cursor-move",
            ].join(" ")}
            draggable
            onDragStart={(e: ReactDragEvent) => {
              try {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", node.key);
              } catch {}
              draggingElRef.current = node.el;
              setDropHint(null);
              onDragStart && onDragStart(node.el);
            }}
            onDragEnd={() => {
              draggingElRef.current = null;
              setDropHint(null);
              onDragEnd && onDragEnd();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(node.el);
            }}
            title={buttonTitle}
          >
            <span className="mr-1 opacity-80 inline-block align-middle">{icon}</span>
            <span className="align-middle">{labelText}</span>
          </button>
          {/* Plus icon button aligned right when selected container tags */}
          {isSelected && isContainer && (
            <button
              aria-label="Insert child element"
              className="ml-2 mr-1 px-2 py-1 text-xs rounded-md text-gray-300 hover:text-white hover:bg-white/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestInsert && onRequestInsert(node.el);
              }}
              title="Insert into this element"
            >
              +
            </button>
          )}
        </div>
        {/* Drop indicator AFTER */}
        {dropHint && dropHint.key === node.key && dropHint.pos === "after" && (
          <div
            className="h-0.5 bg-blue-500/80 rounded-sm"
            style={{ marginLeft: depth * 12 + 8 }}
          />
        )}
        {/* Drop indicator INSIDE (as a dashed pill, indented as a child) */}
        {dropHint && dropHint.key === node.key && dropHint.pos === "inside" && (
          <div
            className="my-1 rounded border border-dashed border-blue-500/70 bg-blue-500/10"
            style={{ marginLeft: depth * 12 + 20, height: 18 }}
          />
        )}
        {hasChildren && expanded && (
          <div>
            {node.children.map((c) => (
              <NodeView key={c.key} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={[
        "shrink-0 w-64 h-full bg-[#0e0e0e] border-r border-white/10 text-gray-100 overflow-auto domtree-scroll",
        className || "",
      ].join(" ")}
      onDragLeave={(e: ReactDragEvent) => {
        const related = (e.relatedTarget as Node) || null;
        const current = e.currentTarget as HTMLElement;
        // If leaving the entire tree area, clear any active hint
        if (!related || !current.contains(related)) {
          setDropHint(null);
        }
      }}
    >
      <div className="p-1 text-xs">
        {tree ? <NodeView node={tree} depth={0} /> : null}
      </div>
    </div>
  );
};

export default DomTree;
