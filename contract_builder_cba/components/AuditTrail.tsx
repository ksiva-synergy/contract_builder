"use client";

import { Clock, User as UserIcon } from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  details: Record<string, string> | null;
  ipAddress: string | null;
  timestamp: string;
  user: { name: string; email: string } | null;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATED: { label: "Created", color: "bg-blue-500" },
  VIEWED: { label: "Viewed", color: "bg-gray-400" },
  EDITED: { label: "Edited", color: "bg-amber-500" },
  SUBMITTED: { label: "Submitted for Review", color: "bg-violet-500" },
  REVIEWED: { label: "Reviewed", color: "bg-indigo-500" },
  APPROVED: { label: "Approved", color: "bg-emerald-500" },
  RETURNED: { label: "Returned to Draft", color: "bg-orange-500" },
  SIGNED: { label: "Signed", color: "bg-green-600" },
  VERIFIED: { label: "Verified", color: "bg-teal-500" },
  EXPORTED: { label: "Exported as PDF", color: "bg-sky-500" },
  STATUS_CHANGED: { label: "Status Changed", color: "bg-purple-500" },
  ASSIGNMENT_ADDED: { label: "Assignee Added", color: "bg-cyan-500" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500" },
};

interface AuditTrailProps {
  entries: AuditEntry[];
  loading?: boolean;
}

export function AuditTrail({ entries, loading }: AuditTrailProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-muted mt-1.5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-48" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No activity recorded yet
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-4">
        {entries.map((entry) => {
          const actionInfo = actionLabels[entry.action] || {
            label: entry.action,
            color: "bg-gray-400",
          };
          return (
            <div key={entry.id} className="flex gap-3 relative">
              <div
                className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${actionInfo.color}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{actionInfo.label}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {entry.user && (
                    <>
                      <UserIcon className="w-3 h-3" />
                      <span>{entry.user.name}</span>
                      <span>&middot;</span>
                    </>
                  )}
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                {entry.details && Object.keys(entry.details).length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {Object.entries(entry.details).map(([key, val]) => (
                      <span key={key} className="mr-3">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
