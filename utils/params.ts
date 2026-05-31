export function parseOptionalBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  return undefined;
}
