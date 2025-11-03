/**
 * Route Audit Script
 * Checks all API routes for consistency issues
 */

interface RouteIssue {
  file: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  fix: string;
}

const issues: RouteIssue[] = [];

// Issues found from manual inspection:

// 1. CRITICAL: Inconsistent error variable naming
issues.push({
  file: 'src/app/api/recipes/route.ts',
  line: 117,
  severity: 'critical',
  issue: 'Uses "err" instead of "error" in catch block',
  fix: 'Change catch (err: unknown) to catch (error: unknown)'
});

issues.push({
  file: 'src/app/api/ingredient-purchases/route.ts',
  line: 75,
  severity: 'critical',
  issue: 'Uses "err" instead of "error" in catch block',
  fix: 'Change catch (err: unknown) to catch (error: unknown)'
});

// 2. CRITICAL: Missing APIError usage
issues.push({
  file: 'src/app/api/recipes/route.ts',
  severity: 'critical',
  issue: 'Not using APIError class for error handling',
  fix: 'Import and use APIError from @/lib/errors/api-error-handler'
});

// 3. HIGH: Missing handleAPIError
issues.push({
  file: 'src/app/api/recipes/route.ts',
  severity: 'high',
  issue: 'Not using handleAPIError for centralized error handling',
  fix: 'Replace manual error responses with handleAPIError(error)'
});

// 4. MEDIUM: Inconsistent auth error logging
issues.push({
  file: 'src/app/api/recipes/route.ts',
  line: 16,
  severity: 'medium',
  issue: 'Logs authError with "error" key instead of "authError"',
  fix: 'Use consistent key: apiLogger.error({ error: authError }, ...)'
});

// 5. HIGH: Missing cache invalidation
issues.push({
  file: 'src/app/api/customers/route.ts',
  severity: 'high',
  issue: 'POST endpoint does not invalidate cache',
  fix: 'Add cacheInvalidation.customers() after successful creation'
});

// 6. CRITICAL: Wrong Supabase import
issues.push({
  file: 'src/app/api/ingredient-purchases/route.ts',
  line: 2,
  severity: 'critical',
  issue: 'Imports createServiceRoleClient from wrong path',
  fix: 'Import from @/utils/supabase/service-role instead of @/utils/supabase'
});

console.log('='.repeat(80));
console.log('API ROUTE AUDIT REPORT');
console.log('='.repeat(80));
console.log('');

const criticalIssues = issues.filter(i => i.severity === 'critical');
const highIssues = issues.filter(i => i.severity === 'high');
const mediumIssues = issues.filter(i => i.severity === 'medium');
const lowIssues = issues.filter(i => i.severity === 'low');

console.log(`🔴 CRITICAL: ${criticalIssues.length}`);
console.log(`🟡 HIGH: ${highIssues.length}`);
console.log(`🟠 MEDIUM: ${mediumIssues.length}`);
console.log(`🟢 LOW: ${lowIssues.length}`);
console.log('');
console.log(`TOTAL ISSUES: ${issues.length}`);
console.log('');

// Group by file
const byFile = issues.reduce((acc, issue) => {
  if (!acc[issue.file]) acc[issue.file] = [];
  acc[issue.file].push(issue);
  return acc;
}, {} as Record<string, RouteIssue[]>);

console.log('ISSUES BY FILE:');
console.log('-'.repeat(80));
Object.entries(byFile).forEach(([file, fileIssues]) => {
  console.log(`\n📁 ${file} (${fileIssues.length} issues)`);
  fileIssues.forEach(issue => {
    const icon = issue.severity === 'critical' ? '🔴' : 
                 issue.severity === 'high' ? '🟡' : 
                 issue.severity === 'medium' ? '🟠' : '🟢';
    console.log(`  ${icon} ${issue.issue}`);
    console.log(`     Fix: ${issue.fix}`);
  });
});

export { issues };
