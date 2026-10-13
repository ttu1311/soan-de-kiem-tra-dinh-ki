/**
 * Giới hạn số lần gọi AI theo địa chỉ IP (trong bộ nhớ, đủ để chặn lạm dụng đơn giản).
 * Trên môi trường serverless, mỗi phiên bản hàm có bộ đếm riêng — chỉ là lớp bảo vệ "tốt nhất có thể".
 */
export interface RateLimiter {
  allow(key: string): boolean;
}

export function createRateLimiter(max: number, windowMs: number, now: () => number = Date.now): RateLimiter {
  const hits = new Map<string, number[]>();
  let lastSweep = now();
  return {
    allow(key) {
      const t = now();
      if (t - lastSweep > windowMs) {
        for (const [k, list] of hits) {
          if (list.every((x) => t - x > windowMs)) hits.delete(k);
        }
        lastSweep = t;
      }
      const recent = (hits.get(key) ?? []).filter((x) => t - x <= windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      return true;
    },
  };
}

export function rateLimiterFromEnv(env: NodeJS.ProcessEnv = process.env): RateLimiter {
  const max = Number(env.AI_RATE_LIMIT);
  return createRateLimiter(Number.isFinite(max) && max > 0 ? max : 40, 10 * 60 * 1000);
}
