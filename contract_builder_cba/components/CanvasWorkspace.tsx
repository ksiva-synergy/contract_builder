"use client";

import { useState, useCallback, useRef } from "react";
import type { CanvasElement } from "./CanvasEditor";

interface CanvasWorkspaceProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  snapValue: (val: number) => number;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

export default function CanvasWorkspace({
  elements,
  selectedElement,
  zoom,
  pan,
  showGrid,
  snapValue,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  canvasRef,
}: CanvasWorkspaceProps) {
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; handle: string; startX: number; startY: number; startW: number; startH: number; startEX: number; startEY: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (editingId === id) return;
    e.stopPropagation();
    const el = elements.find((el) => el.id === id);
    if (!el || el.locked) return;
    onSelectElement(id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / zoom - el.x;
    const y = (e.clientY - rect.top) / zoom - el.y;
    setDragging({ id, offsetX: x, offsetY: y });
  }, [elements, zoom, canvasRef, onSelectElement, editingId]);

  const handleResizeDown = useCallback((e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    const el = elements.find((el) => el.id === id);
    if (!el) return;
    setResizing({
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startW: el.width,
      startH: el.height,
      startEX: el.x,
      startEY: el.y,
    });
  }, [elements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = snapValue((e.clientX - rect.left) / zoom - dragging.offsetX);
      const y = snapValue((e.clientY - rect.top) / zoom - dragging.offsetY);
      onUpdateElement(dragging.id, { x: Math.max(0, x), y: Math.max(0, y) });
    }
    if (resizing) {
      const dx = (e.clientX - resizing.startX) / zoom;
      const dy = (e.clientY - resizing.startY) / zoom;
      const updates: Partial<CanvasElement> = {};
      if (resizing.handle.includes("e")) updates.width = Math.max(30, snapValue(resizing.startW + dx));
      if (resizing.handle.includes("s")) updates.height = Math.max(10, snapValue(resizing.startH + dy));
      if (resizing.handle.includes("w")) {
        updates.width = Math.max(30, snapValue(resizing.startW - dx));
        updates.x = snapValue(resizing.startEX + dx);
      }
      if (resizing.handle.includes("n")) {
        updates.height = Math.max(10, snapValue(resizing.startH - dy));
        updates.y = snapValue(resizing.startEY + dy);
      }
      onUpdateElement(resizing.id, updates);
    }
  }, [dragging, resizing, zoom, canvasRef, snapValue, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  const handleDoubleClick = useCallback((id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el || el.type === "divider" || el.type === "pagebreak") return;
    setEditingId(id);
  }, [elements]);

  const GRID_SIZE = 10;

  return (
    <div
      className="flex-1 overflow-auto bg-muted/50 relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => { if (!dragging && !resizing) onSelectElement(null); }}
    >
      <div
        className="relative mx-auto my-8"
        style={{
          width: PAGE_WIDTH * zoom,
          height: PAGE_HEIGHT * zoom,
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        <div
          ref={canvasRef}
          className="bg-white shadow-lg relative"
          style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          {/* Grid */}
          {showGrid && (
            <svg className="absolute inset-0 pointer-events-none" width={PAGE_WIDTH} height={PAGE_HEIGHT}>
              <defs>
                <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Elements */}
          {elements.map((el) => {
            const isSelected = selectedElement === el.id;
            const isEditing = editingId === el.id;

            return (
              <div
                key={el.id}
                className={`absolute group ${el.locked ? "opacity-70" : "cursor-move"} ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.type === "divider" ? el.height : "auto",
                  minHeight: el.height,
                  fontSize: el.style?.fontSize,
                  fontWeight: el.style?.fontWeight,
                  fontFamily: el.style?.fontFamily,
                  color: el.style?.color,
                  backgroundColor: el.type === "divider" ? el.style?.backgroundColor : el.style?.backgroundColor || "transparent",
                  borderWidth: el.style?.borderWidth,
                  borderColor: el.style?.borderColor,
                  borderStyle: el.style?.borderWidth ? "solid" : undefined,
                  padding: el.style?.padding,
                  textAlign: (el.style?.textAlign as React.CSSProperties["textAlign"]) || undefined,
                  lineHeight: el.style?.lineHeight,
                  zIndex: isSelected ? 999 : el.layerOrder || 0,
                }}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                onDoubleClick={() => handleDoubleClick(el.id)}
                onClick={(e) => e.stopPropagation()}
              >
                {el.type === "divider" ? null : el.type === "pagebreak" ? (
                  <div className="border-t-2 border-dashed border-gray-300 text-center text-[10px] text-gray-400 pt-1">
                    Page Break
                  </div>
                ) : el.type === "checkbox" ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    {isEditing ? (
                      <input
                        className="flex-1 bg-transparent outline-none border-b border-primary"
                        value={el.content}
                        onChange={(e) => onUpdateElement(el.id, { content: e.target.value })}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm">{el.content}</span>
                    )}
                  </label>
                ) : isEditing ? (
                  <textarea
                    className="w-full h-full bg-transparent outline-none border border-primary rounded resize-none"
                    value={el.content}
                    onChange={(e) => onUpdateElement(el.id, { content: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                    style={{ fontSize: "inherit", fontWeight: "inherit", fontFamily: "inherit", color: "inherit", lineHeight: "inherit" }}
                  />
                ) : (
                  <span className="whitespace-pre-wrap">{el.content}</span>
                )}

                {/* Resize handles */}
                {isSelected && !el.locked && (
                  <>
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary border border-white rounded-full cursor-e-resize" onMouseDown={(e) => handleResizeDown(e, el.id, "e")} />
                    <div className="absolute right-0 -bottom-1 w-2.5 h-2.5 bg-primary border border-white rounded-full cursor-se-resize" onMouseDown={(e) => handleResizeDown(e, el.id, "se")} />
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2.5 h-2.5 bg-primary border border-white rounded-full cursor-s-resize" onMouseDown={(e) => handleResizeDown(e, el.id, "s")} />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
