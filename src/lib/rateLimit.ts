import { NextResponse } from "next/server";

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const trackers = new Map<string, RateLimitTracker>();

// Periodic cleanup of expired entries
if (typeof setInterval !== "undefined") {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, tracker] of trackers.entries()) {
      if (now > tracker.resetTime) {
        trackers.delete(key);
      }
    }
  }, 60000);
  
  if (interval && typeof interval.unref === "function") {
    interval.unref();
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Checks request limits for a specific IP.
 * Defaults to 10 requests per minute.
 */
export function rateLimit(ip: string, limit = 10, windowMs = 60000): RateLimitResult {
  const now = Date.now();
  let tracker = trackers.get(ip);

  if (!tracker || now > tracker.resetTime) {
    tracker = {
      count: 0,
      resetTime: now + windowMs,
    };
    trackers.set(ip, tracker);
  }

  tracker.count++;

  const remaining = Math.max(0, limit - tracker.count);
  return {
    success: tracker.count <= limit,
    limit,
    remaining,
    resetTime: tracker.resetTime,
  };
}

/**
 * Returns a standardized rate limit exceed response (429 Too Many Requests).
 */
export function rateLimitResponse(remaining: number, resetTime: number) {
  const resetSeconds = Math.ceil((resetTime - Date.now()) / 1000);
  
  return new NextResponse(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED"
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(resetSeconds > 0 ? resetSeconds : 0),
        "Retry-After": String(resetSeconds > 0 ? resetSeconds : 0),
      },
    }
  );
}
