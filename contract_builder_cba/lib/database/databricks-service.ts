import 'server-only';
import axios from 'axios';
import { getDatabricksConfig } from './databricks-config';

// Dynamic import for DBSQLClient to avoid bundling issues in Next.js
let DBSQLClientClass: any;
async function getDBSQLClient() {
  if (!DBSQLClientClass) {
    const databricksSql = await import('@databricks/sql');
    DBSQLClientClass = databricksSql.DBSQLClient;
  }
  return DBSQLClientClass;
}

export interface DatabricksQuery {
  query: string;
  parameters?: Record<string, any>;
  timeout?: number;
}

export interface DatabricksQueryResult {
  data: any[];
  schema: any;
  executionTime: number;
  status: string;
}

class DatabricksService {
  private tokenCache: {
    token: string | null;
    expiresAt: number | null;
  } = {
    token: null,
    expiresAt: null
  };

  async getOAuthToken(): Promise<string> {
    if (this.tokenCache.token && this.tokenCache.expiresAt && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const config = getDatabricksConfig();
    if (!config) throw new Error('Missing required Databricks credentials');

    const { host, clientId, clientSecret } = config;

    try {
      const response = await axios.post(
        `https://${host}/oidc/v1/token`,
        'grant_type=client_credentials&scope=all-apis',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        }
      );

      this.tokenCache.token = response.data.access_token;
      this.tokenCache.expiresAt = Date.now() + ((response.data.expires_in - 300) * 1000);

      return response.data.access_token;
    } catch (error: any) {
      throw new Error('Failed to get OAuth token: ' + (error.response?.data?.error_description || error.response?.data?.error || error.message));
    }
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN'];
    const retryableMessages = ['ECONNRESET', 'ETIMEDOUT', 'timeout', 'ECONNREFUSED', 'ENOTFOUND', 'read ECONNRESET', 'socket hang up'];
    
    return (
      retryableCodes.includes(error.code) ||
      retryableMessages.some(msg => error.message?.includes(msg)) ||
      error.message?.toLowerCase().includes('connection reset') ||
      error.message?.toLowerCase().includes('socket closed')
    );
  }

  async executeQuery(query: DatabricksQuery, options: { maxRows?: number; retries?: number } = {}): Promise<DatabricksQueryResult> {
    const maxRetries = options.retries ?? 3;
    let lastError: any = null;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let client: any = null;
      let session: any = null;
      let connection: any = null;

      try {
        const accessToken = await this.getOAuthToken();
        const config = getDatabricksConfig();
        if (!config) throw new Error('Databricks configuration is missing');

        const DBSQLClient = await getDBSQLClient();
        client = new DBSQLClient();

        connection = await client.connect({
          host: config.host,
          path: config.httpPath,
          token: accessToken
        });

        session = await connection.openSession();
        const queryOperation = await session.executeStatement(query.query, {
          runAsync: true,
          maxRows: options.maxRows || 10000
        });

        const result = await queryOperation.fetchAll();
        await queryOperation.close();
        await session.close();
        await connection.close();
        await client.close();

        return {
          data: result,
          schema: {},
          executionTime: Date.now() - startTime,
          status: 'SUCCESS'
        };
      } catch (error: any) {
        lastError = error;
        if (session) try { await session.close(); } catch (e) {}
        if (connection) try { await connection.close(); } catch (e) {}
        if (client) try { await client.close(); } catch (e) {}

        if (attempt < maxRetries && this.isRetryableError(error)) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        throw error;
      }
    }
    throw lastError || new Error('Query execution failed after retries');
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const result = await this.executeQuery({ query: 'SELECT 1 as test' }, { maxRows: 1 });
      return { success: true, message: 'Successfully connected to Databricks', details: { executionTime: result.executionTime } };
    } catch (error: any) {
      return { success: false, message: 'Failed to connect to Databricks: ' + (error instanceof Error ? error.message : 'Unknown error'), details: error };
    }
  }
}

export const databricksService = new DatabricksService();
