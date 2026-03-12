"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import WorkflowBuilder, {
  type WorkflowStep,
} from "@/components/WorkflowBuilder";

interface WorkflowDetail {
  id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/workflows/${id}`);
        if (res.ok) {
          const data: WorkflowDetail = await res.json();
          setName(data.name);
          setDescription(data.description ?? "");
          setSteps(data.steps ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, steps }),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this workflow? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/workflows");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/workflows"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workflows
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Steps</Label>
            <WorkflowBuilder steps={steps} onChange={setSteps} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
