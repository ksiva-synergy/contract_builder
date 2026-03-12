// Core contract data types based on the Seaman's Employment Contract

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  cdcNumber: string;
  address: string;
}

export interface VesselDetails {
  vesselName: string;
  imoNumber: string;
  registeredOwner: string;
  certificateOfRegistry: string;
  portOfRegistry: string;
  shipownerAddress: string;
  managerAddress: string;
  vesselOwnerAddress: string;
}

export interface ContractTerms {
  contractTerm: string;
  placeOfEngagement: string;
  contractStartDate: string;
  contractExpiryDate: string;
}

export interface WageBreakdown {
  basicWages: number;
  employerSpecialAllowance: number;
  fixedOvertime: number;
  leavePay: number;
  subsistenceAllowance: number;
  specialAllowance: number;
  uniformAllowance: number;
  totalMonthlySalary: number;
  netMonthlySalary: number;
}

export interface OtherEarning {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
}

export interface SalaryRevision {
  sno: number;
  effectiveFrom: string;
  salary: number;
  remarks: string;
}

export interface EmploymentContract {
  id: string;
  contractNumber: string;
  effectiveFrom: string;
  
  // Main sections
  personalDetails: PersonalDetails;
  crewCode: string;
  position: string;
  placeOfBirth: string;
  ppNumber: string;
  
  vesselDetails: VesselDetails;
  contractTerms: ContractTerms;
  wageBreakdown: WageBreakdown;
  
  otherEarnings: OtherEarning[];
  deductions: OtherEarning[];
  salaryRevisions: SalaryRevision[];
  
  // Signature & Authentication
  signature?: string;
  email?: string;
  place?: string;
  createdAt: string;
  updatedAt: string;
}
