"use client";

import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export interface WorkflowStep {
  order: number;
  role: "SIGNER" | "REVIEWER";
  label: string;
  required: boolean;
}

interface WorkflowBuilderProps {
  steps: WorkflowStep[];
  onChange: (steps: WorkflowStep[]) => void;
}

const roleOptions = [
  { value: "SIGNER", label: "Signer" },
  { value: "REVIEWER", label: "Reviewer" },
];

function renumber(steps: WorkflowStep[]): WorkflowStep[] {
  return steps.map((s, i) => ({ ...s, order: i + 1 }));
}

export default function WorkflowBuilder({ steps, onChange }: WorkflowBuilderProps) {
  const addStep = () => {
    onChange(
      renumber([
        ...steps,
        { order: steps.length + 1, role: "SIGNER", label: "", required: true },
      ])
    );
  };

  const removeStep = (index: number) => {
    onChange(renumber(steps.filter((_, i) => i !== index)));
  };

  const updateStep = (index: number, patch: Partial<WorkflowStep>) => {
    onChange(
      renumber(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)))
    );
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(renumber(next));
  };

  return (
    <div className="space-y-3">
      {steps.length === 0 && (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
          No steps yet. Add a step to define the workflow.
        </div>
      )}

      {steps.map((step, index) => (
        <Card key={index} className="relative">
          <CardContent className="flex items-center gap-3 p-4">
            <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground/40" />

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {step.order}
            </span>

            <div className="flex flex-1 flex-wrap items-center gap-3">
              <Input
                className="min-w-[160px] flex-1"
                placeholder="Step label"
                value={step.label}
                onChange={(e) => updateStep(index, { label: e.target.value })}
              />

              <Select
                className="w-[140px]"
                options={roleOptions}
                value={step.role}
                onChange={(e) =>
                  updateStep(index, {
                    role: e.target.value as "SIGNER" | "REVIEWER",
                  })
                }
              />

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  step.role === "SIGNER"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                }`}
              >
                {step.role}
              </span>

              <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={step.required}
                  onChange={(e) =>
                    updateStep(index, { required: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-primary"
                />
                Required
              </label>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={index === 0}
                onClick={() => moveStep(index, -1)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={index === steps.length - 1}
                onClick={() => moveStep(index, 1)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeStep(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addStep}>
        <Plus className="h-4 w-4" />
        Add Step
      </Button>
    </div>
  );
}
