"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Eye,
  PenTool,
  Save,
  Send,
  CheckCircle2,
  XCircle,
  PenLine,
  Users,
  History,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { EmploymentContract } from "@/types/contract";
import { createEmptyContract } from "@/lib/contract-utils";
import CanvasEditor from "@/components/CanvasEditor";
import ContractForm from "@/components/ContractForm";
import ContractPreview from "@/components/ContractPreview";
import { SigningModal } from "@/components/SigningModal";
import { AuditTrail } from "@/components/AuditTrail";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive" | "secondary";
  }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  PENDING_SIGNING: { label: "Pending Signing", variant: "default" },
  PARTIALLY_SIGNED: { label: "Partially Signed", variant: "warning" },
  SIGNED: { label: "Signed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

interface Assignment {
  id: string;
  role: string;
  orderIndex: number;
  isCompleted: boolean;
  completedAt: string | null;
  user: { id: string; name: string; email: string };
}

interface SignatureEntry {
  id: string;
  signatureType: string;
  signedAt: string;
  signer: { name: string; email: string };
}

interface AuditEntry {
  id: string;
  action: string;
  details: Record<string, string> | null;
  ipAddress: string | null;
  timestamp: string;
  user: { name: string; email: string } | null;
}

interface AvailableUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [contract, setContract] = useState<EmploymentContract>(
    createEmptyContract()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("form");
  const [status, setStatus] = useState("DRAFT");
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [signatures, setSignatures] = useState<SignatureEntry[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<AvailableUser[]>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState<"SIGNER" | "REVIEWER">("SIGNER");
  const [transitioning, setTransitioning] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/contracts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setContract(data);
          setStatus(data.status || "DRAFT");
        }
      } catch {
        toast.error("Failed to load contract");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const loadSigningStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/signing/${id}/status`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
        setSignatures(data.signatures || []);
        if (data.status) setStatus(data.status);
      }
    } catch {
      /* ignore */
    }
  }, [id]);

  const loadAuditLog = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await fetch(`/api/contracts/${id}/audit`);
      if (res.ok) {
        const data = await res.json();
        setAuditEntries(data);
      }
    } catch {
      /* ignore */
    } finally {
      setAuditLoading(false);
    }
  }, [id]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        setAllUsers(await res.json());
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      loadSigningStatus();
      loadAuditLog();
    }
  }, [loading, loadSigningStatus, loadAuditLog]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contract),
      });
      if (res.ok) {
        toast.success("Contract saved");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }, [id, contract]);

  const handleStatusTransition = useCallback(
    async (newStatus: string) => {
      setTransitioning(true);
      try {
        const res = await fetch(`/api/contracts/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          setStatus(newStatus);
          toast.success(`Contract status updated to ${statusConfig[newStatus]?.label || newStatus}`);
          loadAuditLog();
          loadSigningStatus();
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to update status");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setTransitioning(false);
      }
    },
    [id, loadAuditLog, loadSigningStatus]
  );

  const handleReview = useCallback(
    async (action: "APPROVE" | "RETURN") => {
      setTransitioning(true);
      try {
        const res = await fetch("/api/signing/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractId: id, action }),
        });
        if (res.ok) {
          toast.success(action === "APPROVE" ? "Contract approved" : "Contract returned to draft");
          const data = await res.json();
          setStatus(data.contract?.status || status);
          loadSigningStatus();
          loadAuditLog();
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to review");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setTransitioning(false);
      }
    },
    [id, status, loadSigningStatus, loadAuditLog]
  );

  const handleAssign = useCallback(async () => {
    if (!assignUserId) return;
    try {
      const res = await fetch("/api/signing/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: id,
          assignments: [
            {
              userId: assignUserId,
              role: assignRole,
              orderIndex: assignments.filter((a) => a.role === assignRole).length,
            },
          ],
        }),
      });
      if (res.ok) {
        toast.success("User assigned");
        setShowAssignForm(false);
        setAssignUserId("");
        loadSigningStatus();
        loadAuditLog();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to assign");
      }
    } catch {
      toast.error("Network error");
    }
  }, [id, assignUserId, assignRole, assignments, loadSigningStatus, loadAuditLog]);

  const handleDownloadPdf = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/contracts/${id}/pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contract-${contract.contractNumber || id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded");
      } else {
        toast.error("Failed to generate PDF");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDownloading(false);
    }
  }, [id, contract.contractNumber]);

  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  const isMySigningTurn =
    (status === "PENDING_SIGNING" || status === "PARTIALLY_SIGNED") &&
    assignments.some(
      (a) => a.user.id === userId && a.role === "SIGNER" && !a.isCompleted
    );
  const isMyReviewTurn =
    status === "PENDING_REVIEW" &&
    assignments.some(
      (a) => a.user.id === userId && a.role === "REVIEWER" && !a.isCompleted
    );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const statusInfo = statusConfig[status] || statusConfig.DRAFT;

  if (tab === "canvas") {
    return (
      <div className="h-[calc(100vh-8rem)] -m-6">
        <div className="bg-card border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setTab("form")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Form
            </Button>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setTab("preview")}>
              <Eye className="w-4 h-4 mr-1" /> Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        <CanvasEditor contract={contract} onChange={setContract} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contracts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {contract.personalDetails?.fullName || "Unnamed Contract"}
              </h1>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Contract #{contract.contractNumber || "\u2014"} &middot;{" "}
              {contract.vesselDetails?.vesselName || "No vessel"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {status === "DRAFT" && (
            <>
              <Button variant="outline" onClick={() => setTab("canvas")}>
                <PenTool className="w-4 h-4 mr-2" /> Canvas Editor
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusTransition("PENDING_REVIEW")}
                disabled={transitioning}
              >
                <Send className="w-4 h-4 mr-2" /> Submit for Review
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />{" "}
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
          {isMyReviewTurn && (
            <>
              <Button
                variant="outline"
                onClick={() => handleReview("RETURN")}
                disabled={transitioning}
              >
                <XCircle className="w-4 h-4 mr-2" /> Return to Draft
              </Button>
              <Button
                onClick={() => handleReview("APPROVE")}
                disabled={transitioning}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
              </Button>
            </>
          )}
          {isMySigningTurn && (
            <Button onClick={() => setShowSigningModal(true)}>
              <PenLine className="w-4 h-4 mr-2" /> Sign Contract
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            PDF
          </Button>
          {status === "DRAFT" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusTransition("CANCELLED")}
              disabled={transitioning}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="form">Form Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="signing">
            Signing ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="audit">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <ContractForm contract={contract} onChange={setContract} />
        </TabsContent>

        <TabsContent value="preview">
          <ContractPreview contract={contract} />
          {signatures.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Signatures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {signatures.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <p className="text-sm font-medium">{sig.signer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sig.signer.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Signed: {new Date(sig.signedAt).toLocaleString()} (
                        {sig.signatureType})
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="signing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reviewers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Reviewers</CardTitle>
                {status === "DRAFT" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAssignRole("REVIEWER");
                      setShowAssignForm(true);
                      loadUsers();
                    }}
                  >
                    <Users className="w-4 h-4 mr-1" /> Assign
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {assignments.filter((a) => a.role === "REVIEWER").length ===
                0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reviewers assigned
                  </p>
                ) : (
                  <div className="space-y-3">
                    {assignments
                      .filter((a) => a.role === "REVIEWER")
                      .map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {a.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.user.email}
                            </p>
                          </div>
                          <Badge
                            variant={a.isCompleted ? "success" : "secondary"}
                          >
                            {a.isCompleted ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Signers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Signers</CardTitle>
                {(status === "DRAFT" || status === "PENDING_REVIEW") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAssignRole("SIGNER");
                      setShowAssignForm(true);
                      loadUsers();
                    }}
                  >
                    <Users className="w-4 h-4 mr-1" /> Assign
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {assignments.filter((a) => a.role === "SIGNER").length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No signers assigned
                  </p>
                ) : (
                  <div className="space-y-3">
                    {assignments
                      .filter((a) => a.role === "SIGNER")
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {a.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.user.email}
                            </p>
                          </div>
                          <Badge
                            variant={a.isCompleted ? "success" : "secondary"}
                          >
                            {a.isCompleted ? "Signed" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4" /> Activity Log
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={loadAuditLog}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <AuditTrail entries={auditEntries} loading={auditLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Assign {assignRole === "SIGNER" ? "Signer" : "Reviewer"}
            </h3>
            <div className="space-y-2">
              <Label>Select User</Label>
              <select
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Choose a user...</option>
                {allUsers
                  .filter(
                    (u) =>
                      !assignments.some(
                        (a) => a.user.id === u.id && a.role === assignRole
                      )
                  )
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAssignForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={!assignUserId}>
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Signing Modal */}
      {showSigningModal && (
        <SigningModal
          contractId={id}
          contractNumber={contract.contractNumber || ""}
          onClose={() => setShowSigningModal(false)}
          onSigned={() => {
            setShowSigningModal(false);
            loadSigningStatus();
            loadAuditLog();
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
