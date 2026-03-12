import { NextRequest, NextResponse } from 'next/server';
import { SyncOrchestrator } from '@/lib/services/core/sync-orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, year, imoNumbers } = body;

    if (!month || !year) {
      return NextResponse.json({ success: false, message: 'Month and year are required' }, { status: 400 });
    }

    const result = await SyncOrchestrator.syncContractsFromSAC(
      parseInt(month),
      parseInt(year),
      imoNumbers
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error in sync-sac:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  const result = await SyncOrchestrator.testSACConnection();
  return NextResponse.json(result);
}
