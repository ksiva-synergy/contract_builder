'use client';

import { CanvasElement } from './CanvasEditor';

interface CanvasPropertiesPanelProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}

export default function CanvasPropertiesPanel({
  element,
  onUpdate,
  onClose,
}: CanvasPropertiesPanelProps) {
  const updateStyle = (key: string, value: any) => {
    onUpdate({
      style: {
        ...element.style,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-80 bg-white border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Properties</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Element Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Element Type
          </label>
          <div className="px-3 py-2 bg-gray-50 rounded text-sm capitalize">
            {element.type}
          </div>
        </div>

        {/* Content */}
        {element.type !== 'divider' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Content
            </label>
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={3}
            />
          </div>
        )}

        {/* Position & Size */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Position & Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        {element.type !== 'divider' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Typography
            </label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                <input
                  type="number"
                  value={element.style?.fontSize || 14}
                  onChange={(e) => updateStyle('fontSize', parseInt(e.target.value) || 14)}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
                <select
                  value={element.style?.fontWeight || 'normal'}
                  onChange={(e) => updateStyle('fontWeight', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="600">Semi-Bold</option>
                  <option value="300">Light</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.style?.color || '#000000'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="w-12 h-8 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={element.style?.color || '#000000'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Background & Border */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Background & Border
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Background</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={element.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-12 h-8 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={element.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                />
              </div>
            </div>
            {element.type !== 'divider' && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Border Width</label>
                  <input
                    type="number"
                    value={element.style?.borderWidth || 0}
                    onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    min="0"
                  />
                </div>
                {(element.style?.borderWidth || 0) > 0 && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Border Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={element.style?.borderColor || '#cccccc'}
                        onChange={(e) => updateStyle('borderColor', e.target.value)}
                        className="w-12 h-8 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={element.style?.borderColor || '#cccccc'}
                        onChange={(e) => updateStyle('borderColor', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Padding */}
        {element.type !== 'divider' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Padding
            </label>
            <input
              type="number"
              value={element.style?.padding || 4}
              onChange={(e) => updateStyle('padding', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border rounded text-sm"
              min="0"
            />
          </div>
        )}

        {/* Field Mapping (for field type) */}
        {element.type === 'field' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Map to Contract Field
            </label>
            <select
              value={element.fieldKey || ''}
              onChange={(e) => onUpdate({ fieldKey: e.target.value })}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="">None</option>
              <option value="personalDetails.fullName">Full Name</option>
              <option value="personalDetails.nationality">Nationality</option>
              <option value="position">Position</option>
              <option value="vesselDetails.vesselName">Vessel Name</option>
              <option value="wageBreakdown.basicWages">Basic Wages</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
