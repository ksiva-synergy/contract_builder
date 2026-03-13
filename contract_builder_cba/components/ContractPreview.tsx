"use client";

import { EmploymentContract } from "@/types/contract";
import { Anchor } from "lucide-react";

interface ContractPreviewProps {
  contract: EmploymentContract;
}

export default function ContractPreview({ contract }: ContractPreviewProps) {
  const totalWages =
    contract.wageBreakdown.basicWages +
    contract.wageBreakdown.employerSpecialAllowance +
    contract.wageBreakdown.fixedOvertime +
    contract.wageBreakdown.leavePay +
    contract.wageBreakdown.subsistenceAllowance +
    contract.wageBreakdown.specialAllowance +
    contract.wageBreakdown.uniformAllowance;

  const totalEarnings = contract.otherEarnings.reduce((sum: number, e) => sum + e.amount, 0);
  const totalDeductions = contract.deductions.reduce((sum: number, d) => sum + d.amount, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white text-black p-10 shadow-lg print:shadow-none" style={{ fontFamily: "Georgia, serif" }}>
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Anchor className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-wide uppercase">Seafarer&apos;s Employment Contract</h1>
          </div>
          <p className="text-sm">In compliance with the Maritime Labour Convention (MLC) 2006</p>
          <div className="flex justify-center gap-8 mt-3 text-sm">
            <span>Contract No: <strong>{contract.contractNumber || "—"}</strong></span>
            <span>Effective From: <strong>{contract.effectiveFrom || "—"}</strong></span>
          </div>
        </div>

        {/* Section 1: Personal Details */}
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">1. Personal Details</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1 w-1/3 text-gray-600">Full Name</td><td className="py-1 font-medium">{contract.personalDetails.fullName || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Date of Birth</td><td className="py-1">{contract.personalDetails.dateOfBirth || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Age</td><td className="py-1">{contract.personalDetails.age || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Nationality</td><td className="py-1">{contract.personalDetails.nationality || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">CDC Number</td><td className="py-1">{contract.personalDetails.cdcNumber || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Address</td><td className="py-1">{contract.personalDetails.address || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Crew Code</td><td className="py-1">{contract.crewCode || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Position / Rank</td><td className="py-1 font-medium">{contract.position || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Place of Birth</td><td className="py-1">{contract.placeOfBirth || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">PP Number</td><td className="py-1">{contract.ppNumber || "—"}</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 2: Vessel Details */}
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">2. Vessel Details</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1 w-1/3 text-gray-600">Vessel Name</td><td className="py-1 font-medium">{contract.vesselDetails.vesselName || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">IMO Number</td><td className="py-1">{contract.vesselDetails.imoNumber || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Registered Owner</td><td className="py-1">{contract.vesselDetails.registeredOwner || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Certificate of Registry</td><td className="py-1">{contract.vesselDetails.certificateOfRegistry || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Port of Registry</td><td className="py-1">{contract.vesselDetails.portOfRegistry || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Shipowner Address</td><td className="py-1">{contract.vesselDetails.shipownerAddress || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Manager Address</td><td className="py-1">{contract.vesselDetails.managerAddress || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Vessel Owner Address</td><td className="py-1">{contract.vesselDetails.vesselOwnerAddress || "—"}</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 3: Contract Terms */}
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">3. Contract Terms</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1 w-1/3 text-gray-600">Contract Term</td><td className="py-1">{contract.contractTerms.contractTerm || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Place of Engagement</td><td className="py-1">{contract.contractTerms.placeOfEngagement || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Start Date</td><td className="py-1">{contract.contractTerms.contractStartDate || "—"}</td></tr>
              <tr><td className="py-1 text-gray-600">Expiry Date</td><td className="py-1">{contract.contractTerms.contractExpiryDate || "—"}</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 4: Wage Breakdown */}
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">4. Wage Breakdown (Monthly)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left text-gray-600">Component</th>
                <th className="py-2 text-right text-gray-600">Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200"><td className="py-1.5">Basic Wages</td><td className="py-1.5 text-right">{contract.wageBreakdown.basicWages.toFixed(2)}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5">Employer Special Allowance</td><td className="py-1.5 text-right">{contract.wageBreakdown.employerSpecialAllowance.toFixed(2)}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5">Fixed Overtime</td><td className="py-1.5 text-right">{contract.wageBreakdown.fixedOvertime.toFixed(2)}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5">Leave Pay</td><td className="py-1.5 text-right">{contract.wageBreakdown.leavePay.toFixed(2)}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5">Subsistence Allowance</td><td className="py-1.5 text-right">{contract.wageBreakdown.subsistenceAllowance.toFixed(2)}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5">Special Allowance</td><td className="py-1.5 text-right">{contract.wageBreakdown.specialAllowance.toFixed(2)}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5">Uniform Allowance</td><td className="py-1.5 text-right">{contract.wageBreakdown.uniformAllowance.toFixed(2)}</td></tr>
              <tr className="border-t-2 border-black font-bold"><td className="py-2">Total Monthly Salary</td><td className="py-2 text-right">{totalWages.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 5: Other Earnings */}
        {contract.otherEarnings.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">5. Other Earnings</h2>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="py-2 text-left text-gray-600">Description</th><th className="py-2 text-right text-gray-600">Amount (USD)</th></tr></thead>
              <tbody>
                {contract.otherEarnings.map((e) => (
                  <tr key={e.id} className="border-b border-gray-200"><td className="py-1.5">{e.description || "—"}</td><td className="py-1.5 text-right">{e.amount.toFixed(2)}</td></tr>
                ))}
                <tr className="font-bold border-t-2 border-black"><td className="py-2">Total Other Earnings</td><td className="py-2 text-right">{totalEarnings.toFixed(2)}</td></tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Section 6: Deductions */}
        {contract.deductions.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-3">{contract.otherEarnings.length > 0 ? "6" : "5"}. Deductions</h2>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="py-2 text-left text-gray-600">Description</th><th className="py-2 text-right text-gray-600">Amount (USD)</th></tr></thead>
              <tbody>
                {contract.deductions.map((d) => (
                  <tr key={d.id} className="border-b border-gray-200"><td className="py-1.5">{d.description || "—"}</td><td className="py-1.5 text-right">{d.amount.toFixed(2)}</td></tr>
                ))}
                <tr className="font-bold border-t-2 border-black"><td className="py-2">Total Deductions</td><td className="py-2 text-right">{totalDeductions.toFixed(2)}</td></tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Net Pay Summary */}
        <section className="mb-8 p-4 bg-gray-50 border rounded">
          <div className="flex justify-between text-sm mb-1">
            <span>Total Monthly Salary</span><span>{totalWages.toFixed(2)}</span>
          </div>
          {totalEarnings > 0 && <div className="flex justify-between text-sm mb-1"><span>+ Other Earnings</span><span>{totalEarnings.toFixed(2)}</span></div>}
          {totalDeductions > 0 && <div className="flex justify-between text-sm mb-1"><span>- Deductions</span><span>({totalDeductions.toFixed(2)})</span></div>}
          <div className="flex justify-between font-bold text-base border-t border-gray-400 pt-2 mt-2">
            <span>Net Monthly Pay</span><span>USD {(totalWages + totalEarnings - totalDeductions).toFixed(2)}</span>
          </div>
        </section>

        {/* Signature Section */}
        <section className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-6">Signatures</h2>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="border-b border-black mb-2 pb-8">
                {contract.signature && <p className="italic text-lg">{contract.signature}</p>}
              </div>
              <p className="text-sm font-medium">Seafarer&apos;s Signature</p>
              <p className="text-xs text-gray-500 mt-1">{contract.personalDetails.fullName || "Name"}</p>
              {contract.place && <p className="text-xs text-gray-500">Place: {contract.place}</p>}
              <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <div className="border-b border-black mb-2 pb-8" />
              <p className="text-sm font-medium">Shipowner / Authorized Representative</p>
              <p className="text-xs text-gray-500 mt-1">{contract.vesselDetails.registeredOwner || "Company Name"}</p>
              <p className="text-xs text-gray-500">Date: _______________</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 border-t pt-4 mt-8">
          <p>This contract is generated by Contract Builder CBA Platform</p>
          <p>Document ID: {contract.id} &middot; Generated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
