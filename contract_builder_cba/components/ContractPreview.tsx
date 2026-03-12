'use client';

import { EmploymentContract } from '@/types/contract';

interface ContractPreviewProps {
  contract: EmploymentContract;
}

export default function ContractPreview({ contract }: ContractPreviewProps) {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="border-2 border-gray-800 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Seaman's Employment Contract</h1>
          <p className="text-sm text-gray-600">Contract No: {contract.contractNumber}</p>
          <p className="text-sm text-gray-600">Effective From: {contract.effectiveFrom}</p>
        </div>

        {/* Personal Details */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg border-b mb-2">Personal Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Full Name:</span> {contract.personalDetails.fullName}
            </div>
            <div>
              <span className="font-medium">Crew Code:</span> {contract.crewCode}
            </div>
            <div>
              <span className="font-medium">Date of Birth:</span> {contract.personalDetails.dateOfBirth}
            </div>
            <div>
              <span className="font-medium">Position:</span> {contract.position}
            </div>
          </div>
        </section>

        {/* Vessel Details */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg border-b mb-2">Vessel Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Vessel Name:</span> {contract.vesselDetails.vesselName}
            </div>
            <div>
              <span className="font-medium">IMO Number:</span> {contract.vesselDetails.imoNumber}
            </div>
          </div>
        </section>

        {/* Wage Breakdown */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg border-b mb-2">Wage Breakdown</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-1">Basic Wages</td>
                <td className="text-right">${contract.wageBreakdown.basicWages.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1">Fixed Overtime</td>
                <td className="text-right">${contract.wageBreakdown.fixedOvertime.toFixed(2)}</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-1">Total Monthly Salary</td>
                <td className="text-right">${contract.wageBreakdown.totalMonthlySalary.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
