"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PenTool,
  ArrowRight,
  Download,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ContractSummary {
  id: string;
  contractNumber: string;
  personalDetails: { fullName: string };
  vesselDetails: { vesselName: string };
  position: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  PENDING_SIGNING: { label: "Pending Signing", variant: "default" },
  PARTIALLY_SIGNED: { label: "Partially Signed", variant: "warning" },
  SIGNED: { label: "Signed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default function DashboardPage() {
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const res = await fetch("/api/contracts");
        if (res.ok) {
          const data = await res.json();
          setContracts(data);
        }
      } catch {
        // API might not be running
      } finally {
        setLoading(false);
      }
    }
    fetchContracts();
  }, []);

  const stats = {
    total: contracts.length,
    drafts: contracts.filter((c) => !c.status || c.status === "DRAFT").length,
    pendingSigning: contracts.filter((c) => c.status === "PENDING_REVIEW" || c.status === "PENDING_SIGNING" || c.status === "PARTIALLY_SIGNED").length,
    signed: contracts.filter((c) => c.status === "SIGNED").length,
    cancelled: contracts.filter((c) => c.status === "CANCELLED").length,
  };

  const statCards = [
    { title: "Total Contracts", value: stats.total, icon: FileText, color: "text-primary" },
    { title: "Drafts", value: stats.drafts, icon: PenTool, color: "text-amber-500" },
    { title: "Pending Signing", value: stats.pendingSigning, icon: Clock, color: "text-blue-500" },
    { title: "Signed", value: stats.signed, icon: CheckCircle2, color: "text-emerald-500" },
    { title: "Cancelled", value: stats.cancelled, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your contract management pipeline</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/templates">
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contracts/new">
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/contracts/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Plus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Create Contract</p>
                <p className="text-xs text-muted-foreground">Start from scratch or template</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>

            <Link
              href="/contracts?sync=true"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Import from SAC</p>
                <p className="text-xs text-muted-foreground">Sync from Databricks</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>

            <Link
              href="/templates"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
            >
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Browse Templates</p>
                <p className="text-xs text-muted-foreground">Pre-built contract templates</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Contracts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Contracts</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/contracts">
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">No contracts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first contract to get started
              </p>
              <Button asChild>
                <Link href="/contracts/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Contract
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {contracts.slice(0, 5).map((contract) => {
                const status = statusConfig[contract.status || "DRAFT"];
                return (
                  <Link
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    className="flex items-center gap-4 py-3 px-2 hover:bg-accent/50 rounded-md transition-colors -mx-2"
                  >
                    <div className="p-2 rounded-full bg-muted">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {contract.personalDetails?.fullName || "Unnamed"} - {contract.contractNumber || "No Number"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{contract.vesselDetails?.vesselName || "No vessel"}</span>
                        <span>&middot;</span>
                        <span>{contract.position || "No position"}</span>
                        <span>&middot;</span>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(contract.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
