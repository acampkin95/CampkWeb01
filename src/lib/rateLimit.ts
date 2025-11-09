const buckets = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.expiresAt < now) {
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return { limited: false, remaining: max - 1 };
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return { limited: true, remaining: 0, retryAfter: bucket.expiresAt - now };
  }
  return { limited: false, remaining: max - bucket.count };
}
