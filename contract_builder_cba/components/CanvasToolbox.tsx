'use client';

import { CanvasElement } from './CanvasEditor';

interface CanvasToolboxProps {
  onAddElement: (type: CanvasElement['type']) => void;
}

const tools = [
  { type: 'heading' as const, icon: '📝', label: 'Heading', description: 'Section title' },
  { type: 'text' as const, icon: '📄', label: 'Text', description: 'Paragraph text' },
  { type: 'field' as const, icon: '📋', label: 'Field', description: 'Input field' },
  { type: 'table' as const, icon: '📊', label: 'Table', description: 'Data table' },
  { type: 'signature' as const, icon: '✍️', label: 'Signature', description: 'Signature line' },
  { type: 'divider' as const, icon: '➖', label: 'Divider', description: 'Horizontal line' },
];

export default function CanvasToolbox({ onAddElement }: CanvasToolboxProps) {
  return (
    <div className="w-64 bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Elements</h2>
        <p className="text-xs text-gray-500 mt-1">Drag or click to add</p>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => onAddElement(tool.type)}
              className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left group"
            >
              <span className="text-2xl">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{tool.label}</div>
                <div className="text-xs text-gray-500">{tool.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Contract Templates Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-sm mb-3">Quick Templates</h3>
          <div className="space-y-2">
            <button className="w-full p-2 text-sm border rounded hover:bg-gray-50 text-left">
              📑 Personal Details Section
            </button>
            <button className="w-full p-2 text-sm border rounded hover:bg-gray-50 text-left">
              🚢 Vessel Information
            </button>
            <button className="w-full p-2 text-sm border rounded hover:bg-gray-50 text-left">
              💰 Wage Breakdown Table
            </button>
            <button className="w-full p-2 text-sm border rounded hover:bg-gray-50 text-left">
              📅 Contract Terms
            </button>
          </div>
        </div>
      </div>

      {/* Footer Tips */}
      <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
        <div className="space-y-1">
          <div>💡 <span className="font-medium">Tip:</span> Click to add elements</div>
          <div>⌨️ <span className="font-medium">Delete:</span> Select + Del key</div>
          <div>🖱️ <span className="font-medium">Move:</span> Drag elements</div>
        </div>
      </div>
    </div>
  );
}
