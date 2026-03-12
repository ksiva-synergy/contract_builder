import { EmploymentContract } from '@/types/contract';

export function createEmptyContract(): EmploymentContract {
  return {
    id: crypto.randomUUID(),
    contractNumber: '',
    effectiveFrom: '',
    personalDetails: {
      fullName: '',
      dateOfBirth: '',
      age: 0,
      nationality: '',
      cdcNumber: '',
      address: '',
    },
    crewCode: '',
    position: '',
    placeOfBirth: '',
    ppNumber: '',
    vesselDetails: {
      vesselName: '',
      imoNumber: '',
      registeredOwner: '',
      certificateOfRegistry: '',
      portOfRegistry: '',
      shipownerAddress: '',
      managerAddress: '',
      vesselOwnerAddress: '',
    },
    contractTerms: {
      contractTerm: '',
      placeOfEngagement: '',
      contractStartDate: '',
      contractExpiryDate: '',
    },
    wageBreakdown: {
      basicWages: 0,
      employerSpecialAllowance: 0,
      fixedOvertime: 0,
      leavePay: 0,
      subsistenceAllowance: 0,
      specialAllowance: 0,
      uniformAllowance: 0,
      totalMonthlySalary: 0,
      netMonthlySalary: 0,
    },
    otherEarnings: [],
    deductions: [],
    salaryRevisions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function calculateTotalSalary(wageBreakdown: EmploymentContract['wageBreakdown']): number {
  return (
    wageBreakdown.basicWages +
    wageBreakdown.employerSpecialAllowance +
    wageBreakdown.fixedOvertime +
    wageBreakdown.leavePay +
    wageBreakdown.subsistenceAllowance +
    wageBreakdown.specialAllowance +
    wageBreakdown.uniformAllowance
  );
}
