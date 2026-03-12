"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import SignaturePadLib from "signature_pad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eraser, Undo2, Type, PenTool, Upload } from "lucide-react";

type Mode = "draw" | "type" | "upload";

interface SignaturePadProps {
  onSignatureChange: (data: string | null, type: "DRAW" | "TYPE" | "UPLOAD") => void;
}

export function SignaturePad({ onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [mode, setMode] = useState<Mode>("draw");
  const [typedName, setTypedName] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      const pad = new SignaturePadLib(canvas, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });

      pad.addEventListener("endStroke", () => {
        onSignatureChange(pad.toDataURL("image/png"), "DRAW");
      });

      padRef.current = pad;
      return () => {
        pad.off();
      };
    }
  }, [mode, onSignatureChange]);

  const handleClear = useCallback(() => {
    if (mode === "draw" && padRef.current) {
      padRef.current.clear();
      onSignatureChange(null, "DRAW");
    } else if (mode === "type") {
      setTypedName("");
      onSignatureChange(null, "TYPE");
    } else {
      setUploadPreview(null);
      onSignatureChange(null, "UPLOAD");
    }
  }, [mode, onSignatureChange]);

  const handleUndo = useCallback(() => {
    if (mode === "draw" && padRef.current) {
      const data = padRef.current.toData();
      if (data.length > 0) {
        data.pop();
        padRef.current.fromData(data);
        if (data.length === 0) {
          onSignatureChange(null, "DRAW");
        } else {
          onSignatureChange(padRef.current.toDataURL("image/png"), "DRAW");
        }
      }
    }
  }, [mode, onSignatureChange]);

  const handleTypedChange = useCallback(
    (value: string) => {
      setTypedName(value);
      if (value.trim()) {
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 120;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = "italic 36px 'Georgia', serif";
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(value, canvas.width / 2, canvas.height / 2);
          onSignatureChange(canvas.toDataURL("image/png"), "TYPE");
        }
      } else {
        onSignatureChange(null, "TYPE");
      }
    },
    [onSignatureChange]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUploadPreview(dataUrl);
        onSignatureChange(dataUrl, "UPLOAD");
      };
      reader.readAsDataURL(file);
    },
    [onSignatureChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {([
          { id: "draw" as Mode, label: "Draw", icon: PenTool },
          { id: "type" as Mode, label: "Type", icon: Type },
          { id: "upload" as Mode, label: "Upload", icon: Upload },
        ]).map((m) => (
          <Button
            key={m.id}
            variant={mode === m.id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode(m.id);
              onSignatureChange(null, m.id === "draw" ? "DRAW" : m.id === "type" ? "TYPE" : "UPLOAD");
            }}
          >
            <m.icon className="w-4 h-4 mr-1" />
            {m.label}
          </Button>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        {mode === "draw" && (
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ height: 160 }}
          />
        )}

        {mode === "type" && (
          <div className="p-6 flex items-center justify-center" style={{ height: 160 }}>
            {typedName ? (
              <p className="text-4xl italic font-serif text-black">{typedName}</p>
            ) : (
              <p className="text-muted-foreground text-sm">Type your name below</p>
            )}
          </div>
        )}

        {mode === "upload" && (
          <div className="p-6 flex items-center justify-center" style={{ height: 160 }}>
            {uploadPreview ? (
              <img src={uploadPreview} alt="Signature" className="max-h-full max-w-full object-contain" />
            ) : (
              <label className="cursor-pointer text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload signature image</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {mode === "type" ? (
          <Input
            placeholder="Type your full name..."
            value={typedName}
            onChange={(e) => handleTypedChange(e.target.value)}
            className="flex-1"
          />
        ) : (
          <div className="flex-1" />
        )}
        {mode === "draw" && (
          <Button variant="outline" size="sm" onClick={handleUndo}>
            <Undo2 className="w-4 h-4 mr-1" /> Undo
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Eraser className="w-4 h-4 mr-1" /> Clear
        </Button>
      </div>
    </div>
  );
}
