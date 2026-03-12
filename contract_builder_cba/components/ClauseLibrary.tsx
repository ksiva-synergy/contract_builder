"use client";

import { useState } from "react";
import { Search, BookOpen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ClauseLibraryProps {
  open: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
}

const CLAUSE_CATEGORIES = [
  "All",
  "Termination",
  "Liability",
  "Confidentiality",
  "Compliance",
  "Wages",
  "Leave",
  "Safety",
];

const BUILT_IN_CLAUSES = [
  {
    id: "term-1",
    title: "Standard Termination Clause",
    content: "Either party may terminate this contract by giving not less than one month's written notice. In the event of serious misconduct, the employer may terminate the contract without notice.",
    category: "Termination",
  },
  {
    id: "term-2",
    title: "Early Termination",
    content: "If the seafarer terminates the contract before the agreed period without valid reason, a deduction equivalent to the repatriation cost shall be made from the final settlement.",
    category: "Termination",
  },
  {
    id: "liab-1",
    title: "Limitation of Liability",
    content: "The shipowner's liability shall not exceed the limits prescribed by the applicable international conventions, including the Maritime Labour Convention (MLC) 2006 and LLMC 1996.",
    category: "Liability",
  },
  {
    id: "conf-1",
    title: "Confidentiality Obligation",
    content: "The seafarer shall maintain strict confidentiality regarding vessel operations, cargo information, navigation details, and any proprietary information of the shipowner during and after employment.",
    category: "Confidentiality",
  },
  {
    id: "comp-1",
    title: "MLC Compliance",
    content: "This agreement complies with the requirements of the Maritime Labour Convention (MLC) 2006 as amended, including provisions for conditions of employment, accommodation, food, health protection, and social security.",
    category: "Compliance",
  },
  {
    id: "comp-2",
    title: "Flag State Requirements",
    content: "The seafarer agrees to comply with all applicable laws and regulations of the flag state under which the vessel is registered, including safety regulations and environmental protection standards.",
    category: "Compliance",
  },
  {
    id: "wage-1",
    title: "Wage Payment Terms",
    content: "Wages shall be paid monthly, no later than the 10th day of the following month, in the currency specified in this contract. Payment shall be made via bank transfer to the designated account.",
    category: "Wages",
  },
  {
    id: "wage-2",
    title: "Overtime Compensation",
    content: "Overtime work exceeding the normal hours (8 hours per day / 48 hours per week) shall be compensated at 1.25 times the basic hourly rate, unless otherwise specified in the applicable CBA.",
    category: "Wages",
  },
  {
    id: "leave-1",
    title: "Annual Leave Entitlement",
    content: "The seafarer shall be entitled to annual leave with pay calculated at the rate of 2.5 calendar days per month of employment, in accordance with MLC Standard A2.4.",
    category: "Leave",
  },
  {
    id: "safety-1",
    title: "Safety and Health",
    content: "The shipowner shall ensure a safe working environment in accordance with the ISM Code and MLC requirements. The seafarer shall comply with all safety procedures and participate in required drills.",
    category: "Safety",
  },
];

export default function ClauseLibrary({ open, onClose, onInsert }: ClauseLibraryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  if (!open) return null;

  const filtered = BUILT_IN_CLAUSES.filter((c) => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || c.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Clause Library</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-3 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clauses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CLAUSE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No matching clauses</p>
          </div>
        ) : (
          filtered.map((clause) => (
            <div key={clause.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-medium">{clause.title}</h3>
                <Badge variant="secondary" className="text-[10px] shrink-0">{clause.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{clause.content}</p>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onInsert(clause.content)}>
                <Plus className="w-3 h-3 mr-1" /> Insert
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
