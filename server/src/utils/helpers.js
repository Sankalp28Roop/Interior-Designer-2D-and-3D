import crypto from 'crypto';

export function generateId(prefix = '') {
  const randomStr = crypto.randomBytes(8).toString('hex');
  return prefix ? `${prefix}_${randomStr}` : randomStr;
}

export function safeJsonParse(str, fallback = null) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(obj, fallback = '{}') {
  if (obj === undefined || obj === null) return fallback;
  try {
    return JSON.stringify(obj);
  } catch {
    return fallback;
  }
}
