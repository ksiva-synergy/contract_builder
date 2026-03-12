import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single contract
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: {
        otherEarnings: true,
        deductions: true,
        salaryRevisions: true,
      },
    });
    
    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

// PUT update contract
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const contract = await prisma.employmentContract.update({
      where: { id },
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
      },
    });
    
    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}

// DELETE contract
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.employmentContract.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
}
