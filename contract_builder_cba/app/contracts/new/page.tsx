"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Save, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createEmptyContract } from "@/lib/contract-utils";
import type { EmploymentContract } from "@/types/contract";

const STEPS = [
  { id: "template", label: "Template" },
  { id: "personal", label: "Personal Details" },
  { id: "vessel", label: "Vessel Details" },
  { id: "terms", label: "Contract Terms" },
  { id: "wages", label: "Wages" },
  { id: "extras", label: "Earnings & Deductions" },
  { id: "review", label: "Review & Sign" },
];

const TEMPLATES = [
  { id: "employment", name: "Employment Contract", desc: "Standard seafarer employment agreement (SEC)" },
  { id: "nda", name: "Non-Disclosure Agreement", desc: "Confidentiality agreement for crew members" },
  { id: "service", name: "Service Agreement", desc: "Vessel service and maintenance contract" },
  { id: "blank", name: "Blank Contract", desc: "Start from scratch with an empty contract" },
];

export default function NewContractPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [contract, setContract] = useState<EmploymentContract>(createEmptyContract());
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateField = (section: string, field: string, value: string | number) => {
    setContract((prev) => {
      if (section === "root") {
        return { ...prev, [field]: value, updatedAt: new Date().toISOString() };
      }
      const sectionData = prev[section as keyof EmploymentContract];
      if (typeof sectionData === "object" && sectionData !== null && !Array.isArray(sectionData)) {
        return {
          ...prev,
          [section]: { ...sectionData, [field]: value },
          updatedAt: new Date().toISOString(),
        };
      }
      return prev;
    });
  };

  const addEarning = () => {
    setContract((prev) => ({
      ...prev,
      otherEarnings: [
        ...prev.otherEarnings,
        { id: `earn-${Date.now()}`, description: "", amount: 0, currency: "USD", date: "" },
      ],
    }));
  };

  const removeEarning = (id: string) => {
    setContract((prev) => ({
      ...prev,
      otherEarnings: prev.otherEarnings.filter((e) => e.id !== id),
    }));
  };

  const updateEarning = (id: string, field: string, value: string | number) => {
    setContract((prev) => ({
      ...prev,
      otherEarnings: prev.otherEarnings.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  const addDeduction = () => {
    setContract((prev) => ({
      ...prev,
      deductions: [
        ...prev.deductions,
        { id: `ded-${Date.now()}`, description: "", amount: 0, currency: "USD", date: "" },
      ],
    }));
  };

  const removeDeduction = (id: string) => {
    setContract((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((d) => d.id !== id),
    }));
  };

  const updateDeduction = (id: string, field: string, value: string | number) => {
    setContract((prev) => ({
      ...prev,
      deductions: prev.deductions.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    }));
  };

  const handleSave = async (asDraft = true) => {
    setSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contract, status: asDraft ? "DRAFT" : "SIGNED" }),
      });
      if (res.ok) {
        const saved = await res.json();
        toast.success(asDraft ? "Contract saved as draft" : "Contract created successfully");
        router.push(`/contracts/${saved.id}`);
      } else {
        toast.error("Failed to save contract");
      }
    } catch {
      toast.error("Network error — could not save");
    } finally {
      setSaving(false);
    }
  };

  const canGoNext = () => {
    if (step === 0) return !!selectedTemplate;
    if (step === 1) return !!contract.personalDetails.fullName;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contracts"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Contract</h1>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors cursor-pointer ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary-foreground text-primary" : "bg-muted"
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Choose a Template</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedTemplate === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-8 h-8 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Personal Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={contract.personalDetails.fullName} onChange={(e) => updateField("personalDetails", "fullName", e.target.value)} placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={contract.personalDetails.dateOfBirth} onChange={(e) => updateField("personalDetails", "dateOfBirth", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={contract.personalDetails.age || ""} onChange={(e) => updateField("personalDetails", "age", parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" value={contract.personalDetails.nationality} onChange={(e) => updateField("personalDetails", "nationality", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cdcNumber">CDC Number</Label>
                  <Input id="cdcNumber" value={contract.personalDetails.cdcNumber} onChange={(e) => updateField("personalDetails", "cdcNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={contract.personalDetails.address} onChange={(e) => updateField("personalDetails", "address", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crewCode">Crew Code</Label>
                  <Input id="crewCode" value={contract.crewCode} onChange={(e) => updateField("root", "crewCode", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" value={contract.position} onChange={(e) => updateField("root", "position", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeOfBirth">Place of Birth</Label>
                  <Input id="placeOfBirth" value={contract.placeOfBirth} onChange={(e) => updateField("root", "placeOfBirth", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ppNumber">PP Number</Label>
                  <Input id="ppNumber" value={contract.ppNumber} onChange={(e) => updateField("root", "ppNumber", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Vessel Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vesselName">Vessel Name</Label>
                  <Input id="vesselName" value={contract.vesselDetails.vesselName} onChange={(e) => updateField("vesselDetails", "vesselName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imoNumber">IMO Number</Label>
                  <Input id="imoNumber" value={contract.vesselDetails.imoNumber} onChange={(e) => updateField("vesselDetails", "imoNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registeredOwner">Registered Owner</Label>
                  <Input id="registeredOwner" value={contract.vesselDetails.registeredOwner} onChange={(e) => updateField("vesselDetails", "registeredOwner", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificateOfRegistry">Certificate of Registry</Label>
                  <Input id="certificateOfRegistry" value={contract.vesselDetails.certificateOfRegistry} onChange={(e) => updateField("vesselDetails", "certificateOfRegistry", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portOfRegistry">Port of Registry</Label>
                  <Input id="portOfRegistry" value={contract.vesselDetails.portOfRegistry} onChange={(e) => updateField("vesselDetails", "portOfRegistry", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipownerAddress">Shipowner Address</Label>
                  <Input id="shipownerAddress" value={contract.vesselDetails.shipownerAddress} onChange={(e) => updateField("vesselDetails", "shipownerAddress", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerAddress">Manager Address</Label>
                  <Input id="managerAddress" value={contract.vesselDetails.managerAddress} onChange={(e) => updateField("vesselDetails", "managerAddress", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vesselOwnerAddress">Vessel Owner Address</Label>
                  <Input id="vesselOwnerAddress" value={contract.vesselDetails.vesselOwnerAddress} onChange={(e) => updateField("vesselDetails", "vesselOwnerAddress", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Contract Terms</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractNumber">Contract Number</Label>
                  <Input id="contractNumber" value={contract.contractNumber} onChange={(e) => updateField("root", "contractNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effectiveFrom">Effective From</Label>
                  <Input id="effectiveFrom" type="date" value={contract.effectiveFrom} onChange={(e) => updateField("root", "effectiveFrom", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractTerm">Contract Term</Label>
                  <Input id="contractTerm" value={contract.contractTerms.contractTerm} onChange={(e) => updateField("contractTerms", "contractTerm", e.target.value)} placeholder="e.g. 9 months" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeOfEngagement">Place of Engagement</Label>
                  <Input id="placeOfEngagement" value={contract.contractTerms.placeOfEngagement} onChange={(e) => updateField("contractTerms", "placeOfEngagement", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractStartDate">Start Date</Label>
                  <Input id="contractStartDate" type="date" value={contract.contractTerms.contractStartDate} onChange={(e) => updateField("contractTerms", "contractStartDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractExpiryDate">Expiry Date</Label>
                  <Input id="contractExpiryDate" type="date" value={contract.contractTerms.contractExpiryDate} onChange={(e) => updateField("contractTerms", "contractExpiryDate", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Wage Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ["basicWages", "Basic Wages"],
                  ["employerSpecialAllowance", "Employer Special Allowance"],
                  ["fixedOvertime", "Fixed Overtime"],
                  ["leavePay", "Leave Pay"],
                  ["subsistenceAllowance", "Subsistence Allowance"],
                  ["specialAllowance", "Special Allowance"],
                  ["uniformAllowance", "Uniform Allowance"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type="number"
                      step="0.01"
                      value={contract.wageBreakdown[key] || ""}
                      onChange={(e) => updateField("wageBreakdown", key, parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Monthly Salary</span>
                  <span className="font-semibold">
                    ${(
                      contract.wageBreakdown.basicWages +
                      contract.wageBreakdown.employerSpecialAllowance +
                      contract.wageBreakdown.fixedOvertime +
                      contract.wageBreakdown.leavePay +
                      contract.wageBreakdown.subsistenceAllowance +
                      contract.wageBreakdown.specialAllowance +
                      contract.wageBreakdown.uniformAllowance
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Other Earnings</h2>
                  <Button variant="outline" size="sm" onClick={addEarning}>+ Add Earning</Button>
                </div>
                {contract.otherEarnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No other earnings added</p>
                ) : (
                  <div className="space-y-3">
                    {contract.otherEarnings.map((e) => (
                      <div key={e.id} className="flex items-end gap-3 p-3 border rounded-lg">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input value={e.description} onChange={(ev) => updateEarning(e.id, "description", ev.target.value)} placeholder="Description" />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Amount</Label>
                          <Input type="number" value={e.amount || ""} onChange={(ev) => updateEarning(e.id, "amount", parseFloat(ev.target.value) || 0)} placeholder="0.00" />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeEarning(e.id)} className="text-destructive">Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Deductions</h2>
                  <Button variant="outline" size="sm" onClick={addDeduction}>+ Add Deduction</Button>
                </div>
                {contract.deductions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No deductions added</p>
                ) : (
                  <div className="space-y-3">
                    {contract.deductions.map((d) => (
                      <div key={d.id} className="flex items-end gap-3 p-3 border rounded-lg">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input value={d.description} onChange={(ev) => updateDeduction(d.id, "description", ev.target.value)} placeholder="Description" />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Amount</Label>
                          <Input type="number" value={d.amount || ""} onChange={(ev) => updateDeduction(d.id, "amount", parseFloat(ev.target.value) || 0)} placeholder="0.00" />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeDeduction(d.id)} className="text-destructive">Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Review Contract</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Personal Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {contract.personalDetails.fullName || "—"}</p>
                      <p><span className="text-muted-foreground">Position:</span> {contract.position || "—"}</p>
                      <p><span className="text-muted-foreground">Nationality:</span> {contract.personalDetails.nationality || "—"}</p>
                      <p><span className="text-muted-foreground">Crew Code:</span> {contract.crewCode || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Vessel Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Vessel:</span> {contract.vesselDetails.vesselName || "—"}</p>
                      <p><span className="text-muted-foreground">IMO:</span> {contract.vesselDetails.imoNumber || "—"}</p>
                      <p><span className="text-muted-foreground">Owner:</span> {contract.vesselDetails.registeredOwner || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Contract Terms</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Number:</span> {contract.contractNumber || "—"}</p>
                      <p><span className="text-muted-foreground">Term:</span> {contract.contractTerms.contractTerm || "—"}</p>
                      <p><span className="text-muted-foreground">Start:</span> {contract.contractTerms.contractStartDate || "—"}</p>
                      <p><span className="text-muted-foreground">Expiry:</span> {contract.contractTerms.contractExpiryDate || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Wage Summary</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Basic:</span> ${contract.wageBreakdown.basicWages.toFixed(2)}</p>
                      <p><span className="text-muted-foreground">Overtime:</span> ${contract.wageBreakdown.fixedOvertime.toFixed(2)}</p>
                      <p className="font-semibold pt-1 border-t">
                        Total: ${(
                          contract.wageBreakdown.basicWages +
                          contract.wageBreakdown.employerSpecialAllowance +
                          contract.wageBreakdown.fixedOvertime +
                          contract.wageBreakdown.leavePay +
                          contract.wageBreakdown.subsistenceAllowance +
                          contract.wageBreakdown.specialAllowance +
                          contract.wageBreakdown.uniformAllowance
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signEmail">Email</Label>
                    <Input id="signEmail" type="email" value={contract.email || ""} onChange={(e) => updateField("root", "email", e.target.value)} placeholder="signer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signPlace">Place of Signing</Label>
                    <Input id="signPlace" value={contract.place || ""} onChange={(e) => updateField("root", "place", e.target.value)} placeholder="City, Country" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> Save as Draft
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => handleSave(false)} disabled={saving}>
              <Check className="w-4 h-4 mr-2" /> Create Contract
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
