#!/usr/bin/env tsx
/* eslint-disable no-console */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

import type { HttpMethod, RouteTestConfigEntry } from './api-route-test-config.js';
import { routeTestConfig } from './api-route-test-config.js';

type TestStatus = 'success' | 'failed' | 'skipped';

interface RouteFileDefinition {
  pattern: string;
  filePath: string;
  methods: HttpMethod[];
  hasDynamicSegment: boolean;
}

interface RouteTestPlan {
  pattern: string;
  method: HttpMethod;
  urlPath: string;
  query?: Record<string, string>;
  payload?: unknown;
  headers: Record<string, string>;
  expectedStatus: number[];
  skipReason?: string;
  description?: string;
  timeoutMs: number;
  retries: number;
  hasDynamicSegment: boolean;
  filePath: string;
}

interface RouteTestResult {
  pattern: string;
  method: HttpMethod;
  url: string;
  status: TestStatus;
  httpStatus?: number;
  durationMs?: number;
  attempts: number;
  expectedStatus: number[];
  description?: string;
  bodyPreview?: unknown;
  error?: string;
  skipReason?: string;
}

const PROJECT_ROOT = process.cwd();
const API_DIR = path.join(PROJECT_ROOT, 'src', 'app', 'api');
const LOG_FILE = path.join(PROJECT_ROOT, 'logs', 'api-test-report.json');
const INVENTORY_FILE = path.join(PROJECT_ROOT, 'logs', 'api-route-inventory.json');
const METHOD_REGEX = /export\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)/g;
const DEFAULT_TIMEOUT_MS = Number(process.env.API_TEST_TIMEOUT ?? 15_000);
const baseUrl = process.env.API_TEST_BASE_URL ?? 'http://localhost:3000';
const bearerToken = process.env.API_TEST_TOKEN;

const defaultHeaders: Record<string, string> = {
  Accept: 'application/json',
};

if (bearerToken) {
  defaultHeaders.Authorization = `Bearer ${bearerToken}`;
}

async function main(): Promise<void> {
  const routeDefinitions = await collectRouteDefinitions(API_DIR);
  if (routeDefinitions.length === 0) {
    console.error('No API route files found under src/app/api.');
    process.exitCode = 1;
    return;
  }

  await persistInventory(routeDefinitions);

  const plans = buildTestPlans(routeDefinitions, routeTestConfig);
  if (plans.length === 0) {
    console.error('No executable API routes detected. Ensure route test config is defined.');
    process.exitCode = 1;
    return;
  }

  const results: RouteTestResult[] = [];
  for (const plan of plans) {
    if (plan.skipReason) {
      console.warn(`[SKIP] ${plan.method} ${plan.urlPath} — ${plan.skipReason}`);
      results.push({
        pattern: plan.pattern,
        method: plan.method,
        url: plan.urlPath,
        status: 'skipped',
        expectedStatus: plan.expectedStatus,
        description: plan.description,
        skipReason: plan.skipReason,
        attempts: 0,
      });
      continue;
    }

    const maxAttempts = plan.retries + 1;
    let attempt = 0;
    let success = false;
    let lastResult: RouteTestResult | null = null;

    while (attempt < maxAttempts && !success) {
      attempt += 1;
      try {
        const singleResult = await executePlan(plan);
        success = singleResult.status === 'success';
        lastResult = { ...singleResult, attempts: attempt };
        if (!success && attempt < maxAttempts) {
          console.warn(
            `[RETRY] ${plan.method} ${plan.urlPath} — attempt ${attempt} failed, retrying...`,
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        lastResult = {
          pattern: plan.pattern,
          method: plan.method,
          url: plan.urlPath,
          status: 'failed',
          expectedStatus: plan.expectedStatus,
          description: plan.description,
          error: errorMessage,
          attempts: attempt,
        };
        console.error(`[ERROR] ${plan.method} ${plan.urlPath} — ${errorMessage}`);
      }
    }

    if (lastResult) {
      results.push(lastResult);
      logResult(lastResult);
    }
  }

  await persistReport(results, routeDefinitions);

  const failed = results.filter((r) => r.status === 'failed');
  if (failed.length > 0) {
    console.error(`\n${failed.length} route(s) failed. See ${path.relative(PROJECT_ROOT, LOG_FILE)} for details.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll tested routes succeeded (skipped: ${results.filter((r) => r.status === 'skipped').length}).`);
  }
}

async function collectRouteDefinitions(dir: string): Promise<RouteFileDefinition[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const definitions: RouteFileDefinition[] = [];

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await collectRouteDefinitions(fullPath);
        definitions.push(...nested);
      } else if (entry.isFile() && /^route\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
        const content = await readFile(fullPath, 'utf8');
        const methods = extractMethods(content);
        const relativeDir = path.dirname(path.relative(path.join(PROJECT_ROOT, 'src', 'app'), fullPath));
        const normalizedDir = relativeDir.split(path.sep).join('/');
        const pattern = `/${normalizedDir}`.replace(/\/+/g, '/');
        definitions.push({
          pattern,
          filePath: fullPath,
          methods,
          hasDynamicSegment: pattern.includes('['),
        });
      }
    }),
  );

  return definitions.sort((a, b) => a.pattern.localeCompare(b.pattern));
}

function extractMethods(content: string): HttpMethod[] {
  const found = new Set<HttpMethod>();
  let match: RegExpExecArray | null;
  while ((match = METHOD_REGEX.exec(content)) !== null) {
    found.add(match[1] as HttpMethod);
  }
  if (found.size === 0) {
    // Default to GET if no exported method is detected.
    found.add('GET');
  }
  return Array.from(found);
}

function buildTestPlans(
  definitions: RouteFileDefinition[],
  overrides: RouteTestConfigEntry[],
): RouteTestPlan[] {
  const plans: RouteTestPlan[] = [];

  for (const definition of definitions) {
    for (const method of definition.methods) {
      const override = resolveOverride(definition.pattern, method, overrides);
      const expectedStatus = normalizeExpectedStatus(override?.expectedStatus);
      const headers = { ...defaultHeaders, ...(override?.headers ?? {}) };
      const timeoutMs = override?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
      const retries = override?.retries ?? 0;
      const actualPath = override?.actualPath ?? definition.pattern;
      const hasDynamicSegment = definition.hasDynamicSegment;

      const skipReason = override?.skip
        ? 'Marked as skipped via config'
        : hasDynamicSegment && override?.actualPath === undefined
          ? 'Dynamic segment requires actualPath override'
          : undefined;

      plans.push({
        pattern: definition.pattern,
        method,
        urlPath: actualPath,
        query: override?.query,
        payload: override?.payload,
        headers,
        expectedStatus,
        skipReason,
        description: override?.description,
        timeoutMs,
        retries,
        hasDynamicSegment,
        filePath: definition.filePath,
      });
    }
  }

  return plans;
}

function resolveOverride(
  pattern: string,
  method: HttpMethod,
  overrides: RouteTestConfigEntry[],
): RouteTestConfigEntry | undefined {
  const candidates = overrides.filter((entry) => entry.pattern === pattern);
  return (
    candidates.find((entry) => entry.methods?.includes(method)) ??
    candidates.find((entry) => entry.method === method) ??
    candidates.find((entry) => !entry.method && !entry.methods)
  );
}

function normalizeExpectedStatus(input?: number | number[]): number[] {
  if (Array.isArray(input)) {
    return input;
  }
  if (typeof input === 'number') {
    return [input];
  }
  return [200];
}

interface SingleAttemptResult {
  pattern: string;
  method: HttpMethod;
  url: string;
  status: TestStatus;
  httpStatus?: number;
  durationMs?: number;
  expectedStatus: number[];
  description?: string;
  bodyPreview?: unknown;
  error?: string;
}

async function executePlan(plan: RouteTestPlan): Promise<SingleAttemptResult> {
  const url = new URL(plan.urlPath, baseUrl);
  if (plan.query) {
    Object.entries(plan.query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), plan.timeoutMs);

  const headers = { ...plan.headers };
  const init: RequestInit = {
    method: plan.method,
    headers,
    signal: controller.signal,
  };

  if (plan.payload !== undefined && plan.method !== 'GET' && plan.method !== 'HEAD') {
    init.body = JSON.stringify(plan.payload);
    init.headers = { ...headers, 'Content-Type': headers['Content-Type'] ?? 'application/json' };
  }

  const startedAt = performance.now();
  try {
    const response = await fetch(url, init);
    const durationMs = performance.now() - startedAt;
    const bodyPreview = await parseBodyPreview(response);
    clearTimeout(timeout);

    if (!plan.expectedStatus.includes(response.status)) {
      return {
        pattern: plan.pattern,
        method: plan.method,
        url: url.toString(),
        status: 'failed',
        httpStatus: response.status,
        durationMs,
        expectedStatus: plan.expectedStatus,
        description: plan.description,
        bodyPreview,
        error: `Unexpected status ${response.status}`,
      };
    }

    return {
      pattern: plan.pattern,
      method: plan.method,
      url: url.toString(),
      status: 'success',
      httpStatus: response.status,
      durationMs,
      expectedStatus: plan.expectedStatus,
      description: plan.description,
      bodyPreview,
    };
  } catch (error) {
    clearTimeout(timeout);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      pattern: plan.pattern,
      method: plan.method,
      url: url.toString(),
      status: 'failed',
      expectedStatus: plan.expectedStatus,
      description: plan.description,
      error: errorMessage,
    };
  }
}

async function parseBodyPreview(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const json = await response.json();
      return truncateJSON(json);
    }
    const text = await response.text();
    return text.slice(0, 500);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Failed to parse response body: ${errorMessage}`;
  }
}

function truncateJSON(input: unknown, maxStringLength = 500): unknown {
  const serialized = JSON.stringify(input);
  if (serialized.length <= maxStringLength) {
    return input;
  }
  return `${serialized.slice(0, maxStringLength)}…`;
}

function logResult(result: RouteTestResult): void {
  const label = `${result.method} ${result.url}`;
  if (result.status === 'success') {
    console.log(`[PASS] ${label} — ${result.httpStatus} (${Math.round(result.durationMs ?? 0)}ms)`);
  } else if (result.status === 'failed') {
    console.error(
      `[FAIL] ${label} — expected ${result.expectedStatus.join(', ')} but received ${
        result.httpStatus ?? 'no response'
      }${result.error ? ` (${result.error})` : ''}`,
    );
  }
}

async function persistInventory(definitions: RouteFileDefinition[]): Promise<void> {
  await mkdir(path.dirname(INVENTORY_FILE), { recursive: true });
  const payload = definitions.map((definition) => ({
    pattern: definition.pattern,
    methods: definition.methods,
    filePath: path.relative(PROJECT_ROOT, definition.filePath),
    hasDynamicSegment: definition.hasDynamicSegment,
  }));
  await writeFile(
    INVENTORY_FILE,
    JSON.stringify({ generatedAt: new Date().toISOString(), routes: payload }, null, 2),
    'utf8',
  );
}

async function persistReport(
  results: RouteTestResult[],
  definitions: RouteFileDefinition[],
): Promise<void> {
  await mkdir(path.dirname(LOG_FILE), { recursive: true });
  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    totals: {
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      discoveredRoutes: definitions.length,
    },
    results,
  };
  await writeFile(LOG_FILE, JSON.stringify(summary, null, 2), 'utf8');
}

main().catch((error) => {
  console.error('API route test runner failed unexpectedly:', error);
  process.exitCode = 1;
});
