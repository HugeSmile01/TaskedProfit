export function normalizeExportFilters(filters: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      (entry): entry is [string, string | number | boolean] =>
        typeof entry[1] === 'string' || typeof entry[1] === 'number' || typeof entry[1] === 'boolean',
    ),
  );
}
