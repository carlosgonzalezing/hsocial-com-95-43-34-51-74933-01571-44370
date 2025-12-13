type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

interface RequestRecord {
  timestamp: number;
  success: boolean;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private nextAttempt: number = 0;
  private requests: RequestRecord[] = [];
  
  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN - Service temporarily unavailable');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.recordRequest(true);
  }

  private onFailure(): void {
    this.failures++;
    this.recordRequest(false);
    
    if (this.failures >= this.options.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.options.resetTimeout;
    }
  }

  private recordRequest(success: boolean): void {
    const now = Date.now();
    this.requests.push({ timestamp: now, success });
    
    // Clean old requests
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.options.monitoringPeriod
    );
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureRate(): number {
    if (this.requests.length === 0) return 0;
    
    const failures = this.requests.filter(req => !req.success).length;
    return failures / this.requests.length;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = 0;
    this.requests = [];
  }
}

// Global circuit breakers for different services
export const supabaseCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  monitoringPeriod: 60000 // 1 minute
});

export const engagementCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 20000, // 20 seconds
  monitoringPeriod: 30000 // 30 seconds
});

// Helper function to wrap Supabase operations
export async function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitBreaker: CircuitBreaker = supabaseCircuitBreaker
): Promise<T> {
  return circuitBreaker.execute(operation);
}