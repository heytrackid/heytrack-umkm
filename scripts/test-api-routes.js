#!/usr/bin/env node

/**
 * Comprehensive API Testing Script for HeyTrack
 * Tests all API routes for authentication and functionality
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Mock authentication token (you'll need to set this)
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  publicRoutes: [],
  protectedRoutes: []
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  { path: '/test', method: 'GET' },
  { path: '/health', method: 'GET' },
  { path: '/errors', method: 'POST', body: { message: 'Test error' } }
];

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (AUTH_TOKEN && !options.skipAuth) {
    defaultOptions.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, finalOptions);
    const data = await response.text();

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data: jsonData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      data: error.message,
      error: true
    };
  }
}

// Test a single route
async function testRoute(routePath, method = 'GET', options = {}) {
  results.total++;

  const url = `${API_BASE}${routePath}`;
  const testName = `${method} ${routePath}`;

  console.log(`\n🧪 Testing: ${testName}`);

  try {
    // Test without auth first (for protected routes)
    if (!PUBLIC_ROUTES.some(r => r.path === routePath)) {
      console.log(`  └─ Testing without auth...`);
      const noAuthResponse = await makeRequest(url, { ...options, method, skipAuth: true });

      if (noAuthResponse.status === 401) {
        console.log(`    ✅ Correctly requires authentication (401)`);
      } else if (noAuthResponse.status >= 200 && noAuthResponse.status < 300) {
        console.log(`    ⚠️  Route is public but not in PUBLIC_ROUTES list`);
        results.publicRoutes.push(routePath);
      } else {
        console.log(`    ❌ Unexpected response: ${noAuthResponse.status} ${noAuthResponse.statusText}`);
        results.errors.push(`${testName} (no auth): ${noAuthResponse.status} - ${noAuthResponse.data}`);
      }
    }

    // Test with auth
    console.log(`  └─ Testing with auth...`);
    const response = await makeRequest(url, { ...options, method });

    if (response.status >= 200 && response.status < 300) {
      console.log(`    ✅ Success: ${response.status} ${response.statusText}`);

      // Check response format consistency
      if (typeof response.data === 'object' && response.data !== null) {
        const hasConsistentFormat = checkResponseFormat(response.data);
        if (!hasConsistentFormat) {
          console.log(`    ⚠️  Inconsistent response format`);
          results.errors.push(`${testName}: Inconsistent response format`);
        }
      }

      results.passed++;
    } else {
      console.log(`    ❌ Failed: ${response.status} ${response.statusText}`);
      if (response.data) {
        console.log(`       Error: ${JSON.stringify(response.data).slice(0, 200)}...`);
      }
      results.failed++;
      results.errors.push(`${testName}: ${response.status} - ${response.data}`);
    }

  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push(`${testName}: ${error.message}`);
  }
}

// Check if response has consistent format
function checkResponseFormat(data) {
  // Check for common response patterns
  if (data.error) return true; // Error responses
  if (data.data !== undefined) return true; // Paginated responses
  if (data.message && data.status) return true; // Status responses
  if (Array.isArray(data)) return true; // Array responses
  if (typeof data === 'string') return true; // String responses

  // If it has success/message/data pattern, it's good
  if (data.success !== undefined || data.message !== undefined || data.data !== undefined) {
    return true;
  }

  return false;
}

// Extract routes from file system
function extractRoutesFromFiles() {
  const routes = [];

  // Read all route files and extract exported methods
  const routeFiles = [
    // List all the route files we found
    'ai/[...slug]',
    'ai/sessions/[[...slug]]',
    'auth/me',
    'customers/[[...slug]]',
    'customers/import',
    'dashboard/[...slug]',
    'diagnostics',
    'errors',
    'expenses/[[...slug]]',
    'export/global',
    'export/ingredients',
    'financial/records/[[...slug]]',
    'health',
    'hpp/[...slug]',
    'hpp/alerts/[id]/read',
    'hpp/alerts/bulk-read',
    'hpp/recommendations/[[...slug]]',
    'import/ingredients',
    'ingredient-purchases/[[...slug]]',
    'ingredients/[[...slug]]',
    'ingredients/calculate-reorder',
    'ingredients/cost-alerts',
    'ingredients/import',
    'ingredients/validate-stock',
    'inventory/alerts/[[...slug]]',
    'inventory/restock-suggestions',
    'notifications',
    'onboarding',
    'onboarding/status',
    'operational-costs/[[...slug]]',
    'operational-costs/quick-setup',
    'orders/[[...slug]]',
    'orders/calculate-price',
    'orders/import',
    'production-batches/[[...slug]]',
    'production/suggestions',
    'recipes/[[...slug]]',
    'recipes/availability',
    'recipes/cost-previews',
    'recipes/generate',
    'recipes/optimized',
    'reports/[...slug]',
    'sales/[[...slug]]',
    'settings/[...slug]',
    'suppliers/[[...slug]]',
    'suppliers/import',
    'test',
    'whatsapp-templates/[[...slug]]',
    'whatsapp-templates/generate-defaults'
  ];

  // For each route file, we need to check what methods it exports
  // This is a simplified version - in practice we'd need to parse the files
  routeFiles.forEach(routeFile => {
    const basePath = routeFile.replace(/\[.*?\]/g, '1'); // Replace dynamic parts with sample values

    // Common HTTP methods to test
    ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
      routes.push({
        path: `/${basePath}`,
        method,
        file: routeFile
      });
    });
  });

  return routes;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting HeyTrack API Testing Suite');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🔑 Auth Token: ${AUTH_TOKEN ? 'Set' : 'Not set'}`);
  console.log('=' .repeat(60));

  // Test public routes first
  console.log('\n🌐 Testing Public Routes (no auth required)');
  for (const route of PUBLIC_ROUTES) {
    await testRoute(route.path, route.method, route.body ? { body: JSON.stringify(route.body) } : {});
  }

  // Test protected routes
  console.log('\n🔒 Testing Protected Routes (auth required)');
  const allRoutes = extractRoutesFromFiles();

  // Filter out public routes and test a sample of protected routes
  const protectedRoutes = allRoutes.filter(route =>
    !PUBLIC_ROUTES.some(pub => pub.path === route.path)
  );

  // Test a subset to avoid overwhelming the server
  const testRoutes = protectedRoutes.slice(0, 20); // Test first 20 routes

  for (const route of testRoutes) {
    await testRoute(route.path, route.method);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Routes Tested: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.errors.length > 0) {
    console.log('\n🚨 ERRORS FOUND:');
    results.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  console.log('\n✨ Testing Complete!');
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testRoute, makeRequest };