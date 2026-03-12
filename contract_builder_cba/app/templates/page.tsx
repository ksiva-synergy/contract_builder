"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Anchor, Shield, Briefcase, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "employment", label: "Employment" },
  { id: "nda", label: "NDA" },
  { id: "service", label: "Service" },
  { id: "maritime", label: "Maritime" },
];

const TEMPLATES = [
  {
    id: "sec-standard",
    name: "Standard Employment Contract (SEC)",
    description: "MLC-compliant seafarer employment contract with all standard clauses for international voyages.",
    category: "employment",
    icon: Anchor,
    popular: true,
  },
  {
    id: "sec-fixed",
    name: "Fixed-Term Employment",
    description: "Time-bound employment contract for specific voyage or fixed duration assignments.",
    category: "employment",
    icon: Briefcase,
    popular: false,
  },
  {
    id: "crew-nda",
    name: "Crew Confidentiality Agreement",
    description: "Non-disclosure agreement for sensitive vessel operations and cargo information.",
    category: "nda",
    icon: Shield,
    popular: true,
  },
  {
    id: "vessel-service",
    name: "Vessel Service Agreement",
    description: "Service and maintenance contract for vessel operations and port services.",
    category: "service",
    icon: ScrollText,
    popular: false,
  },
  {
    id: "manning-agreement",
    name: "Manning Agency Agreement",
    description: "Contract between shipowner and manning agency for crew supply and management.",
    category: "maritime",
    icon: Anchor,
    popular: true,
  },
  {
    id: "training-agreement",
    name: "Training & Certification Agreement",
    description: "Agreement for seafarer training programs and certification requirements.",
    category: "maritime",
    icon: FileText,
    popular: false,
  },
];

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = TEMPLATES.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-1">Pre-built contract templates to get started quickly</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <Button key={c.id} variant={category === c.id ? "default" : "outline"} size="sm" onClick={() => setCategory(c.id)}>
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No templates found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <template.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      {template.popular && <Badge variant="secondary" className="shrink-0">Popular</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" asChild>
                        <Link href={`/contracts/new?template=${template.id}`}>Use Template</Link>
                      </Button>
                      <Button variant="outline" size="sm">Preview</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
