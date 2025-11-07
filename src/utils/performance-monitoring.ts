export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
}

export interface PerformanceOptions {
  enabled?: boolean
  threshold?: number
}

class PerformanceMonitoring {
  private static instance: PerformanceMonitoring;
  private enabled = true;
  private metrics: PerformanceMetric[] = [];

  private constructor() {}

  public static getInstance(): PerformanceMonitoring {
    if (!PerformanceMonitoring.instance) {
      PerformanceMonitoring.instance = new PerformanceMonitoring();
    }
    return PerformanceMonitoring.instance;
  }

  public enable(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public measure(name: string, startMark?: string, endMark?: string): void {
    if (!this.enabled) {
      return;
    }

    if (startMark && endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name);
    }

    const measure = performance.getEntriesByName(name).pop();
    if (measure) {
      this.metrics.push({
        name,
        value: measure.duration,
        timestamp: Date.now(),
      });
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
  }
}

export default PerformanceMonitoring;