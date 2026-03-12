"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PenTool, Type, Upload, RotateCcw, Check } from "lucide-react";

interface SignatureCaptureProps {
  value?: string;
  onChange: (signature: string) => void;
}

const CURSIVE_FONTS = [
  "Dancing Script",
  "Great Vibes",
  "Pacifico",
  "Satisfy",
  "Caveat",
];

export default function SignatureCapture({ value, onChange }: SignatureCaptureProps) {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [mode, setMode] = useState("draw");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("cursive");

  const handleClear = () => {
    sigRef.current?.clear();
    onChange("");
  };

  const handleDrawEnd = () => {
    if (sigRef.current) {
      const data = sigRef.current.toDataURL("image/png");
      onChange(data);
    }
  };

  const handleTypeSign = () => {
    if (typedName) {
      onChange(`typed:${selectedFont}:${typedName}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="w-full">
          <TabsTrigger value="draw" className="flex-1">
            <PenTool className="w-3.5 h-3.5 mr-1.5" /> Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="flex-1">
            <Type className="w-3.5 h-3.5 mr-1.5" /> Type
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw">
          <div className="space-y-3">
            <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white">
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 150,
                  className: "w-full",
                  style: { width: "100%", height: "150px" },
                }}
                onEnd={handleDrawEnd}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClear}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
              {value && (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="w-3.5 h-3.5" /> Signature captured
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="type">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Font Style</Label>
              <div className="grid grid-cols-1 gap-2">
                {["cursive", "serif", "sans-serif"].map((font) => (
                  <button
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    className={`p-3 border rounded-lg text-left transition-colors cursor-pointer ${
                      selectedFont === font ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span style={{ fontFamily: font, fontSize: "20px" }}>
                      {typedName || "Your Signature"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <Button size="sm" onClick={handleTypeSign} disabled={!typedName}>
              <Check className="w-3.5 h-3.5 mr-1" /> Apply Signature
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <div className="space-y-3">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Upload a signature image</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>
            {value && value.startsWith("data:image") && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Signature uploaded
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
