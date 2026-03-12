import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all contracts
export async function GET() {
  try {
    const contracts = await prisma.employmentContract.findMany({
      include: {
        otherEarnings: true,
        deductions: true,
        salaryRevisions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

// POST create new contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const contract = await prisma.employmentContract.create({
      data: {
        contractNumber: body.contractNumber,
        effectiveFrom: body.effectiveFrom,
        fullName: body.personalDetails.fullName,
        dateOfBirth: body.personalDetails.dateOfBirth,
        age: body.personalDetails.age,
        nationality: body.personalDetails.nationality,
        cdcNumber: body.personalDetails.cdcNumber,
        address: body.personalDetails.address,
        crewCode: body.crewCode,
        position: body.position,
        placeOfBirth: body.placeOfBirth,
        ppNumber: body.ppNumber,
        vesselName: body.vesselDetails.vesselName,
        imoNumber: body.vesselDetails.imoNumber,
        registeredOwner: body.vesselDetails.registeredOwner,
        certificateOfRegistry: body.vesselDetails.certificateOfRegistry,
        portOfRegistry: body.vesselDetails.portOfRegistry,
        shipownerAddress: body.vesselDetails.shipownerAddress,
        managerAddress: body.vesselDetails.managerAddress,
        vesselOwnerAddress: body.vesselDetails.vesselOwnerAddress,
        contractTerm: body.contractTerms.contractTerm,
        placeOfEngagement: body.contractTerms.placeOfEngagement,
        contractStartDate: body.contractTerms.contractStartDate,
        contractExpiryDate: body.contractTerms.contractExpiryDate,
        basicWages: body.wageBreakdown.basicWages,
        employerSpecialAllowance: body.wageBreakdown.employerSpecialAllowance,
        fixedOvertime: body.wageBreakdown.fixedOvertime,
        leavePay: body.wageBreakdown.leavePay,
        subsistenceAllowance: body.wageBreakdown.subsistenceAllowance,
        specialAllowance: body.wageBreakdown.specialAllowance,
        uniformAllowance: body.wageBreakdown.uniformAllowance,
        totalMonthlySalary: body.wageBreakdown.totalMonthlySalary,
        netMonthlySalary: body.wageBreakdown.netMonthlySalary,
        signature: body.signature,
        email: body.email,
        place: body.place,
      },
    });
    
    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}
