export interface PerformanceOperation {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  context?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private operations: Map<string, PerformanceOperation> = new Map();
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startOperation(operationId: string): void {
    this.operations.set(operationId, {
      id: operationId,
      startTime: performance.now(),
    });
  }

  endOperation(operationId: string, context?: Record<string, unknown>): number | null {
    const operation = this.operations.get(operationId);
    if (!operation) {
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - operation.startTime;

    this.operations.set(operationId, {
      ...operation,
      endTime,
      duration,
      context,
    });

    return duration;
  }

  async measure<T>(
    operationId: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    this.startOperation(operationId);
    try {
      const result = await fn();
      this.endOperation(operationId, context);
      return result;
    } catch (error) {
      this.endOperation(operationId, context);
      throw error;
    }
  }

  getOperation(operationId: string): PerformanceOperation | undefined {
    return this.operations.get(operationId);
  }

  clearOperations(): void {
    this.operations.clear();
  }
  
  getStats(): {
    totalOperations: number;
    completedOperations: number;
    activeOperations: number;
    avgDuration: number | null;
  } {
    let completedCount = 0;
    let totalDuration = 0;
    
    for (const operation of this.operations.values()) {
      if (operation.duration !== undefined) {
        completedCount++;
        totalDuration += operation.duration;
      }
    }
    
    return {
      totalOperations: this.operations.size,
      completedOperations: completedCount,
      activeOperations: this.operations.size - completedCount,
      avgDuration: completedCount > 0 ? totalDuration / completedCount : null
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();