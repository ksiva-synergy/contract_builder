"use client";

import { useState, useCallback } from "react";
import { SignaturePad } from "./SignaturePad";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

interface SigningModalProps {
  contractId: string;
  contractNumber: string;
  onClose: () => void;
  onSigned: () => void;
}

export function SigningModal({
  contractId,
  contractNumber,
  onClose,
  onSigned,
}: SigningModalProps) {
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signatureType, setSignatureType] = useState<"DRAW" | "TYPE" | "UPLOAD">("DRAW");
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSignatureChange = useCallback(
    (data: string | null, type: "DRAW" | "TYPE" | "UPLOAD") => {
      setSignatureData(data);
      setSignatureType(type);
    },
    []
  );

  async function handleSign() {
    if (!signatureData) {
      toast.error("Please provide your signature");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the terms before signing");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/signing/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          signatureData,
          signatureType,
        }),
      });

      if (res.ok) {
        toast.success("Contract signed successfully");
        onSigned();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to sign contract");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Sign Contract</h2>
            <p className="text-sm text-muted-foreground">
              Contract #{contractNumber}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-muted/50 border rounded-lg">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Legally binding signature</p>
                <p className="text-muted-foreground mt-1">
                  By signing this contract, you confirm that you have reviewed
                  all terms and conditions and agree to be bound by them.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">
              Your Signature
            </label>
            <SignaturePad onSignatureChange={handleSignatureChange} />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded"
            />
            <span className="text-sm text-muted-foreground">
              I confirm that I have read and understood the terms of this
              contract and I agree to sign it electronically.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!signatureData || !agreed || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing...
              </>
            ) : (
              "Sign Contract"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
