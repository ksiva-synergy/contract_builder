export const log = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  console.log(`[${level.toUpperCase()}] ${message}`);
};

export const logDebug = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`);
  }
};
