import { z } from "zod";

export const personalDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().optional().default(""),
  age: z.number().min(0).max(100).optional().default(0),
  nationality: z.string().optional().default(""),
  cdcNumber: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export const vesselDetailsSchema = z.object({
  vesselName: z.string().optional().default(""),
  imoNumber: z.string().optional().default(""),
  registeredOwner: z.string().optional().default(""),
  certificateOfRegistry: z.string().optional().default(""),
  portOfRegistry: z.string().optional().default(""),
  shipownerAddress: z.string().optional().default(""),
  managerAddress: z.string().optional().default(""),
  vesselOwnerAddress: z.string().optional().default(""),
});

export const contractTermsSchema = z.object({
  contractTerm: z.string().optional().default(""),
  placeOfEngagement: z.string().optional().default(""),
  contractStartDate: z.string().optional().default(""),
  contractExpiryDate: z.string().optional().default(""),
});

export const wageBreakdownSchema = z.object({
  basicWages: z.number().min(0).default(0),
  employerSpecialAllowance: z.number().min(0).default(0),
  fixedOvertime: z.number().min(0).default(0),
  leavePay: z.number().min(0).default(0),
  subsistenceAllowance: z.number().min(0).default(0),
  specialAllowance: z.number().min(0).default(0),
  uniformAllowance: z.number().min(0).default(0),
  totalMonthlySalary: z.number().min(0).default(0),
  netMonthlySalary: z.number().min(0).default(0),
});

export const otherEarningSchema = z.object({
  id: z.string(),
  description: z.string().optional().default(""),
  amount: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  date: z.string().optional().default(""),
});

export const salaryRevisionSchema = z.object({
  sno: z.number(),
  effectiveFrom: z.string(),
  salary: z.number().min(0),
  remarks: z.string().optional().default(""),
});

export const CONTRACT_STATUSES = ["DRAFT", "IN_REVIEW", "APPROVED", "SIGNED", "EXPIRED"] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const employmentContractSchema = z.object({
  id: z.string().optional(),
  contractNumber: z.string().optional().default(""),
  effectiveFrom: z.string().optional().default(""),
  status: z.enum(CONTRACT_STATUSES).optional().default("DRAFT"),
  personalDetails: personalDetailsSchema,
  crewCode: z.string().optional().default(""),
  position: z.string().optional().default(""),
  placeOfBirth: z.string().optional().default(""),
  ppNumber: z.string().optional().default(""),
  vesselDetails: vesselDetailsSchema,
  contractTerms: contractTermsSchema,
  wageBreakdown: wageBreakdownSchema,
  otherEarnings: z.array(otherEarningSchema).default([]),
  deductions: z.array(otherEarningSchema).default([]),
  salaryRevisions: z.array(salaryRevisionSchema).default([]),
  signature: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  place: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ValidatedContract = z.infer<typeof employmentContractSchema>;
