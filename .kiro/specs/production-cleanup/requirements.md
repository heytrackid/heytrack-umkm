# Requirements Document

## Introduction

This document outlines the requirements for cleaning up unused files and optimizing the bakery management codebase for production deployment. The system currently contains duplicate folders, redundant documentation files, old log files, and potentially unused code that increases bundle size and deployment time.

## Glossary

- **Production System**: The bakery management application deployed to Vercel for end users
- **Duplicate Folder**: The `bakery-management` subfolder that mirrors the root project structure
- **Documentation Files**: Markdown files containing summaries, reports, and guides
- **Log Files**: Build and development log files (.log, .txt extensions)
- **Unused Code**: Components, hooks, or utilities not imported anywhere in the codebase
- **Bundle Size**: The total size of JavaScript/CSS files sent to the browser
- **Build Artifacts**: Generated files from previous builds (.next, node_modules, etc.)

## Requirements

### Requirement 1

**User Story:** As a developer, I want to remove the duplicate `bakery-management` folder, so that the project structure is clean and deployment is faster

#### Acceptance Criteria

1. WHEN the Production System is analyzed, THE Production System SHALL identify the duplicate `bakery-management` folder containing 1.3GB of redundant files
2. THE Production System SHALL verify that all active code exists in the root `src/` directory before deletion
3. THE Production System SHALL remove the entire `bakery-management` folder and its contents
4. WHEN the folder is removed, THE Production System SHALL reduce disk usage by at least 1GB
5. THE Production System SHALL ensure no import statements reference files in the deleted folder

### Requirement 2

**User Story:** As a developer, I want to consolidate redundant documentation files, so that documentation is organized and maintainable

#### Acceptance Criteria

1. THE Production System SHALL identify all documentation files with overlapping content (SUMMARY, REPORT, COMPLETE, FIXES, AUDIT suffixes)
2. THE Production System SHALL count at least 25 redundant documentation files in the root directory
3. WHEN documentation is consolidated, THE Production System SHALL move archived documentation to `docs/archive/` folder
4. THE Production System SHALL keep only essential documentation in the root: README.md, QUICK_START.md, DEPLOYMENT.md, SECURITY.md, TESTING.md
5. THE Production System SHALL create a single PROJECT_STATUS.md file summarizing current state

### Requirement 3

**User Story:** As a developer, I want to remove old log and build files, so that the repository is clean and git operations are faster

#### Acceptance Criteria

1. THE Production System SHALL identify all log files with extensions .log, .txt in the root directory
2. THE Production System SHALL identify build artifact files (build-*.log, dev-*.log)
3. THE Production System SHALL remove all log files older than the current development session
4. THE Production System SHALL ensure .gitignore includes patterns for *.log and *.txt files
5. WHEN log files are removed, THE Production System SHALL reduce repository size by at least 50MB

### Requirement 4

**User Story:** As a developer, I want to identify and remove unused components, so that bundle size is minimized for production

#### Acceptance Criteria

1. THE Production System SHALL scan all TypeScript/TSX files in `src/` directory for import statements
2. THE Production System SHALL identify components that are defined but never imported
3. WHEN a component has zero import references, THE Production System SHALL mark it as safe to delete
4. THE Production System SHALL generate a report listing all unused files with their sizes
5. THE Production System SHALL remove unused files only after developer confirmation

### Requirement 5

**User Story:** As a developer, I want to verify production optimization settings, so that the application performs optimally in production

#### Acceptance Criteria

1. THE Production System SHALL verify `next.config.ts` contains bundle optimization settings
2. THE Production System SHALL verify `output: 'standalone'` is configured for Docker deployment
3. THE Production System SHALL verify code splitting configuration exists for vendor, charts, and UI chunks
4. THE Production System SHALL verify security headers are configured (CSP, X-Frame-Options, HSTS)
5. THE Production System SHALL verify image optimization is enabled with WebP and AVIF formats
6. THE Production System SHALL verify compression is enabled
7. THE Production System SHALL verify TypeScript and ESLint errors don't block builds

### Requirement 6

**User Story:** As a developer, I want to remove unused shell scripts and test files, so that the repository only contains necessary automation

#### Acceptance Criteria

1. THE Production System SHALL identify shell scripts (.sh files) in the root directory
2. THE Production System SHALL verify which scripts are referenced in package.json or documentation
3. WHEN a script is not referenced, THE Production System SHALL mark it as safe to delete
4. THE Production System SHALL identify test files (test-*.js, test-*.mjs, test-*.cjs) in the root
5. THE Production System SHALL move test files to a `scripts/tests/` directory or remove if obsolete

### Requirement 7

**User Story:** As a developer, I want to verify Supabase migrations are optimized, so that database performance is optimal

#### Acceptance Criteria

1. THE Production System SHALL list all migration files in `supabase/migrations/` directory
2. THE Production System SHALL verify indexes exist for frequently queried columns
3. THE Production System SHALL verify RLS policies are enabled on all tables
4. THE Production System SHALL check for duplicate or conflicting migrations
5. THE Production System SHALL verify the latest migration includes performance optimizations

### Requirement 8

**User Story:** As a developer, I want to analyze bundle size, so that I can identify optimization opportunities

#### Acceptance Criteria

1. THE Production System SHALL run bundle analyzer when ANALYZE=true environment variable is set
2. THE Production System SHALL generate a report showing chunk sizes for vendor, charts, and UI bundles
3. THE Production System SHALL identify any single chunk larger than 500KB
4. WHEN large chunks are found, THE Production System SHALL recommend code splitting strategies
5. THE Production System SHALL verify tree-shaking is working for unused exports

### Requirement 9

**User Story:** As a developer, I want to verify environment variables are properly configured, so that production deployment succeeds

#### Acceptance Criteria

1. THE Production System SHALL verify `.env.example` contains all required variables
2. THE Production System SHALL verify Supabase URL and keys are configured
3. THE Production System SHALL verify AI API keys are configured (if AI features are enabled)
4. THE Production System SHALL verify Sentry DSN is configured for error tracking
5. THE Production System SHALL ensure no sensitive values exist in `.env.example`

### Requirement 10

**User Story:** As a developer, I want to verify the build succeeds without errors, so that production deployment is reliable

#### Acceptance Criteria

1. THE Production System SHALL run `pnpm build` command
2. THE Production System SHALL complete the build within 5 minutes
3. THE Production System SHALL generate a standalone output in `.next/standalone/`
4. THE Production System SHALL report zero critical errors during build
5. WHEN the build completes, THE Production System SHALL verify all routes are statically generated or have proper dynamic rendering
