const isTest = process.env.NODE_ENV === 'test';

export const logger = {
  info: (...args: unknown[]) => !isTest && console.log('[info]', ...args),
  warn: (...args: unknown[]) => !isTest && console.warn('[warn]', ...args),
  error: (...args: unknown[]) => !isTest && console.error('[error]', ...args),
};
