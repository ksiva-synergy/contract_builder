'use client';

import { useState, useRef, useEffect, RefObject } from 'react';
import { CanvasElement } from './CanvasEditor';

interface CanvasWorkspaceProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  zoom: number;
  pan: { x: number; y: number };
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  canvasRef: RefObject<HTMLDivElement>;
}

export default function CanvasWorkspace({
  elements,
  selectedElement,
  zoom,
  pan,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  canvasRef,
}: CanvasWorkspaceProps) {
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<{ id: string; handle: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        onDeleteElement(selectedElement);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, onDeleteElement]);

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    onSelectElement(elementId);
    setDraggingElement(elementId);
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setDragStart({
        x: e.clientX - element.x * zoom,
        y: e.clientY - element.y * zoom,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingElement) {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      onUpdateElement(draggingElement, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
    setResizing(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-auto bg-gray-100 relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Canvas Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
      />

      {/* Canvas Paper */}
      <div
        className="relative bg-white shadow-lg mx-auto my-8"
        style={{
          width: `${794 * zoom}px`, // A4 width in pixels
          minHeight: `${1123 * zoom}px`, // A4 height in pixels
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        {/* Render Elements */}
        {elements.map((element) => (
          <CanvasElementComponent
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            zoom={zoom}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}

interface CanvasElementComponentProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

function CanvasElementComponent({
  element,
  isSelected,
  zoom,
  onMouseDown,
  onUpdate,
}: CanvasElementComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleContentChange = (value: string) => {
    onUpdate({ content: value });
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x * zoom}px`,
    top: `${element.y * zoom}px`,
    width: `${element.width * zoom}px`,
    height: element.type === 'text' ? 'auto' : `${element.height * zoom}px`,
    minHeight: `${element.height * zoom}px`,
    fontSize: `${(element.style?.fontSize || 14) * zoom}px`,
    fontWeight: element.style?.fontWeight || 'normal',
    color: element.style?.color || '#000000',
    backgroundColor: element.style?.backgroundColor || 'transparent',
    border: isSelected ? '2px solid #3b82f6' : element.style?.borderWidth ? `${element.style.borderWidth}px solid ${element.style.borderColor || '#ccc'}` : 'none',
    padding: `${(element.style?.padding || 4) * zoom}px`,
    cursor: isEditing ? 'text' : 'move',
    userSelect: isEditing ? 'text' : 'none',
  };

  return (
    <div
      style={style}
      onMouseDown={isEditing ? undefined : onMouseDown}
      onDoubleClick={handleDoubleClick}
      className={`${isSelected ? 'ring-2 ring-blue-400' : ''} transition-shadow`}
    >
      {isEditing ? (
        element.type === 'text' ? (
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            value={element.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleBlur}
            className="w-full h-full bg-transparent border-none outline-none resize-none"
            style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
          />
        ) : (
          <input
            ref={inputRef as RefObject<HTMLInputElement>}
            type="text"
            value={element.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleBlur}
            className="w-full h-full bg-transparent border-none outline-none"
            style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
          />
        )
      ) : (
        <div className={element.type === 'divider' ? 'w-full h-full' : ''}>
          {element.type === 'divider' ? (
            <div className="w-full h-full" style={{ backgroundColor: element.style?.backgroundColor }} />
          ) : (
            element.content
          )}
        </div>
      )}

      {/* Resize Handles */}
      {isSelected && !isEditing && (
        <>
          <div
            className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Handle resize logic here
            }}
          />
        </>
      )}
    </div>
  );
}
