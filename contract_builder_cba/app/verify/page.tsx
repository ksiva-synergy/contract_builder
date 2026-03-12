"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SignatureResult {
  signerName: string;
  signerEmail: string;
  signatureType: string;
  signedAt: string;
  hashMatch: boolean;
}

interface AuditEntry {
  action: string;
  userName: string | null;
  timestamp: string;
}

interface VerificationResult {
  isValid: boolean;
  contractNumber: string;
  status: string;
  tampered: boolean;
  signatures: SignatureResult[];
  auditLog: AuditEntry[];
}

export default function VerifyPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  async function handleVerify() {
    if (!query.trim()) {
      toast.error("Please enter a contract number or ID");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const isUuid = /^[0-9a-f]{8}-/.test(query.trim());
      const body = isUuid
        ? { contractId: query.trim() }
        : { contractNumber: query.trim() };

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setResult(await res.json());
      } else {
        const data = await res.json();
        toast.error(data.error || "Verification failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Digital Signature Verifier
        </h1>
        <p className="text-muted-foreground mt-1">
          Verify the integrity and authenticity of digitally signed contracts
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter contract number or contract ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleVerify} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Verify
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <Card
            className={
              result.isValid
                ? "border-emerald-500/50"
                : "border-destructive/50"
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {result.isValid ? (
                  <div className="p-3 rounded-full bg-emerald-500/10">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                ) : (
                  <div className="p-3 rounded-full bg-destructive/10">
                    <ShieldAlert className="w-8 h-8 text-destructive" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">
                    {result.isValid
                      ? "Signature Valid"
                      : result.tampered
                      ? "Tampering Detected"
                      : "No Valid Signatures"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Contract #{result.contractNumber} &middot;{" "}
                    <Badge variant="secondary">{result.status}</Badge>
                  </p>
                  {result.tampered && (
                    <p className="text-sm text-destructive mt-2">
                      The contract data has been modified after signing. The
                      stored hash does not match the current contract data.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signatures */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Signatures ({result.signatures.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.signatures.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No signatures found for this contract
                </p>
              ) : (
                <div className="space-y-3">
                  {result.signatures.map((sig, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {sig.hashMatch ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {sig.signerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sig.signerEmail}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={sig.hashMatch ? "success" : "destructive"}
                        >
                          {sig.hashMatch ? "Valid" : "Invalid"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(sig.signedAt).toLocaleString()} &middot;{" "}
                          {sig.signatureType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Audit Trail ({result.auditLog.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.auditLog.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No audit records found
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-3">
                    {result.auditLog.map((entry, i) => (
                      <div key={i} className="flex gap-3 relative">
                        <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 bg-muted-foreground/30" />
                        <div>
                          <p className="text-sm font-medium">{entry.action}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {entry.userName && (
                              <>
                                <UserIcon className="w-3 h-3" />
                                <span>{entry.userName}</span>
                                <span>&middot;</span>
                              </>
                            )}
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
