"use client";

import React from "react";
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
  onDrop?: (targetEl: HTMLElement, position: "before" | "after") => void;
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
    pos: "before" | "after";
  } | null>(null);

  const NodeView: React.FC<{ node: DomTreeNode; depth: number }> = ({
    node,
    depth,
  }) => {
    const isSelected = selectedEl === node.el;
    const hasChildren = node.children.length > 0;
    const expanded = expandedKeys.has(node.key);
    const isContainer = containerTags.has(node.el.tagName.toLowerCase());

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
          className="flex items-center"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onContextMenu && onContextMenu(node.el, e.clientX, e.clientY);
          }}
          onDragOver={(e: ReactDragEvent) => {
            const src = draggingElRef.current;
            if (!src) return;
            // Always prevent default during an active drag so drop can fire
            e.preventDefault();
            // Only allow reordering among siblings
            const sameParent = src.parentElement === node.el.parentElement;
            const notSelf = src !== node.el;
            if (sameParent && notSelf) {
              const rect = (
                e.currentTarget as HTMLElement
              ).getBoundingClientRect();
              const pos: "before" | "after" =
                e.clientY < rect.top + rect.height / 2 ? "before" : "after";
              setDropHint({ key: node.key, pos });
              try {
                e.dataTransfer.dropEffect = "move";
              } catch {}
            } else {
              // invalid target: clear hint if it belongs to this row and show not-allowed
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
            if (sameParent && notSelf) {
              // Prefer the current hint; if missing (e.g., cleared by dragleave), compute from cursor
              let pos: "before" | "after";
              if (dropHint && dropHint.key === node.key) {
                pos = dropHint.pos;
              } else {
                const rect = (
                  e.currentTarget as HTMLElement
                ).getBoundingClientRect();
                pos =
                  e.clientY < rect.top + rect.height / 2 ? "before" : "after";
              }
              onDrop && onDrop(node.el, pos);
            }
            setDropHint(null);
          }}
        >
          {/* Chevron */}
          <button
            aria-label={expanded ? "Collapse" : "Expand"}
            className={[
              "px-1 py-1 rounded-md text-gray-400 hover:text-gray-200",
              hasChildren ? "opacity-100" : "opacity-30 cursor-default",
            ].join(" ")}
            style={{ marginLeft: depth * 12 }}
            onClick={toggle}
          >
            {hasChildren ? (
              <span
                style={{
                  display: "inline-block",
                  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 120ms",
                }}
              >
                ▶
              </span>
            ) : (
              <span style={{ visibility: "hidden" }}>▶</span>
            )}
          </button>
          {/* Label */}
          <button
            className={[
              "flex-1 text-left px-2 py-1 rounded-md truncate",
              isSelected ? "bg-blue-600/20 text-blue-300" : "hover:bg-white/5",
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
            title={node.el.tagName}
          >
            {node.el.tagName.toLowerCase()}
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
        "shrink-0 w-64 h-full bg-[#0e0e0e] border-r border-white/10 text-gray-100 overflow-auto",
        className || "",
      ].join(" ")}
    >
      <div className="sticky top-0 z-10 px-3 py-2 bg-[#0c0c0c] border-b border-white/10 text-xs font-semibold">
        {title}
      </div>
      <div className="p-1 text-xs">
        {tree ? <NodeView node={tree} depth={0} /> : null}
      </div>
    </div>
  );
};

export default DomTree;
