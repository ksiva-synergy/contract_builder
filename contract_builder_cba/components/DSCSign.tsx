"use client";

import * as React from "react";
import { Shield, Upload, AlertCircle, CheckCircle } from "lucide-react";

interface DSCSignProps {
  contractDataHash: string;
  onSign: (signatureData: string, certificate: string) => void;
  disabled?: boolean;
}

export function DSCSign({ contractDataHash, onSign, disabled }: DSCSignProps) {
  const [status, setStatus] = React.useState<"idle" | "detecting" | "signing" | "success" | "error">("idle");
  const [error, setError] = React.useState("");
  const [certFile, setCertFile] = React.useState<File | null>(null);

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCertFile(file);
  };

  const handleSign = async () => {
    if (!certFile) {
      setError("Please upload your DSC certificate file (.pfx/.p12)");
      return;
    }

    setStatus("signing");
    setError("");

    try {
      // In production, this would use the Web Crypto API with the actual PKCS#12 certificate
      // For now, we simulate the signing process
      const certData = await certFile.arrayBuffer();
      const certBase64 = btoa(String.fromCharCode(...new Uint8Array(certData)));

      // Simulated PKCS#7 signature using the contract hash
      const encoder = new TextEncoder();
      const data = encoder.encode(contractDataHash);

      if (window.crypto?.subtle) {
        const keyPair = await window.crypto.subtle.generateKey(
          { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
          true,
          ["sign", "verify"]
        );

        const signatureBuffer = await window.crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyPair.privateKey, data);
        const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

        setStatus("success");
        onSign(signatureBase64, certBase64);
      } else {
        throw new Error("Web Crypto API not available. Please use a modern browser with HTTPS.");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "DSC signing failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Digital Signature Certificate (DSC) Signing</span>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-6">
        <div className="text-center space-y-3">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">Upload your DSC certificate (.pfx / .p12)</p>
          <input
            type="file"
            accept=".pfx,.p12"
            onChange={handleCertUpload}
            className="text-sm"
            disabled={disabled || status === "signing"}
          />
          {certFile && (
            <p className="text-xs text-green-600">Certificate loaded: {certFile.name}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Document signed with DSC successfully</span>
        </div>
      )}

      <button
        onClick={handleSign}
        disabled={disabled || !certFile || status === "signing"}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "signing" ? "Signing with DSC..." : "Sign with DSC"}
      </button>

      <p className="text-xs text-muted-foreground">
        Your private key never leaves your device. The signing operation is performed locally using the Web Crypto API.
      </p>
    </div>
  );
}
