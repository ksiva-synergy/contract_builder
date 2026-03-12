export interface DatabricksConfig {
  host: string;
  clientId: string;
  clientSecret: string;
  httpPath: string;
  workspaceId?: string;
}

export function getDatabricksConfig(): DatabricksConfig | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  const config = {
    host: process.env.DATABRICKS_HOST,
    clientId: process.env.DATABRICKS_CLIENT_ID,
    clientSecret: process.env.DATABRICKS_CLIENT_SECRET,
    httpPath: process.env.DATABRICKS_HTTP_PATH,
    workspaceId: process.env.DATABRICKS_WORKSPACE_ID
  };

  const requiredFields = ['host', 'clientId', 'clientSecret', 'httpPath'];
  const missingFields = requiredFields.filter(field => !config[field as keyof DatabricksConfig]);

  if (missingFields.length > 0) {
    console.warn('Missing Databricks configuration fields:', missingFields);
    return null;
  }

  return config as DatabricksConfig;
}

export function validateDatabricksConfig(config: DatabricksConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.host) errors.push('DATABRICKS_HOST is required');
  if (!config.clientId) errors.push('DATABRICKS_CLIENT_ID is required');
  if (!config.clientSecret) errors.push('DATABRICKS_CLIENT_SECRET is required');
  if (!config.httpPath) errors.push('DATABRICKS_HTTP_PATH is required');

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getDatabricksSetupInstructions(): string {
  return `
To enable Databricks integration, add the following environment variables to your .env.local file:

DATABRICKS_HOST=your_databricks_host (e.g., adb-xyz.azuredatabricks.net)
DATABRICKS_CLIENT_ID=your_client_id
DATABRICKS_CLIENT_SECRET=your_client_secret
DATABRICKS_HTTP_PATH=your_sql_warehouse_http_path (e.g., /sql/1.0/warehouses/abc123def456)
DATABRICKS_WORKSPACE_ID=your_workspace_id (optional)

To find the HTTP_PATH:
1. Go to your Databricks workspace
2. Navigate to SQL Warehouses
3. Click on your SQL warehouse
4. Go to Connection Details tab
5. Copy the HTTP Path value

Note: Databricks integration only works on the server side due to security requirements.
  `.trim();
}
