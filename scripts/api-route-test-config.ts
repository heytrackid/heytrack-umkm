export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export interface RouteTestConfigEntry {
  /**
   * Route pattern as defined by the App Router directory structure.
   * Example: `/api/orders/[id]`
   */
  pattern: string;
  /** Optional single method to target; if omitted applies to all detected methods. */
  method?: HttpMethod;
  /** Optional list of methods if the override should only cover a subset. */
  methods?: HttpMethod[];
  /**
   * Actual request path to use when the pattern contains dynamic segments.
   * Example: `/api/orders/123`.
   */
  actualPath?: string;
  /** Query string key/value pairs appended to the request URL. */
  query?: Record<string, string>;
  /** JSON payload for non-GET requests. */
  payload?: unknown;
  /** Additional headers merged with the defaults. */
  headers?: Record<string, string>;
  /**
   * Expected HTTP status (single value or list). Defaults to 200.
   */
  expectedStatus?: number | number[];
  /** Skip execution but keep the entry for documentation purposes. */
  skip?: boolean;
  /** Retry attempts for flaky endpoints (default 0). */
  retries?: number;
  /** Per-route timeout override in milliseconds (default 15000). */
  timeoutMs?: number;
  /** Free-form description displayed in the report. */
  description?: string;
}

export const routeTestConfig: RouteTestConfigEntry[] = [
  // Example override — replace with real values as needed.
  // {
  //   pattern: '/api/orders/[id]',
  //   method: 'GET',
  //   actualPath: '/api/orders/example-order-id',
  //   expectedStatus: 200,
  //   description: 'Fetch sample order by id',
  // },
];
