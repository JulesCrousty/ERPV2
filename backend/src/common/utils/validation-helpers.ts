export function ensureRequired<T extends object>(payload: T, requiredKeys: (keyof T)[]): void {
  const missing = requiredKeys.filter((key) => payload[key] === undefined || payload[key] === null || payload[key] === '');
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

export function normalizeIdentifier(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '-');
}

export function hasPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.includes(required) || userPermissions.includes('*');
}
