"use client";

import { EmploymentContract } from "@/types/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ContractFormProps {
  contract: EmploymentContract;
  onChange: (contract: EmploymentContract) => void;
}

export default function ContractForm({ contract, onChange }: ContractFormProps) {
  const updateField = (section: string, field: string, value: string | number) => {
    if (section === "root") {
      onChange({ ...contract, [field]: value, updatedAt: new Date().toISOString() });
      return;
    }
    const sectionData = contract[section as keyof EmploymentContract];
    if (typeof sectionData === "object" && sectionData !== null && !Array.isArray(sectionData)) {
      onChange({
        ...contract,
        [section]: { ...sectionData, [field]: value },
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const addEarning = () => {
    onChange({
      ...contract,
      otherEarnings: [...contract.otherEarnings, { id: `e-${Date.now()}`, description: "", amount: 0, currency: "USD", date: "" }],
    });
  };

  const removeEarning = (id: string) => {
    onChange({ ...contract, otherEarnings: contract.otherEarnings.filter((e) => e.id !== id) });
  };

  const updateEarning = (id: string, field: string, value: string | number) => {
    onChange({
      ...contract,
      otherEarnings: contract.otherEarnings.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };

  const addDeduction = () => {
    onChange({
      ...contract,
      deductions: [...contract.deductions, { id: `d-${Date.now()}`, description: "", amount: 0, currency: "USD", date: "" }],
    });
  };

  const removeDeduction = (id: string) => {
    onChange({ ...contract, deductions: contract.deductions.filter((d) => d.id !== id) });
  };

  const updateDeduction = (id: string, field: string, value: string | number) => {
    onChange({
      ...contract,
      deductions: contract.deductions.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    });
  };

  return (
    <div className="space-y-6">
      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Contract Number</Label>
              <Input value={contract.contractNumber} onChange={(e) => updateField("root", "contractNumber", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Effective From</Label>
              <Input type="date" value={contract.effectiveFrom} onChange={(e) => updateField("root", "effectiveFrom", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={contract.position} onChange={(e) => updateField("root", "position", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={contract.personalDetails.fullName} onChange={(e) => updateField("personalDetails", "fullName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={contract.personalDetails.dateOfBirth} onChange={(e) => updateField("personalDetails", "dateOfBirth", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={contract.personalDetails.age || ""} onChange={(e) => updateField("personalDetails", "age", parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input value={contract.personalDetails.nationality} onChange={(e) => updateField("personalDetails", "nationality", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CDC Number</Label>
              <Input value={contract.personalDetails.cdcNumber} onChange={(e) => updateField("personalDetails", "cdcNumber", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={contract.personalDetails.address} onChange={(e) => updateField("personalDetails", "address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Crew Code</Label>
              <Input value={contract.crewCode} onChange={(e) => updateField("root", "crewCode", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Place of Birth</Label>
              <Input value={contract.placeOfBirth} onChange={(e) => updateField("root", "placeOfBirth", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>PP Number</Label>
              <Input value={contract.ppNumber} onChange={(e) => updateField("root", "ppNumber", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vessel Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vessel Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Vessel Name</Label><Input value={contract.vesselDetails.vesselName} onChange={(e) => updateField("vesselDetails", "vesselName", e.target.value)} /></div>
            <div className="space-y-2"><Label>IMO Number</Label><Input value={contract.vesselDetails.imoNumber} onChange={(e) => updateField("vesselDetails", "imoNumber", e.target.value)} /></div>
            <div className="space-y-2"><Label>Registered Owner</Label><Input value={contract.vesselDetails.registeredOwner} onChange={(e) => updateField("vesselDetails", "registeredOwner", e.target.value)} /></div>
            <div className="space-y-2"><Label>Certificate of Registry</Label><Input value={contract.vesselDetails.certificateOfRegistry} onChange={(e) => updateField("vesselDetails", "certificateOfRegistry", e.target.value)} /></div>
            <div className="space-y-2"><Label>Port of Registry</Label><Input value={contract.vesselDetails.portOfRegistry} onChange={(e) => updateField("vesselDetails", "portOfRegistry", e.target.value)} /></div>
            <div className="space-y-2"><Label>Shipowner Address</Label><Input value={contract.vesselDetails.shipownerAddress} onChange={(e) => updateField("vesselDetails", "shipownerAddress", e.target.value)} /></div>
            <div className="space-y-2"><Label>Manager Address</Label><Input value={contract.vesselDetails.managerAddress} onChange={(e) => updateField("vesselDetails", "managerAddress", e.target.value)} /></div>
            <div className="space-y-2"><Label>Vessel Owner Address</Label><Input value={contract.vesselDetails.vesselOwnerAddress} onChange={(e) => updateField("vesselDetails", "vesselOwnerAddress", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contract Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Contract Term</Label><Input value={contract.contractTerms.contractTerm} onChange={(e) => updateField("contractTerms", "contractTerm", e.target.value)} placeholder="e.g. 9 months" /></div>
            <div className="space-y-2"><Label>Place of Engagement</Label><Input value={contract.contractTerms.placeOfEngagement} onChange={(e) => updateField("contractTerms", "placeOfEngagement", e.target.value)} /></div>
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={contract.contractTerms.contractStartDate} onChange={(e) => updateField("contractTerms", "contractStartDate", e.target.value)} /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={contract.contractTerms.contractExpiryDate} onChange={(e) => updateField("contractTerms", "contractExpiryDate", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Wage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Label>{label}</Label>
                <Input type="number" step="0.01" value={contract.wageBreakdown[key] || ""} onChange={(e) => updateField("wageBreakdown", key, parseFloat(e.target.value) || 0)} placeholder="0.00" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Monthly Salary</span>
            <span className="text-lg font-bold">
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
        </CardContent>
      </Card>

      {/* Other Earnings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Other Earnings</CardTitle>
          <Button variant="outline" size="sm" onClick={addEarning}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </CardHeader>
        <CardContent>
          {contract.otherEarnings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No other earnings</p>
          ) : (
            <div className="space-y-3">
              {contract.otherEarnings.map((e) => (
                <div key={e.id} className="flex items-end gap-3 p-3 border rounded-lg">
                  <div className="flex-1 space-y-1"><Label className="text-xs">Description</Label><Input value={e.description} onChange={(ev) => updateEarning(e.id, "description", ev.target.value)} /></div>
                  <div className="w-28 space-y-1"><Label className="text-xs">Amount</Label><Input type="number" value={e.amount || ""} onChange={(ev) => updateEarning(e.id, "amount", parseFloat(ev.target.value) || 0)} /></div>
                  <Button variant="ghost" size="icon" onClick={() => removeEarning(e.id)} className="text-destructive shrink-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Deductions</CardTitle>
          <Button variant="outline" size="sm" onClick={addDeduction}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </CardHeader>
        <CardContent>
          {contract.deductions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No deductions</p>
          ) : (
            <div className="space-y-3">
              {contract.deductions.map((d) => (
                <div key={d.id} className="flex items-end gap-3 p-3 border rounded-lg">
                  <div className="flex-1 space-y-1"><Label className="text-xs">Description</Label><Input value={d.description} onChange={(ev) => updateDeduction(d.id, "description", ev.target.value)} /></div>
                  <div className="w-28 space-y-1"><Label className="text-xs">Amount</Label><Input type="number" value={d.amount || ""} onChange={(ev) => updateDeduction(d.id, "amount", parseFloat(ev.target.value) || 0)} /></div>
                  <Button variant="ghost" size="icon" onClick={() => removeDeduction(d.id)} className="text-destructive shrink-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
