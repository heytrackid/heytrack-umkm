# Implementation Plan

- [ ] 1. Verify current state and create backup
  - Run git status to ensure working directory is clean
  - Create git tag `pre-cleanup` for rollback capability
  - Document current disk usage with `du -sh` commands
  - _Requirements: 1.1, 3.1_

- [x] 2. Phase 1 - Safe deletions (duplicate folder and logs)
- [x] 2.1 Verify no imports from bakery-management folder
  - Search all TypeScript files for imports referencing bakery-management
  - Confirm zero matches found before proceeding
  - _Requirements: 1.5_

- [x] 2.2 Delete duplicate bakery-management folder
  - Remove entire bakery-management/ directory
  - Verify 1.3GB disk space is freed
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 2.3 Remove old log and build artifact files
  - Delete all *.log files in root directory
  - Delete all build-*.log and dev-*.log files
  - Remove old database.sql from root (keep supabase/migrations/)
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2.4 Update .gitignore for log files
  - Add patterns to ignore *.log and *.txt files
  - Verify .gitignore already contains log patterns
  - _Requirements: 3.4_

- [x] 2.5 Verify build still works after Phase 1
  - Run `pnpm build` command
  - Confirm build completes successfully
  - Check for any broken imports or missing files
  - _Requirements: 10.1, 10.2, 10.4_

- [ ] 3. Phase 2 - Documentation consolidation
- [ ] 3.1 Create consolidated PROJECT_STATUS.md
  - Write new PROJECT_STATUS.md summarizing current state
  - Include key metrics, features, and deployment status
  - _Requirements: 2.5_

- [ ] 3.2 Move archived documentation to docs/archive/
  - Move all FINAL_*.md files to docs/archive/
  - Move all *_SUMMARY.md files to docs/archive/
  - Move all *_REPORT.md files to docs/archive/
  - Move FIXES_*, IMPROVEMENTS_*, AUTOMATION_*, AI_* files to docs/archive/
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.3 Verify essential documentation remains in root
  - Confirm README.md, QUICK_START.md, DEPLOYMENT.md remain
  - Confirm SECURITY.md, TESTING.md remain
  - Count total markdown files in root (should be < 10)
  - _Requirements: 2.4, 2.5_

- [ ] 4. Phase 3 - Unused code analysis
- [ ] 4.1 Scan codebase for unused components
  - Find all component files in src/components/
  - For each component, search for import statements
  - Build dependency graph of all imports
  - _Requirements: 4.1, 4.2_

- [ ] 4.2 Generate unused files report
  - Create report listing components with zero imports
  - Include file paths and sizes for each unused file
  - Calculate total potential space savings
  - _Requirements: 4.3, 4.4_

- [ ] 4.3 Review and delete unused components
  - Manually review each file marked as unused
  - Verify files are not dynamically imported or lazy loaded
  - Delete confirmed unused files after developer approval
  - _Requirements: 4.5_

- [ ] 4.4 Remove unused shell scripts and test files
  - Identify shell scripts not referenced in package.json or docs
  - Move test files to scripts/tests/ directory
  - Remove obsolete automation scripts
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5. Phase 4 - Production optimization verification
- [ ] 5.1 Verify Next.js configuration is production-ready
  - Confirm output: 'standalone' is set
  - Verify code splitting configuration exists
  - Check security headers are configured
  - Confirm image optimization is enabled
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 5.2 Run bundle analyzer to measure bundle sizes
  - Execute `ANALYZE=true pnpm build`
  - Generate bundle analysis report
  - Identify chunks larger than 500KB
  - Document vendor, charts, and UI chunk sizes
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 5.3 Verify Supabase migrations are optimized
  - List all migration files in supabase/migrations/
  - Check for performance indexes on frequently queried columns
  - Verify RLS policies are enabled
  - Confirm no duplicate or conflicting migrations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 5.4 Verify environment variables configuration
  - Check .env.example contains all required variables
  - Confirm Supabase URL and keys are documented
  - Verify AI API keys are documented (if used)
  - Ensure no sensitive values in .env.example
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ] 5.5 Run final production build verification
  - Execute clean build with `rm -rf .next && pnpm build`
  - Verify build completes within 5 minutes
  - Confirm standalone output is generated
  - Check for zero critical errors
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 6. Create cleanup summary report
  - Document total disk space saved
  - List all files deleted and moved
  - Record build time improvements
  - Note any warnings or issues encountered
  - Create git tag `post-cleanup` for reference
  - _Requirements: All requirements_
