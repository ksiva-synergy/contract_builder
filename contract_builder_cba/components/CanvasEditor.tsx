"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { EmploymentContract } from "@/types/contract";
import CanvasToolbox from "./CanvasToolbox";
import CanvasWorkspace from "./CanvasWorkspace";
import CanvasPropertiesPanel from "./CanvasPropertiesPanel";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw, Grid3X3, Save, Download } from "lucide-react";

export interface CanvasElement {
  id: string;
  type: "text" | "heading" | "field" | "table" | "signature" | "divider" | "image" | "checkbox" | "clause" | "pagebreak";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fieldKey?: string;
  style?: {
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number;
    textAlign?: string;
    lineHeight?: number;
  };
  locked?: boolean;
  layerOrder?: number;
}

interface CanvasEditorProps {
  contract: EmploymentContract;
  onChange: (contract: EmploymentContract) => void;
}

interface HistoryEntry {
  elements: CanvasElement[];
}

export default function CanvasEditor({ contract, onChange }: CanvasEditorProps) {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const [history, setHistory] = useState<HistoryEntry[]>([{ elements: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const pushHistory = useCallback((newElements: CanvasElement[]) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, { elements: newElements }];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex].elements);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex].elements);
    }
  }, [historyIndex, history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === "y") { e.preventDefault(); redo(); }
        if (e.key === "c" && selectedElement) {
          e.preventDefault();
          const el = elements.find((el) => el.id === selectedElement);
          if (el) sessionStorage.setItem("clipboard", JSON.stringify(el));
        }
        if (e.key === "v") {
          e.preventDefault();
          const data = sessionStorage.getItem("clipboard");
          if (data) {
            const el = JSON.parse(data) as CanvasElement;
            const newEl = { ...el, id: `el-${Date.now()}`, x: el.x + 20, y: el.y + 20 };
            const newElements = [...elements, newEl];
            setElements(newElements);
            pushHistory(newElements);
            setSelectedElement(newEl.id);
          }
        }
      }
      if (e.key === "Delete" && selectedElement) {
        const newElements = elements.filter((el) => el.id !== selectedElement);
        setElements(newElements);
        pushHistory(newElements);
        setSelectedElement(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [elements, selectedElement, undo, redo, pushHistory]);

  const addElement = useCallback((type: CanvasElement["type"]) => {
    const newElement: CanvasElement = {
      id: `el-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === "divider" || type === "pagebreak" ? 500 : type === "table" ? 400 : 200,
      height: type === "heading" ? 40 : type === "divider" ? 4 : type === "table" ? 150 : type === "pagebreak" ? 30 : type === "checkbox" ? 24 : 30,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
      layerOrder: elements.length,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedElement(newElement.id);
  }, [elements, pushHistory]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    pushHistory(newElements);
    if (selectedElement === id) setSelectedElement(null);
  }, [elements, selectedElement, pushHistory]);

  const moveLayer = useCallback((id: string, direction: "up" | "down") => {
    const idx = elements.findIndex((el) => el.id === id);
    if (idx === -1) return;
    const newElements = [...elements];
    const swapIdx = direction === "up" ? idx + 1 : idx - 1;
    if (swapIdx < 0 || swapIdx >= newElements.length) return;
    [newElements[idx], newElements[swapIdx]] = [newElements[swapIdx], newElements[idx]];
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const snapValue = (val: number) => (snapToGrid ? Math.round(val / 10) * 10 : val);

  return (
    <div className="flex h-full bg-muted/30">
      <CanvasToolbox onAddElement={addElement} />

      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-card border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm mr-2">Canvas</span>
            <div className="h-5 w-px bg-border" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)">
              <Redo2 className="w-4 h-4" />
            </Button>
            <div className="h-5 w-px bg-border" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs min-w-[50px] text-center font-mono">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(2, zoom + 0.1))} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset View">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="h-5 w-px bg-border" />
            <Button variant={showGrid ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant={snapToGrid ? "secondary" : "ghost"} size="sm" className="h-8 text-xs" onClick={() => setSnapToGrid(!snapToGrid)}>
              Snap
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Download className="w-4 h-4 mr-1" /> Export PDF
            </Button>
            <Button size="sm" className="h-8">
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
          </div>
        </div>

        <CanvasWorkspace
          elements={elements}
          selectedElement={selectedElement}
          zoom={zoom}
          pan={pan}
          showGrid={showGrid}
          snapValue={snapValue}
          onSelectElement={setSelectedElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          canvasRef={canvasRef}
        />
      </div>

      {selectedElement && (
        <CanvasPropertiesPanel
          element={elements.find((el) => el.id === selectedElement)!}
          onUpdate={(updates) => updateElement(selectedElement, updates)}
          onClose={() => setSelectedElement(null)}
          onDelete={() => deleteElement(selectedElement)}
          onMoveLayer={(dir) => moveLayer(selectedElement, dir)}
        />
      )}
    </div>
  );
}

function getDefaultContent(type: CanvasElement["type"]): string {
  switch (type) {
    case "heading": return "Section Heading";
    case "text": return "Enter text content here...";
    case "field": return "Field Label: ";
    case "table": return "Table";
    case "signature": return "Signature: _______________";
    case "divider": return "";
    case "image": return "[Image Placeholder]";
    case "checkbox": return "☐ I agree to the terms";
    case "clause": return "Standard clause text. Click to edit or replace from the clause library.";
    case "pagebreak": return "--- Page Break ---";
    default: return "";
  }
}

function getDefaultStyle(type: CanvasElement["type"]): CanvasElement["style"] {
  switch (type) {
    case "heading": return { fontSize: 18, fontWeight: "bold", color: "#000000", fontFamily: "Georgia" };
    case "text": return { fontSize: 12, color: "#333333", lineHeight: 1.5 };
    case "field": return { fontSize: 12, color: "#000000", borderWidth: 1, borderColor: "#cccccc", padding: 4 };
    case "divider": return { backgroundColor: "#cccccc" };
    case "clause": return { fontSize: 11, color: "#333333", padding: 8, borderWidth: 1, borderColor: "#e0e0e0", backgroundColor: "#fafafa", lineHeight: 1.4 };
    case "pagebreak": return { fontSize: 10, color: "#999999", textAlign: "center" };
    default: return { fontSize: 12, color: "#000000" };
  }
}
