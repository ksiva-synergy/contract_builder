'use client';

import { useState, useRef, useCallback } from 'react';
import { EmploymentContract } from '@/types/contract';
import CanvasToolbox from './CanvasToolbox';
import CanvasWorkspace from './CanvasWorkspace';
import CanvasPropertiesPanel from './CanvasPropertiesPanel';

export interface CanvasElement {
  id: string;
  type: 'text' | 'heading' | 'field' | 'table' | 'signature' | 'divider';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fieldKey?: string; // Maps to contract field
  style?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number;
  };
}

interface CanvasEditorProps {
  contract: EmploymentContract;
  onChange: (contract: EmploymentContract) => void;
}

export default function CanvasEditor({ contract, onChange }: CanvasEditorProps) {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const addElement = useCallback((type: CanvasElement['type']) => {
    const newElement: CanvasElement = {
      id: `element-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'divider' ? 400 : 200,
      height: type === 'heading' ? 40 : type === 'divider' ? 2 : type === 'table' ? 150 : 30,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  }, [elements]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  }, [elements]);

  const deleteElement = useCallback((id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  }, [elements, selectedElement]);

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Toolbox Panel */}
      <CanvasToolbox onAddElement={addElement} />

      {/* Main Canvas Workspace */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">Contract Canvas</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="px-2 py-1 border rounded hover:bg-gray-50"
                title="Zoom Out"
              >
                −
              </button>
              <span className="text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="px-2 py-1 border rounded hover:bg-gray-50"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={handleResetView}
                className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-1 border rounded hover:bg-gray-50">
              Export PDF
            </button>
            <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>

        {/* Canvas Workspace */}
        <CanvasWorkspace
          elements={elements}
          selectedElement={selectedElement}
          zoom={zoom}
          pan={pan}
          onSelectElement={setSelectedElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          canvasRef={canvasRef}
        />
      </div>

      {/* Right Properties Panel */}
      {selectedElement && (
        <CanvasPropertiesPanel
          element={elements.find(el => el.id === selectedElement)!}
          onUpdate={(updates) => updateElement(selectedElement, updates)}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </div>
  );
}

function getDefaultContent(type: CanvasElement['type']): string {
  switch (type) {
    case 'heading': return 'Section Heading';
    case 'text': return 'Text content';
    case 'field': return 'Field Label: ';
    case 'table': return 'Table';
    case 'signature': return 'Signature: _______________';
    case 'divider': return '';
    default: return '';
  }
}

function getDefaultStyle(type: CanvasElement['type']): CanvasElement['style'] {
  switch (type) {
    case 'heading':
      return { fontSize: 18, fontWeight: 'bold', color: '#000000' };
    case 'text':
      return { fontSize: 14, color: '#333333' };
    case 'field':
      return { fontSize: 14, color: '#000000', borderWidth: 1, borderColor: '#cccccc' };
    case 'divider':
      return { backgroundColor: '#cccccc' };
    default:
      return { fontSize: 14, color: '#000000' };
  }
}
