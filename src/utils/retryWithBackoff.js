// utils/retryWithBackoff.js
/**
 * Enhanced retry utility with metrics, circuit breaker, and better error handling
 */

// Metrics collection
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  retryAttempts: 0,
  circuitBreakerTrips: 0,
  lastReset: Date.now()
};

// Circuit breaker implementation
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.halfOpenTimeout = options.halfOpenTimeout || 30000; // 30 seconds
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    this.halfOpenAttempts = 0;
    this.maxHalfOpenAttempts = options.maxHalfOpenAttempts || 3;
  }

  canExecute() {
    const now = Date.now();
    
    switch (this.state) {
      case 'CLOSED':
        return true;
      
      case 'OPEN':
        if (now >= this.nextAttemptTime) {
          this.state = 'HALF_OPEN';
          this.halfOpenAttempts = 0;
          return true;
        }
        return false;
      
      case 'HALF_OPEN':
        if (this.halfOpenAttempts >= this.maxHalfOpenAttempts) {
          this.state = 'OPEN';
          this.nextAttemptTime = now + this.resetTimeout;
          return false;
        }
        this.halfOpenAttempts++;
        return true;
      
      default:
        return false;
    }
  }

  recordSuccess() {
    this.failures = 0;
    this.halfOpenAttempts = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      metrics.circuitBreakerTrips++;
    } else if (this.state === 'CLOSED' && this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      metrics.circuitBreakerTrips++;
      console.warn(`Circuit breaker tripped to OPEN state. Next attempt at: ${new Date(this.nextAttemptTime).toISOString()}`);
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      halfOpenAttempts: this.halfOpenAttempts
    };
  }
}

// Create circuit breakers for different types of requests
export const circuitBreakers = {
  default: new CircuitBreaker(),
  api: new CircuitBreaker({ failureThreshold: 3, resetTimeout: 30000 }),
  database: new CircuitBreaker({ failureThreshold: 2, resetTimeout: 120000 }),
  external: new CircuitBreaker({ failureThreshold: 4, resetTimeout: 60000 })
};

/**
 * Enhanced exponential backoff retry with circuit breaker
 */
export const retryWithBackoff = async (
  fn,
  options = {}
) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    timeout = 30000,
    circuitBreakerType = 'default',
    operationName = 'unknown',
    shouldRetry = (error) => {
      // Retry on network errors, 429, 5xx, and specific error types
      if (!error.response) return true; // Network error
      
      const status = error.response?.status;
      return status === 429 || // Rate limit
             status === 408 || // Timeout
             status >= 500 || // Server errors
             (status >= 400 && status < 500 && [
               408, 429, 502, 503, 504 // Specific client errors to retry
             ].includes(status));
    },
    onRetry = (attempt, delay, error) => {
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms for ${operationName}. Error: ${error.message}`);
    },
    onSuccess = (result, attempts, totalTime) => {
      console.log(`Operation ${operationName} succeeded after ${attempts} attempt(s) in ${totalTime}ms`);
    },
    onFailure = (error, attempts, totalTime) => {
      console.error(`Operation ${operationName} failed after ${attempts} attempt(s) in ${totalTime}ms. Final error: ${error.message}`);
    }
  } = options;

  const circuitBreaker = circuitBreakers[circuitBreakerType] || circuitBreakers.default;
  const startTime = Date.now();
  metrics.totalRequests++;

  // Check circuit breaker
  if (!circuitBreaker.canExecute()) {
    const state = circuitBreaker.getState();
    throw new Error(`Circuit breaker is ${state.state}. Request blocked for ${operationName}. Next attempt at ${new Date(state.nextAttemptTime).toISOString()}`);
  }

  let lastError;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timeout after ${timeout}ms`)), timeout);
      });

      // Execute function with timeout
      const result = await Promise.race([fn(), timeoutPromise]);
      
      // Record success
      circuitBreaker.recordSuccess();
      metrics.successfulRequests++;
      
      const totalTime = Date.now() - startTime;
      onSuccess(result, attempt, totalTime);
      
      return result;
      
    } catch (error) {
      lastError = error;
      metrics.failedRequests++;
      
      // Check if we should retry
      if (attempt === maxRetries || !shouldRetry(error)) {
        circuitBreaker.recordFailure();
        const totalTime = Date.now() - startTime;
        onFailure(error, attempt, totalTime);
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const jitter = Math.random() * 0.3 * exponentialDelay; // Up to 30% jitter
      const totalDelay = Math.min(exponentialDelay + jitter, maxDelay);
      
      metrics.retryAttempts++;
      onRetry(attempt, totalDelay, error);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  // If we get here, all retries failed
  circuitBreaker.recordFailure();
  const totalTime = Date.now() - startTime;
  onFailure(lastError, attempt, totalTime);
  throw lastError;
};

/**
 * Sequential execution with delays and error handling
 */
export const executeSequentially = async (
  tasks,
  options = {}
) => {
  const {
    delayBetween = 500,
    continueOnError = true,
    taskNames = [],
    onTaskStart = (index, name) => {
      console.log(`Starting task ${index + 1}/${tasks.length}: ${name}`);
    },
    onTaskComplete = (index, name, result, duration) => {
      console.log(`Completed task ${index + 1}/${tasks.length}: ${name} in ${duration}ms`);
    },
    onTaskError = (index, name, error) => {
      console.error(`Task ${index + 1}/${tasks.length} failed: ${name}. Error: ${error.message}`);
    }
  } = options;

  const results = [];
  const errors = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const taskName = taskNames[i] || `Task ${i + 1}`;
    const taskStartTime = Date.now();
    
    onTaskStart(i, taskName);
    
    try {
      const result = await tasks[i]();
      const duration = Date.now() - taskStartTime;
      
      results.push({
        success: true,
        data: result,
        taskName,
        duration,
        index: i
      });
      
      onTaskComplete(i, taskName, result, duration);
      
    } catch (error) {
      const duration = Date.now() - taskStartTime;
      
      onTaskError(i, taskName, error);
      
      if (!continueOnError) {
        throw error;
      }
      
      results.push({
        success: false,
        error: error.message,
        taskName,
        duration,
        index: i
      });
      
      errors.push({
        taskName,
        error,
        index: i
      });
    }
    
    // Add delay between tasks if not the last task
    if (i < tasks.length - 1 && delayBetween > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetween));
    }
  }
  
  return {
    results,
    errors,
    totalTasks: tasks.length,
    successfulTasks: results.filter(r => r.success).length,
    failedTasks: results.filter(r => !r.success).length,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
  };
};

/**
 * Batch processing with concurrency control
 */
export const processInBatches = async (
  items,
  processor,
  options = {}
) => {
  const {
    batchSize = 5,
    delayBetweenBatches = 1000,
    maxConcurrent = 3,
    onBatchStart = (batchIndex, start, end) => {
      console.log(`Processing batch ${batchIndex + 1}: items ${start + 1}-${end + 1}`);
    },
    onBatchComplete = (batchIndex, results, duration) => {
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Completed batch ${batchIndex + 1} in ${duration}ms: ${successCount}/${results.length} successful`);
    },
    onItemError = (item, error, index) => {
      console.error(`Item ${index} failed:`, error.message);
    }
  } = options;

  const allResults = [];
  const batchResults = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batchStartTime = Date.now();
    const batch = items.slice(i, i + batchSize);
    const batchIndex = Math.floor(i / batchSize);
    
    onBatchStart(batchIndex, i, i + batch.length - 1);
    
    // Process batch with concurrency control
    const batchPromises = [];
    for (let j = 0; j < batch.length; j += maxConcurrent) {
      const concurrentBatch = batch.slice(j, j + maxConcurrent);
      const promises = concurrentBatch.map((item, index) => {
        const globalIndex = i + j + index;
        return Promise.resolve(processor(item, globalIndex)).catch(error => {
          onItemError(item, error, globalIndex);
          throw error;
        });
      });
      
      batchPromises.push(...promises);
      
      // Add delay between concurrent batches if needed
      if (j + maxConcurrent < batch.length && maxConcurrent > 1) {
        batchPromises.push(new Promise(resolve => setTimeout(resolve, 100)));
      }
    }
    
    // Wait for all promises in batch to settle
    const results = await Promise.allSettled(batchPromises);
    const duration = Date.now() - batchStartTime;
    
    onBatchComplete(batchIndex, results, duration);
    
    batchResults.push({
      batchIndex,
      startIndex: i,
      endIndex: i + batch.length - 1,
      results,
      duration,
      successCount: results.filter(r => r.status === 'fulfilled').length,
      failureCount: results.filter(r => r.status === 'rejected').length
    });
    
    allResults.push(...results);
    
    // Add delay between batches if not the last batch
    if (i + batchSize < items.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return {
    allResults,
    batchResults,
    totalItems: items.length,
    successfulItems: allResults.filter(r => r.status === 'fulfilled').length,
    failedItems: allResults.filter(r => r.status === 'rejected').length,
    totalBatches: batchResults.length
  };
};

/**
 * Create a retryable function with caching
 */
export const createRetryableFunction = (fn, options = {}) => {
  const {
    cache = new Map(),
    cacheKey = (args) => JSON.stringify(args),
    cacheTTL = 300000, // 5 minutes
    ...retryOptions
  } = options;
  
  return async (...args) => {
    const key = cacheKey(args);
    const cached = cache.get(key);
    
    // Return cached result if valid
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      console.log(`Cache hit for ${retryOptions.operationName || 'function'}`);
      return cached.data;
    }
    
    // Execute with retry
    const result = await retryWithBackoff(
      () => fn(...args),
      retryOptions
    );
    
    // Cache the result
    cache.set(key, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  };
};

/**
 * Get metrics
 */
export const getMetrics = () => ({
  ...metrics,
  successRate: metrics.totalRequests > 0 
    ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2) + '%'
    : '0%',
  failureRate: metrics.totalRequests > 0
    ? (metrics.failedRequests / metrics.totalRequests * 100).toFixed(2) + '%'
    : '0%',
  retryRate: metrics.totalRequests > 0
    ? (metrics.retryAttempts / metrics.totalRequests * 100).toFixed(2) + '%'
    : '0%',
  uptime: Date.now() - metrics.lastReset,
  circuitBreakers: Object.entries(circuitBreakers).reduce((acc, [key, cb]) => {
    acc[key] = cb.getState();
    return acc;
  }, {})
});

/**
 * Reset metrics
 */
export const resetMetrics = () => {
  Object.keys(metrics).forEach(key => {
    if (typeof metrics[key] === 'number') {
      metrics[key] = 0;
    }
  });
  metrics.lastReset = Date.now();
  
  // Reset circuit breakers
  Object.values(circuitBreakers).forEach(cb => {
    cb.recordSuccess();
  });
};

// Convenience functions
export const retryApiCall = (fn, options) => retryWithBackoff(fn, { ...options, circuitBreakerType: 'api' });
export const retryDatabaseCall = (fn, options) => retryWithBackoff(fn, { ...options, circuitBreakerType: 'database' });
export const retryExternalCall = (fn, options) => retryWithBackoff(fn, { ...options, circuitBreakerType: 'external' });

// Batch processing helpers
export const batchMap = async (items, mapper, options) => {
  return processInBatches(items, mapper, options);
};

export const batchFilter = async (items, predicate, options) => {
  const results = await processInBatches(items, predicate, options);
  return items.filter((_, index) => {
    const result = results.allResults[index];
    return result.status === 'fulfilled' && result.value;
  });
};

// Rate limiting helper
export const withRateLimit = (fn, requestsPerSecond = 2) => {
  let lastCallTime = 0;
  const minDelay = 1000 / requestsPerSecond;
  
  return async (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastCall));
    }
    
    lastCallTime = Date.now();
    return fn(...args);
  };
};

// Default export
export default {
  retryWithBackoff,
  executeSequentially,
  processInBatches,
  createRetryableFunction,
  getMetrics,
  resetMetrics,
  CircuitBreaker,
  circuitBreakers,
  retryApiCall,
  retryDatabaseCall,
  retryExternalCall,
  batchMap,
  batchFilter,
  withRateLimit
};