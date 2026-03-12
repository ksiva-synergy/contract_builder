"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ContractListItem {
  id: string;
  contractNumber: string;
  personalDetails: { fullName: string };
  vesselDetails: { vesselName: string };
  position: string;
  contractTerms: { contractStartDate: string; contractExpiryDate: string };
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

const PAGE_SIZE = 10;

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchContracts();
  }, []);

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

  async function handleDelete(ids: string[]) {
    for (const id of ids) {
      try {
        await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      } catch {
        toast.error(`Failed to delete contract ${id}`);
      }
    }
    toast.success(`Deleted ${ids.length} contract(s)`);
    setSelected(new Set());
    fetchContracts();
  }

  const filtered = contracts.filter((c) => {
    const matchesSearch =
      !search ||
      c.personalDetails?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.contractNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.vesselDetails?.vesselName?.toLowerCase().includes(search.toLowerCase()) ||
      c.position?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || (c.status || "DRAFT") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((c) => c.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground mt-1">Manage all your employment contracts</p>
        </div>
        <Button asChild>
          <Link href="/contracts/new">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Link>
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, vessel, contract number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {["all", "DRAFT", "PENDING_REVIEW", "PENDING_SIGNING", "PARTIALLY_SIGNED", "SIGNED", "CANCELLED"].map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                >
                  {s === "all" ? "All" : statusConfig[s]?.label || s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(Array.from(selected))}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">
                {search || statusFilter !== "all" ? "No matching contracts" : "No contracts yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first contract to get started"}
              </p>
              {!search && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/contracts/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Contract
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === paginated.length && paginated.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contract No</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Crew Member</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vessel</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginated.map((contract) => {
                    const status = statusConfig[contract.status || "DRAFT"];
                    return (
                      <tr
                        key={contract.id}
                        className="hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(contract.id)}
                            onChange={() => toggleSelect(contract.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <Link href={`/contracts/${contract.id}`} className="text-sm font-medium text-primary hover:underline">
                            {contract.contractNumber || "—"}
                          </Link>
                        </td>
                        <td className="p-3 text-sm">{contract.personalDetails?.fullName || "—"}</td>
                        <td className="p-3 text-sm">{contract.vesselDetails?.vesselName || "—"}</td>
                        <td className="p-3 text-sm">{contract.position || "—"}</td>
                        <td className="p-3">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(contract.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
