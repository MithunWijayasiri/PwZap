/**
 * A simple client-side rate limiter
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number; // in milliseconds

  /**
   * Create a new rate limiter
   * @param maxRequests Maximum number of requests allowed in the time window
   * @param timeWindowSeconds Time window in seconds
   */
  constructor(maxRequests: number, timeWindowSeconds: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowSeconds * 1000;
  }

  /**
   * Check if a request can be made
   * @returns True if the request is allowed, false otherwise
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove timestamps outside the time window
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    // Check if we're under the limit
    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true;
    }
    
    return false;
  }

  /**
   * Get the time in milliseconds until the next request can be made
   * @returns Time in milliseconds, or 0 if a request can be made now
   */
  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) {
      return 0;
    }
    
    // Sort timestamps in ascending order
    const sortedTimestamps = [...this.timestamps].sort((a, b) => a - b);
    
    // Calculate when the oldest request will expire
    const oldestTimestamp = sortedTimestamps[0];
    const timeUntilExpiry = this.timeWindow - (Date.now() - oldestTimestamp);
    
    return Math.max(0, timeUntilExpiry);
  }
} 