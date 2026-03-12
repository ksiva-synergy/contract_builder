"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Paperclip,
  Download,
  Trash2,
  Upload,
  FileText,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  createdAt: string;
}

interface DocumentAttachmentsProps {
  contractId: string;
}

export default function DocumentAttachments({
  contractId,
}: DocumentAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/attachments`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append("files", file));

      const res = await fetch(`/api/contracts/${contractId}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success(
          `Uploaded ${fileArray.length} file${fileArray.length > 1 ? "s" : ""}`
        );
        fetchAttachments();
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      handleUpload(e.dataTransfer.files);
    },
    [contractId]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = (attachment: Attachment) => {
    window.open(
      `/api/contracts/${contractId}/attachments/${attachment.id}`,
      "_blank"
    );
  };

  const handleDelete = async (attachment: Attachment) => {
    setDeletingId(attachment.id);
    try {
      const res = await fetch(
        `/api/contracts/${contractId}/attachments/${attachment.id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        toast.success("Attachment deleted");
        setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Attachments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or
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
                onChange={handleFileInput}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Attachments List */}
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading attachments...
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No attachments yet</p>
          </div>
        ) : (
          <div className="divide-y border rounded-lg">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 px-3 py-3"
              >
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.fileName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatSize(attachment.fileSize)}</span>
                    {attachment.uploadedByName && (
                      <>
                        <span>&middot;</span>
                        <span>{attachment.uploadedByName}</span>
                      </>
                    )}
                    <span>&middot;</span>
                    <span>{formatDate(attachment.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment)}
                    disabled={deletingId === attachment.id}
                    title="Delete"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    {deletingId === attachment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
