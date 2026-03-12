"use client";

import { Type, Heading1, FormInput, Table2, PenTool, Minus, Image, CheckSquare, BookOpen, SeparatorHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CanvasElement } from "./CanvasEditor";

interface CanvasToolboxProps {
  onAddElement: (type: CanvasElement["type"]) => void;
}

const TOOL_GROUPS = [
  {
    label: "Text",
    items: [
      { type: "heading" as const, label: "Heading", icon: Heading1 },
      { type: "text" as const, label: "Text Block", icon: Type },
    ],
  },
  {
    label: "Fields",
    items: [
      { type: "field" as const, label: "Input Field", icon: FormInput },
      { type: "checkbox" as const, label: "Checkbox", icon: CheckSquare },
      { type: "signature" as const, label: "Signature", icon: PenTool },
    ],
  },
  {
    label: "Layout",
    items: [
      { type: "table" as const, label: "Table", icon: Table2 },
      { type: "divider" as const, label: "Divider", icon: Minus },
      { type: "image" as const, label: "Image", icon: Image },
      { type: "pagebreak" as const, label: "Page Break", icon: SeparatorHorizontal },
    ],
  },
  {
    label: "Content",
    items: [
      { type: "clause" as const, label: "Clause Block", icon: BookOpen },
    ],
  },
];

export default function CanvasToolbox({ onAddElement }: CanvasToolboxProps) {
  return (
    <div className="w-56 bg-card border-r overflow-y-auto">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Elements</h3>
        <p className="text-xs text-muted-foreground">Click to add to canvas</p>
      </div>
      <div className="p-2 space-y-4">
        {TOOL_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Button
                  key={item.type}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-9 text-xs"
                  onClick={() => onAddElement(item.type)}
                >
                  <item.icon className="w-4 h-4 mr-2 shrink-0" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
