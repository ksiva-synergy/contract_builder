"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckSquare,
  PenTool,
  X,
  Check,
  AlertCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ContractListItem {
  id: string;
  contractNumber: string;
  personalDetails: { fullName: string };
  vesselDetails: { vesselName: string };
  status?: string;
}

interface UploadResult {
  fileName: string;
  success: boolean;
  error?: string;
}

interface SignResult {
  total: number;
  signed: number;
  failed: number;
  errors?: string[];
}

export default function BulkPage() {
  const [tab, setTab] = useState("upload");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Operations</h1>
        <p className="text-muted-foreground mt-1">
          Upload multiple contracts or sign in bulk
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="sign" className="flex-1">
            <PenTool className="w-4 h-4 mr-2" />
            Bulk Sign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <BulkUploadTab />
        </TabsContent>

        <TabsContent value="sign">
          <BulkSignTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BulkUploadTab() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );
    if (droppedFiles.length === 0) {
      toast.error("Only PDF files are accepted");
      return;
    }
    setFiles((prev) => [...prev, ...droppedFiles]);
    setResults(null);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...selected]);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResults(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/bulk/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        const successCount = (data.results || []).filter(
          (r: UploadResult) => r.success
        ).length;
        toast.success(`Uploaded ${successCount} of ${files.length} files`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload PDF Contracts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">
              Drag and drop PDF files here
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              or click below to browse
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                    setResults(null);
                  }}
                >
                  Clear all
                </Button>
              </div>
              <div className="divide-y border rounded-lg">
                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file.size)}
                      </p>
                    </div>
                    {results && results[i] && (
                      <Badge
                        variant={results[i].success ? "success" : "destructive"}
                      >
                        {results[i].success ? "Uploaded" : "Failed"}
                      </Badge>
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="p-1 hover:bg-muted rounded-md cursor-pointer"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleUploadAll}
            disabled={files.length === 0 || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload All ({files.length})
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>
                  {results.filter((r) => r.success).length} succeeded
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{results.filter((r) => !r.success).length} failed</span>
              </div>
            </div>
            {results.some((r) => !r.success) && (
              <div className="space-y-1">
                {results
                  .filter((r) => !r.success)
                  .map((r, i) => (
                    <div
                      key={i}
                      className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded px-3 py-2"
                    >
                      <span className="font-medium">{r.fileName}:</span>{" "}
                      {r.error || "Unknown error"}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BulkSignTab() {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [signing, setSigning] = useState(false);
  const [signResult, setSignResult] = useState<SignResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    try {
      const res = await fetch("/api/contracts");
      if (res.ok) {
        const data: ContractListItem[] = await res.json();
        const signable = data.filter(
          (c) =>
            c.status === "PENDING_SIGNING" || c.status === "PARTIALLY_SIGNED"
        );
        setContracts(signable);
      }
    } catch {
      toast.error("Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  }

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setHasSignature(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === contracts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contracts.map((c) => c.id)));
    }
  };

  const handleSignSelected = async () => {
    if (selected.size === 0 || !hasSignature) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL("image/png");

    setSigning(true);
    setSignResult(null);

    try {
      const res = await fetch("/api/bulk/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractIds: Array.from(selected),
          signatureData,
          signatureType: "DRAW",
        }),
      });

      if (res.ok) {
        const data: SignResult = await res.json();
        setSignResult(data);
        toast.success(`Signed ${data.signed} contract(s)`);
        fetchContracts();
        setSelected(new Set());
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Bulk signing failed");
      }
    } catch {
      toast.error("Signing failed. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Select Contracts to Sign
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading contracts...
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No contracts pending signature</p>
              <p className="text-xs text-muted-foreground mt-1">
                All contracts have been signed or none are awaiting signatures
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selected.size === contracts.length && contracts.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded"
                />
                <span className="text-sm font-medium">
                  Select All ({contracts.length})
                </span>
              </label>
              <div className="divide-y border rounded-lg max-h-72 overflow-y-auto">
                {contracts.map((contract) => (
                  <label
                    key={contract.id}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(contract.id)}
                      onChange={() => toggleSelect(contract.id)}
                      className="rounded"
                    />
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {contract.contractNumber || "No number"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {contract.personalDetails?.fullName || "Unknown"} &middot;{" "}
                        {contract.vesselDetails?.vesselName || "No vessel"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        contract.status === "PARTIALLY_SIGNED"
                          ? "warning"
                          : "default"
                      }
                    >
                      {contract.status === "PARTIALLY_SIGNED"
                        ? "Partial"
                        : "Pending"}
                    </Badge>
                  </label>
                ))}
              </div>
              {selected.size > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selected.size} contract{selected.size > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={600}
              height={180}
              className="w-full touch-none"
              style={{ height: "180px" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
            {hasSignature && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Signature captured
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSignSelected}
        disabled={selected.size === 0 || !hasSignature || signing}
        className="w-full"
        size="lg"
      >
        {signing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing...
          </>
        ) : (
          <>
            <PenTool className="w-4 h-4 mr-2" />
            Sign Selected ({selected.size})
          </>
        )}
      </Button>

      {signResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Signing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <Check className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {signResult.signed}
                  </p>
                  <p className="text-xs text-emerald-600">Signed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {signResult.failed}
                  </p>
                  <p className="text-xs text-red-600">Failed</p>
                </div>
              </div>
            </div>
            {signResult.errors && signResult.errors.length > 0 && (
              <div className="mt-4 space-y-1">
                {signResult.errors.map((err, i) => (
                  <p
                    key={i}
                    className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded px-3 py-2"
                  >
                    {err}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
