"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Layers,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import WorkflowBuilder, {
  type WorkflowStep,
} from "@/components/WorkflowBuilder";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  createdAt: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(Array.isArray(data) ? data : data.workflows ?? []);
      }
    } catch {
      /* network error — keep empty list */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setSteps([]);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, steps }),
      });
      if (res.ok) {
        resetForm();
        await fetchWorkflows();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="mt-1 text-muted-foreground">
            Manage reusable signing &amp; review workflow templates.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Create Workflow
            </>
          )}
        </Button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="wf-name">Name</Label>
              <Input
                id="wf-name"
                placeholder="e.g. Standard 3-party signing"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wf-desc">Description</Label>
              <Textarea
                id="wf-desc"
                placeholder="Describe the workflow…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Steps</Label>
              <WorkflowBuilder steps={steps} onChange={setSteps} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={saving || !name.trim()}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Layers className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium">No workflows yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first workflow template to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <Link key={wf.id} href={`/workflows/${wf.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{wf.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {wf.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {wf.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {wf.steps?.length ?? 0} step
                      {(wf.steps?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(wf.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
