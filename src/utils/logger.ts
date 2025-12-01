// src/utils/logger.ts

export interface LogEntry {
  timestamp: string;
  type: 'success' | 'error' | 'query';
  keyword?: string;
  sources?: string[];
  region?: string;
  lookbackDays?: number;
  gapsRequested?: number;
  errorMessage?: string;
  durationMs?: number;
  paymentAmount?: number;
  currency?: string;
  paymentStatus?: string;
  stripeSessionId?: string;
  userCountry?: string;
  userConsentGiven?: boolean;
}

const STORAGE_KEYS = {
  SUCCESS: 'marketgap_success_logs',
  ERROR: 'marketgap_error_logs',
  QUERY: 'marketgap_query_logs',
};

const MAX_LOGS_PER_TYPE = 100;

function getStoredLogs(key: string): LogEntry[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeLogs(key: string, logs: LogEntry[]): void {
  try {
    const trimmedLogs = logs.slice(-MAX_LOGS_PER_TYPE);
    localStorage.setItem(key, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.warn('Failed to store logs:', error);
  }
}

// Send log to Supabase API (non-blocking)
async function sendLogToApi(entry: LogEntry): Promise<void> {
  try {
    fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: entry.type,
        keyword: entry.keyword,
        sources: entry.sources,
        region: entry.region,
        lookbackDays: entry.lookbackDays,
        gapsRequested: entry.gapsRequested,
        errorMessage: entry.errorMessage,
        durationMs: entry.durationMs,
        paymentAmount: entry.paymentAmount,
        currency: entry.currency,
        userCountry: entry.userCountry,
        userConsentGiven: entry.userConsentGiven,
      }),
    }).catch((error) => {
      console.warn('[marketgap] Failed to send log to API:', error);
    });
  } catch (error) {
    console.warn('[marketgap] Failed to send log to API:', error);
  }
}

export function logSuccess(data: {
  keyword: string;
  sources: string[];
  region: string;
  lookbackDays: number;
  gapsRequested: number;
  durationMs: number;
}): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'success',
    ...data,
  };

  const logs = getStoredLogs(STORAGE_KEYS.SUCCESS);
  logs.push(entry);
  storeLogs(STORAGE_KEYS.SUCCESS, logs);

  console.log('[marketgap] Success:', entry);
  sendLogToApi(entry);
}

export function logError(data: {
  keyword?: string;
  sources?: string[];
  region?: string;
  errorMessage: string;
}): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'error',
    ...data,
  };

  const logs = getStoredLogs(STORAGE_KEYS.ERROR);
  logs.push(entry);
  storeLogs(STORAGE_KEYS.ERROR, logs);

  console.error('[marketgap] Error:', entry);
  sendLogToApi(entry);
}

export function logQuery(data: {
  keyword: string;
  sources: string[];
  region: string;
  lookbackDays: number;
  gapsRequested: number;
}): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'query',
    ...data,
  };

  const logs = getStoredLogs(STORAGE_KEYS.QUERY);
  logs.push(entry);
  storeLogs(STORAGE_KEYS.QUERY, logs);

  console.log('[marketgap] Query:', entry);
  sendLogToApi(entry);
}

export function logPaymentSuccess(data: {
  keyword: string;
  sources: string[];
  region: string;
  lookbackDays: number;
  gapsRequested: number;
  paymentAmount: number;
  currency: string;
  stripeSessionId: string;
  userCountry?: string;
}): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'success',
    paymentStatus: 'completed',
    userConsentGiven: true,
    ...data,
  };

  const logs = getStoredLogs(STORAGE_KEYS.SUCCESS);
  logs.push(entry);
  storeLogs(STORAGE_KEYS.SUCCESS, logs);

  console.log('[marketgap] Payment Success:', entry);
  sendLogToApi(entry);
}

export function logPaymentError(data: {
  keyword?: string;
  gapsRequested?: number;
  errorMessage: string;
  stripeSessionId?: string;
}): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'error',
    paymentStatus: 'failed',
    ...data,
  };

  const logs = getStoredLogs(STORAGE_KEYS.ERROR);
  logs.push(entry);
  storeLogs(STORAGE_KEYS.ERROR, logs);

  console.error('[marketgap] Payment Error:', entry);
  sendLogToApi(entry);
}

export function getSuccessLogs(): LogEntry[] {
  return getStoredLogs(STORAGE_KEYS.SUCCESS);
}

export function getErrorLogs(): LogEntry[] {
  return getStoredLogs(STORAGE_KEYS.ERROR);
}

export function getQueryLogs(): LogEntry[] {
  return getStoredLogs(STORAGE_KEYS.QUERY);
}

export function clearAllLogs(): void {
  localStorage.removeItem(STORAGE_KEYS.SUCCESS);
  localStorage.removeItem(STORAGE_KEYS.ERROR);
  localStorage.removeItem(STORAGE_KEYS.QUERY);
}
