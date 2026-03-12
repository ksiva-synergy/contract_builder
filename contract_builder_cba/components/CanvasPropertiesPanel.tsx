"use client";

import { useState } from "react";
import type { CanvasElement } from "./CanvasEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Trash2, ArrowUp, ArrowDown, Lock, Unlock } from "lucide-react";

interface CanvasPropertiesPanelProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
  onDelete: () => void;
  onMoveLayer: (direction: "up" | "down") => void;
}

const FIELD_MAPPINGS = [
  { value: "", label: "— None —" },
  { value: "personalDetails.fullName", label: "Full Name" },
  { value: "personalDetails.dateOfBirth", label: "Date of Birth" },
  { value: "personalDetails.age", label: "Age" },
  { value: "personalDetails.nationality", label: "Nationality" },
  { value: "personalDetails.cdcNumber", label: "CDC Number" },
  { value: "personalDetails.address", label: "Address" },
  { value: "crewCode", label: "Crew Code" },
  { value: "position", label: "Position" },
  { value: "placeOfBirth", label: "Place of Birth" },
  { value: "ppNumber", label: "PP Number" },
  { value: "vesselDetails.vesselName", label: "Vessel Name" },
  { value: "vesselDetails.imoNumber", label: "IMO Number" },
  { value: "vesselDetails.registeredOwner", label: "Registered Owner" },
  { value: "vesselDetails.portOfRegistry", label: "Port of Registry" },
  { value: "contractTerms.contractTerm", label: "Contract Term" },
  { value: "contractTerms.contractStartDate", label: "Start Date" },
  { value: "contractTerms.contractExpiryDate", label: "Expiry Date" },
  { value: "contractTerms.placeOfEngagement", label: "Place of Engagement" },
  { value: "wageBreakdown.basicWages", label: "Basic Wages" },
  { value: "wageBreakdown.fixedOvertime", label: "Fixed Overtime" },
  { value: "wageBreakdown.totalMonthlySalary", label: "Total Monthly Salary" },
  { value: "contractNumber", label: "Contract Number" },
  { value: "effectiveFrom", label: "Effective From" },
];

const TABS = ["Style", "Position", "Data"];

export default function CanvasPropertiesPanel({ element, onUpdate, onClose, onDelete, onMoveLayer }: CanvasPropertiesPanelProps) {
  const [tab, setTab] = useState("Style");

  const updateStyle = (key: string, value: string | number | undefined) => {
    onUpdate({ style: { ...element.style, [key]: value } });
  };

  return (
    <div className="w-64 bg-card border-l overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm capitalize">{element.type}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdate({ locked: !element.locked })} title={element.locked ? "Unlock" : "Lock"}>
            {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {TABS.map((t) => (
          <button
            key={t}
            className={`flex-1 py-2 text-xs font-medium transition-colors cursor-pointer ${
              tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-4">
        {tab === "Style" && (
          <>
            {element.type !== "divider" && element.type !== "pagebreak" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Content</Label>
                  <textarea
                    className="w-full text-sm border rounded p-2 bg-background min-h-[60px] resize-y"
                    value={element.content}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Font Size</Label>
                    <Input type="number" className="h-8 text-xs" value={element.style?.fontSize || 12} onChange={(e) => updateStyle("fontSize", parseInt(e.target.value) || 12)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Font Weight</Label>
                    <select className="w-full h-8 text-xs border rounded bg-background px-2" value={element.style?.fontWeight || "normal"} onChange={(e) => updateStyle("fontWeight", e.target.value)}>
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="600">Semi-Bold</option>
                      <option value="300">Light</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Font</Label>
                    <select className="w-full h-8 text-xs border rounded bg-background px-2" value={element.style?.fontFamily || ""} onChange={(e) => updateStyle("fontFamily", e.target.value)}>
                      <option value="">Default</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Align</Label>
                    <select className="w-full h-8 text-xs border rounded bg-background px-2" value={element.style?.textAlign || "left"} onChange={(e) => updateStyle("textAlign", e.target.value)}>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                      <option value="justify">Justify</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <div className="flex gap-1">
                      <input type="color" className="w-8 h-8 rounded border cursor-pointer" value={element.style?.color || "#000000"} onChange={(e) => updateStyle("color", e.target.value)} />
                      <Input className="h-8 text-xs flex-1" value={element.style?.color || "#000000"} onChange={(e) => updateStyle("color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Background</Label>
                    <div className="flex gap-1">
                      <input type="color" className="w-8 h-8 rounded border cursor-pointer" value={element.style?.backgroundColor || "#ffffff"} onChange={(e) => updateStyle("backgroundColor", e.target.value)} />
                      <Input className="h-8 text-xs flex-1" value={element.style?.backgroundColor || ""} onChange={(e) => updateStyle("backgroundColor", e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Line Height</Label>
                  <Input type="number" step="0.1" className="h-8 text-xs" value={element.style?.lineHeight || 1.5} onChange={(e) => updateStyle("lineHeight", parseFloat(e.target.value) || 1.5)} />
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Border Width</Label>
                <Input type="number" className="h-8 text-xs" value={element.style?.borderWidth || 0} onChange={(e) => updateStyle("borderWidth", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Padding</Label>
                <Input type="number" className="h-8 text-xs" value={element.style?.padding || 0} onChange={(e) => updateStyle("padding", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </>
        )}

        {tab === "Position" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">X</Label><Input type="number" className="h-8 text-xs" value={element.x} onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-1"><Label className="text-xs">Y</Label><Input type="number" className="h-8 text-xs" value={element.y} onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-1"><Label className="text-xs">Width</Label><Input type="number" className="h-8 text-xs" value={element.width} onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 50 })} /></div>
              <div className="space-y-1"><Label className="text-xs">Height</Label><Input type="number" className="h-8 text-xs" value={element.height} onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 20 })} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Layer Order</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => onMoveLayer("up")}>
                  <ArrowUp className="w-3 h-3 mr-1" /> Bring Forward
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => onMoveLayer("down")}>
                  <ArrowDown className="w-3 h-3 mr-1" /> Send Back
                </Button>
              </div>
            </div>
          </>
        )}

        {tab === "Data" && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Field Mapping</Label>
              <select
                className="w-full h-8 text-xs border rounded bg-background px-2"
                value={element.fieldKey || ""}
                onChange={(e) => onUpdate({ fieldKey: e.target.value || undefined })}
              >
                {FIELD_MAPPINGS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground">
                Map this element to a contract data field for auto-fill
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Element ID</Label>
              <Input className="h-8 text-xs" value={element.id} readOnly />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="pt-4 border-t">
          <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Element
          </Button>
        </div>
      </div>
    </div>
  );
}
