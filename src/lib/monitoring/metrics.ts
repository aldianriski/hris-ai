/**
 * Metrics Utilities
 * For tracking application metrics and performance
 */

interface MetricData {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

/**
 * Record a metric value
 */
export function recordMetric(
  name: string,
  value: number,
  unit: string = 'count',
  tags?: Record<string, string>
): void {
  const metric: MetricData = {
    name,
    value,
    unit,
    timestamp: new Date().toISOString(),
    tags,
  };

  // In production, this would send to Axiom or other metrics service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Axiom or metrics service
    console.log('[Metric]', JSON.stringify(metric));
  } else {
    console.log(`[Metric] ${name}:`, value, unit, tags || '');
  }
}

/**
 * Increment a counter metric
 */
export function incrementCounter(
  name: string,
  value: number = 1,
  tags?: Record<string, string>
): void {
  recordMetric(name, value, 'count', tags);
}

/**
 * Record timing metric
 */
export function recordTiming(
  name: string,
  durationMs: number,
  tags?: Record<string, string>
): void {
  recordMetric(name, durationMs, 'milliseconds', tags);
}

/**
 * Measure function execution time
 */
export async function measureTiming<T>(
  name: string,
  fn: () => Promise<T> | T,
  tags?: Record<string, string>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    recordTiming(name, duration, tags);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    recordTiming(name, duration, { ...tags, error: 'true' });
    throw error;
  }
}
