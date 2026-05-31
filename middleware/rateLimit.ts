const cache = new Map<string, { count: number; resetAt: number }>();

// Production note: use a distributed backend (e.g. Redis) for multi-instance deployments.
export function checkRateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  for (const [cacheKey, value] of cache.entries()) {
    if (value.resetAt < now) {
      cache.delete(cacheKey);
    }
  }

  const current = cache.get(key);

  if (!current || current.resetAt < now) {
    cache.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}
