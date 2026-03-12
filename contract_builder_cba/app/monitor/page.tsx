"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Clock,
  FileCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  PenTool,
  Eye,
  Loader2,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  total: number;
  pendingReview: number;
  pendingSigning: number;
  partiallySigned: number;
  signed: number;
  cancelled: number;
  recentActivity: AuditEntry[];
}

interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  userName?: string;
  contractId?: string;
  contractNumber?: string;
  details?: string;
  createdAt: string;
}

interface ContractListItem {
  id: string;
  contractNumber: string;
  personalDetails: { fullName: string };
  vesselDetails: { vesselName: string };
  status?: string;
  createdAt: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive" | "secondary";
    color: string;
    bgColor: string;
  }
> = {
  DRAFT: { label: "Draft", variant: "secondary", color: "bg-gray-500", bgColor: "bg-gray-100 dark:bg-gray-800" },
  PENDING_REVIEW: { label: "Pending Review", variant: "warning", color: "bg-amber-500", bgColor: "bg-amber-100 dark:bg-amber-900" },
  PENDING_SIGNING: { label: "Pending Signing", variant: "default", color: "bg-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900" },
  PARTIALLY_SIGNED: { label: "Partially Signed", variant: "warning", color: "bg-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900" },
  SIGNED: { label: "Signed", variant: "success", color: "bg-emerald-500", bgColor: "bg-emerald-100 dark:bg-emerald-900" },
  CANCELLED: { label: "Cancelled", variant: "destructive", color: "bg-red-500", bgColor: "bg-red-100 dark:bg-red-900" },
};

const actionColors: Record<string, string> = {
  CREATED: "bg-blue-500",
  UPDATED: "bg-sky-500",
  SUBMITTED: "bg-amber-500",
  SIGNED: "bg-emerald-500",
  APPROVED: "bg-green-600",
  REJECTED: "bg-red-500",
  CANCELLED: "bg-red-400",
  EXPORTED: "bg-violet-500",
  SEALED: "bg-indigo-500",
};

const statCards = [
  { key: "total" as const, label: "Total", icon: FileText, accent: "text-primary", bg: "bg-primary/10" },
  { key: "pendingReview" as const, label: "Pending Review", icon: Eye, accent: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "pendingSigning" as const, label: "Pending Signing", icon: PenTool, accent: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "partiallySigned" as const, label: "Partially Signed", icon: FileCheck, accent: "text-orange-500", bg: "bg-orange-500/10" },
  { key: "signed" as const, label: "Signed", icon: CheckCircle, accent: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "cancelled" as const, label: "Cancelled", icon: XCircle, accent: "text-red-500", bg: "bg-red-500/10" },
];

export default function MonitorPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchStats();
    fetchContracts();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // API may not be available
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchContracts() {
    try {
      const res = await fetch("/api/contracts");
      if (res.ok) {
        const data = await res.json();
        setContracts(data);
      }
    } catch {
      // API may not be available
    } finally {
      setLoadingContracts(false);
    }
  }

  const derivedStats: DashboardStats = stats || {
    total: contracts.length,
    pendingReview: contracts.filter((c) => c.status === "PENDING_REVIEW").length,
    pendingSigning: contracts.filter((c) => c.status === "PENDING_SIGNING").length,
    partiallySigned: contracts.filter((c) => c.status === "PARTIALLY_SIGNED").length,
    signed: contracts.filter((c) => c.status === "SIGNED").length,
    cancelled: contracts.filter((c) => c.status === "CANCELLED").length,
    recentActivity: [],
  };

  const barTotal = derivedStats.total || 1;
  const barSegments = [
    { key: "pendingReview", color: "bg-amber-500", count: derivedStats.pendingReview },
    { key: "pendingSigning", color: "bg-blue-500", count: derivedStats.pendingSigning },
    { key: "partiallySigned", color: "bg-orange-500", count: derivedStats.partiallySigned },
    { key: "signed", color: "bg-emerald-500", count: derivedStats.signed },
    { key: "cancelled", color: "bg-red-500", count: derivedStats.cancelled },
    {
      key: "draft",
      color: "bg-gray-400",
      count: derivedStats.total - derivedStats.pendingReview - derivedStats.pendingSigning - derivedStats.partiallySigned - derivedStats.signed - derivedStats.cancelled,
    },
  ].filter((s) => s.count > 0);

  const filteredContracts =
    statusFilter === "all"
      ? contracts
      : contracts.filter((c) => (c.status || "DRAFT") === statusFilter);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitor</h1>
        <p className="text-muted-foreground mt-1">
          Real-time overview of contracts and activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.accent}`} />
                </div>
                <div>
                  {loadingStats ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {derivedStats[card.key]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <Skeleton className="h-8 w-full rounded-full" />
          ) : (
            <>
              <div className="flex rounded-full overflow-hidden h-8">
                {barSegments.map((seg) => (
                  <div
                    key={seg.key}
                    className={`${seg.color} flex items-center justify-center text-xs text-white font-medium transition-all`}
                    style={{
                      width: `${(seg.count / barTotal) * 100}%`,
                      minWidth: seg.count > 0 ? "24px" : "0",
                    }}
                    title={`${seg.key}: ${seg.count}`}
                  >
                    {(seg.count / barTotal) * 100 > 8 ? seg.count : ""}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                {barSegments.map((seg) => (
                  <div key={seg.key} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                    <span className="text-muted-foreground capitalize">
                      {seg.key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-medium">{seg.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : derivedStats.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {derivedStats.recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 py-2 border-b last:border-0"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      actionColors[entry.action] || "bg-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {entry.userName || entry.userId}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {entry.action.toLowerCase().replace(/_/g, " ")}
                      </span>
                      {entry.contractNumber && (
                        <>
                          {" "}
                          <Link
                            href={`/contracts/${entry.contractId}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {entry.contractNumber}
                          </Link>
                        </>
                      )}
                    </p>
                    {entry.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.details}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatTime(entry.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Documents</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "DRAFT", label: "Draft" },
                { value: "PENDING_REVIEW", label: "Pending Review" },
                { value: "PENDING_SIGNING", label: "Pending Signing" },
                { value: "PARTIALLY_SIGNED", label: "Partially Signed" },
                { value: "SIGNED", label: "Signed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingContracts ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No contracts found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter !== "all"
                  ? "Try changing the status filter"
                  : "No contracts have been created yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Contract #
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Seafarer
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Vessel
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredContracts.map((contract) => {
                    const sc = statusConfig[contract.status || "DRAFT"];
                    return (
                      <tr
                        key={contract.id}
                        className="hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/contracts/${contract.id}`)
                        }
                      >
                        <td className="p-3 text-sm font-medium">
                          {contract.contractNumber || "—"}
                        </td>
                        <td className="p-3 text-sm">
                          {contract.personalDetails?.fullName || "—"}
                        </td>
                        <td className="p-3 text-sm">
                          {contract.vesselDetails?.vesselName || "—"}
                        </td>
                        <td className="p-3">
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatDate(contract.createdAt)}
                        </td>
                        <td className="p-3">
                          <Link href={`/contracts/${contract.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
