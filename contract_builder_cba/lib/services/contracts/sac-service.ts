import 'server-only';
import { databricksService } from '../../database/databricks-service';
import { getDatabricksConfig, getDatabricksSetupInstructions } from '../../database/databricks-config';
import { log, logDebug } from '@/lib/utils/debug-config';

export interface SnowflakeSeafarer {
  NAME: string;
  RANK: string;
  NATIONALITY: string;
  IMO_NUMBER: number;
  CREATED_AT: string;
  SIGN_ON_DATE: string;
  SIGN_OFF_DATE?: string;
  CONTRACT_END_DATE?: string;
  CONTRACT_START_DATE?: string;
  CREW_CODE?: string;
  OLD_CREW_CODE?: string;
  SEA_EXPERIENCE_ID?: number;
  CONTRACT_ID?: number;
  SEAFARER_ID?: number;
}

export interface SACContractData {
  ID: number;
  START_DATE: string;
  END_DATE: string;
  IS_ACTIVE: boolean;
  STATUS: string;
  SOURCE: string;
  SEAFARER_INFO: any;
  VESSEL_INFO: any;
  WAGES_INFO: any;
  REVISED_SALARY_INFO: any;
  METADATA: any;
  CONTRACT_ID: number;
  UUID: string;
  POSITION_ID: number;
  AGREEMENT_TYPE: string;
  AGREEMENT_NO: string;
  EXTERNAL_AGREEMENT_ID: string;
  TERMS: any;
  NOTES: string;
  PLACE_OF_ENGAGEMENT: string;
  IS_DIGITALLY_SIGNED: boolean;
  CBA: any;
  TASK_ID: number;
  CREATED_AT: string;
  UPDATED_AT: string;
  CREATED_BY_NAME: string;
  UPDATED_BY_NAME: string;
  _FIVETRAN_SYNCED?: string;
}

export class SACService {
  private static async getDatabricksClient() {
    try {
      const config = getDatabricksConfig();
      if (!config) throw new Error('Databricks configuration is missing');
      
      const testResult = await databricksService.testConnection();
      if (!testResult.success) throw new Error(`Databricks connection test failed: ${testResult.message}`);
      
      return databricksService;
    } catch (error) {
      const instructions = getDatabricksSetupInstructions();
      console.error('🔍 SACService: Setup instructions:', instructions);
      throw error;
    }
  }

  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await databricksService.testConnection();
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, message: `Databricks connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  static async getSeafarers(month: number, year: number, imoNumbers?: number[]): Promise<SnowflakeSeafarer[]> {
    try {
      const databricks = await this.getDatabricksClient();
      const firstDayOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDayOfMonth = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const firstDayOfNextMonth = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
      
      let query = `
        SELECT 
          COALESCE(
            CASE 
              WHEN FIRST_NAME IS NOT NULL AND LAST_NAME IS NOT NULL THEN CONCAT(FIRST_NAME, ' ', LAST_NAME)
              WHEN FIRST_NAME IS NOT NULL THEN FIRST_NAME
              WHEN LAST_NAME IS NOT NULL THEN LAST_NAME
              ELSE NULL
            END,
            'Unknown'
          ) as NAME,
          CURRENT_RANK_NAME as RANK,
          NATIONALITY_NAME as NATIONALITY,
          IMO_NUMBER,
          CREATED_AT,
          SIGN_ON_DATE,
          CONTRACT_END_DATE,
          CASE 
            WHEN SIGN_OFF_DATE IS NOT NULL THEN SIGN_OFF_DATE
            WHEN SIGN_OFF_DATE IS NULL AND CONTRACT_END_DATE IS NOT NULL AND CONTRACT_END_DATE >= CURRENT_DATE() THEN CONTRACT_END_DATE
            WHEN SIGN_OFF_DATE IS NULL AND (
              UPPER(TRIM(ONBOARD_SAILING_STATUS)) IN ('ONBOARD', 'ON BOARD') OR 
              UPPER(TRIM(REPLACE(CURRENT_STATUS, '-', ' '))) IN ('SIGN ON', 'SIGNON')
            ) 
              THEN CAST('${firstDayOfNextMonth}' AS DATE)
            ELSE NULL
          END as SIGN_OFF_DATE,
          CURRENT_STATUS as CURRENT_STATUS,
          ONBOARD_SAILING_STATUS as ONBOARD_SAILING_STATUS,
          CONTRACT_START_DATE,
          CREW_CODE as CREW_CODE,
          OLD_CREW_CODE as OLD_CREW_CODE,
          SEA_EXPERIENCE_ID as SEA_EXPERIENCE_ID,
          CONTRACT_ID as CONTRACT_ID,
          SEAFARER_ID as SEAFARER_ID
        FROM open_analytics_zone.ks_scratchpad.crew_contracts_data
        WHERE 1=1
      `;

      query += ` AND SIGN_ON_DATE <= '${lastDayOfMonth}'`;
      query += ` AND (
        SIGN_OFF_DATE IS NULL 
        OR SIGN_OFF_DATE >= '${firstDayOfMonth}'
        OR (SIGN_OFF_DATE IS NULL AND CONTRACT_END_DATE >= '${firstDayOfMonth}')
        OR (SIGN_OFF_DATE IS NULL AND CONTRACT_END_DATE IS NULL)
        OR (SIGN_OFF_DATE < SIGN_ON_DATE AND CONTRACT_END_DATE >= '${firstDayOfMonth}')
        OR (SIGN_OFF_DATE < SIGN_ON_DATE AND CONTRACT_END_DATE IS NULL)
      )`;

      if (imoNumbers && imoNumbers.length > 0) {
        const imoNumbersStr = imoNumbers.map(imo => `'${imo}'`).join(',');
        query += ` AND IMO_NUMBER IN (${imoNumbersStr})`;
      }

      query += ` ORDER BY NAME`;
      const result = await databricks.executeQuery({ query });
      if (result.status === 'SUCCESS') return result.data;
      throw new Error(`SAC query failed: ${result.status}`);
    } catch (error) {
      log('Error retrieving seafarers from SAC: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
      throw error;
    }
  }

  static async getContracts(contractIds: number[], imoNumbers?: number[]): Promise<SACContractData[]> {
    try {
      const databricks = await this.getDatabricksClient();
      let query = `
        WITH RankedContracts AS (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY CONTRACT_ID, COALESCE(AGREEMENT_NO, 'UNKNOWN') ORDER BY UPDATED_AT DESC, _FIVETRAN_SYNCED DESC) as rn
          FROM open_analytics_zone.ks_scratchpad.contracts_raw_info_full
          WHERE _FIVETRAN_DELETED = false
      `;

      if (contractIds && contractIds.length > 0) {
        query += ` AND CONTRACT_ID IN (${contractIds.join(', ')})`;
      }

      if (imoNumbers && imoNumbers.length > 0) {
        const imoList = imoNumbers.map(imo => `'${imo}'`).join(', ');
        query += ` AND get_json_object(VESSEL_INFO, '$.IMONumber') IN (${imoList})`;
      }

      query += ` ) SELECT * FROM RankedContracts WHERE rn = 1 ORDER BY START_DATE DESC`;
      const result = await databricks.executeQuery({ query });
      if (result.status === 'SUCCESS') return result.data;
      throw new Error(`SAC contracts query failed: ${result.status}`);
    } catch (error) {
      log('Error retrieving contracts from SAC: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
      throw error;
    }
  }
}
