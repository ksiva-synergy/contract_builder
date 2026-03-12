import 'server-only';
import { log } from '@/lib/utils/debug-config';
import { SACService } from '@/lib/services/contracts/sac-service';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface SyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
}

export class SyncOrchestrator {
  static async testSACConnection(): Promise<SyncResult> {
    const result = await SACService.testConnection();
    return {
      success: result.success,
      message: result.message,
      syncedCount: 0
    };
  }

  static async syncSeafarersFromSAC(month: number, year: number, imoNumbers?: number[]): Promise<SyncResult> {
    try {
      log(`Starting seafarer sync from SAC for ${month}/${year}`);
      const sacSeafarers = await SACService.getSeafarers(month, year, imoNumbers);
      
      let syncedCount = 0;
      for (const s of sacSeafarers) {
        try {
          // Upsert Vessel first if possible
          if (s.IMO_NUMBER) {
             await prisma.vessels.upsert({
               where: { imo_number: String(s.IMO_NUMBER) },
               update: { name: "Unknown Vessel" }, // Basic info
               create: { 
                 id: crypto.randomUUID(),
                 imo_number: String(s.IMO_NUMBER), 
                 name: "Unknown Vessel",
                 flag: "Unknown"
               }
             });
          }

          // Upsert Seafarer
          await prisma.seafarers.upsert({
            where: { id: s.SEAFARER_ID ? String(s.SEAFARER_ID) : crypto.randomUUID() }, // This is a bit weak if ID is missing
            update: {
              name: s.NAME,
              rank: s.RANK,
              nationality: s.NATIONALITY,
              sign_on_date: s.SIGN_ON_DATE ? new Date(s.SIGN_ON_DATE) : null,
              sign_off_date: s.SIGN_OFF_DATE ? new Date(s.SIGN_OFF_DATE) : null,
              updated_at: new Date()
            },
            create: {
              id: s.SEAFARER_ID ? String(s.SEAFARER_ID) : crypto.randomUUID(),
              name: s.NAME,
              rank: s.RANK,
              nationality: s.NATIONALITY,
              sign_on_date: s.SIGN_ON_DATE ? new Date(s.SIGN_ON_DATE) : null,
              sign_off_date: s.SIGN_OFF_DATE ? new Date(s.SIGN_OFF_DATE) : null,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          syncedCount++;
        } catch (err) {
          log(`Error syncing seafarer ${s.NAME}: ${err}`, 'error');
        }
      }
      return { success: true, message: `Synced ${syncedCount} seafarers`, syncedCount };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error', syncedCount: 0 };
    }
  }

  static async syncContractsFromSAC(month: number, year: number, imoNumbers?: number[]): Promise<SyncResult> {
    try {
      log(`Starting contract sync from SAC for ${month}/${year}`);
      
      // Ensure seafarers/vessels exist
      await this.syncSeafarersFromSAC(month, year, imoNumbers);

      const sacSeafarers = await SACService.getSeafarers(month, year, imoNumbers);
      const contractIds = sacSeafarers.map(s => s.CONTRACT_ID).filter((id): id is number => id !== undefined);
      
      if (contractIds.length === 0) {
        return { success: true, message: 'No contract IDs found in seafarer data', syncedCount: 0 };
      }

      const contractsData = await SACService.getContracts(contractIds, imoNumbers);
      
      let syncedCount = 0;
      for (const contract of contractsData) {
        try {
          await prisma.contracts.upsert({
            where: {
              contract_id_agreement_no: {
                contract_id: BigInt(contract.CONTRACT_ID),
                agreement_no: contract.AGREEMENT_NO || 'UNKNOWN'
              }
            },
            update: {
              start_date: contract.START_DATE ? new Date(contract.START_DATE) : null,
              end_date: contract.END_DATE ? new Date(contract.END_DATE) : null,
              status: contract.STATUS,
              is_active: contract.IS_ACTIVE,
              seafarer_info: contract.SEAFARER_INFO,
              vessel_info: contract.VESSEL_INFO,
              wages_info: contract.WAGES_INFO,
              updated_at: new Date()
            },
            create: {
              contract_id: BigInt(contract.CONTRACT_ID),
              agreement_no: contract.AGREEMENT_NO || 'UNKNOWN',
              start_date: contract.START_DATE ? new Date(contract.START_DATE) : null,
              end_date: contract.END_DATE ? new Date(contract.END_DATE) : null,
              status: contract.STATUS,
              is_active: contract.IS_ACTIVE,
              seafarer_info: contract.SEAFARER_INFO,
              vessel_info: contract.VESSEL_INFO,
              wages_info: contract.WAGES_INFO,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          syncedCount++;
        } catch (err) {
          log(`Error upserting contract ${contract.CONTRACT_ID}: ${err}`, 'error');
        }
      }

      return {
        success: true,
        message: `Successfully synced ${syncedCount} contracts from SAC`,
        syncedCount
      };
    } catch (error) {
      log('Error in sync orchestration: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        syncedCount: 0
      };
    }
  }
}
