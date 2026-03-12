'use client';

import { EmploymentContract } from '@/types/contract';

interface ContractFormProps {
  contract: EmploymentContract;
  onChange: (contract: EmploymentContract) => void;
}

export default function ContractForm({ contract, onChange }: ContractFormProps) {
  const updateField = (section: keyof EmploymentContract, field: string, value: any) => {
    onChange({
      ...contract,
      [section]: typeof contract[section] === 'object' 
        ? { ...contract[section], [field]: value }
        : value,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      {/* Personal Details */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={contract.personalDetails.fullName}
            onChange={(e) => updateField('personalDetails', 'fullName', e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={contract.personalDetails.dateOfBirth}
            onChange={(e) => updateField('personalDetails', 'dateOfBirth', e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Nationality"
            value={contract.personalDetails.nationality}
            onChange={(e) => updateField('personalDetails', 'nationality', e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="CDC Number"
            value={contract.personalDetails.cdcNumber}
            onChange={(e) => updateField('personalDetails', 'cdcNumber', e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      </section>

      {/* Vessel Details */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Vessel Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Vessel Name"
            value={contract.vesselDetails.vesselName}
            onChange={(e) => updateField('vesselDetails', 'vesselName', e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="IMO Number"
            value={contract.vesselDetails.imoNumber}
            onChange={(e) => updateField('vesselDetails', 'imoNumber', e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      </section>

      {/* Wage Breakdown */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Wage Breakdown</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Basic Wages"
            value={contract.wageBreakdown.basicWages}
            onChange={(e) => updateField('wageBreakdown', 'basicWages', parseFloat(e.target.value))}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Fixed Overtime"
            value={contract.wageBreakdown.fixedOvertime}
            onChange={(e) => updateField('wageBreakdown', 'fixedOvertime', parseFloat(e.target.value))}
            className="border p-2 rounded"
          />
        </div>
      </section>
    </div>
  );
}
