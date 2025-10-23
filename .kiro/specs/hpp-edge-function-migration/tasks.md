# Implementation Plan

- [x] 1. Set up Edge Function project structure
  - Create `supabase/functions/hpp-daily-snapshots` directory
  - Create `index.ts` entry point with basic Deno serve handler
  - Create `types.ts` with TypeScript interfaces for HPP calculation and snapshot data
  - Create `utils.ts` with logging and error handling utilities
  - _Requirements: 1.1, 1.4_

- [x] 2. Implement HPP calculation module for Deno
  - [x] 2.1 Create `hpp-calculator.ts` with Deno-compatible imports
    - Port `calculateHPP` function from `src/lib/hpp-calculator.ts`
    - Convert Node.js imports to Deno/JSR imports
    - Update Supabase client usage for Edge Functions
    - _Requirements: 2.3, 2.4_

  - [x] 2.2 Implement material cost calculation
    - Fetch recipe with ingredients using Supabase client
    - Calculate total material cost from recipe_ingredients
    - Generate ingredient cost breakdown with percentages
    - _Requirements: 2.3, 2.4_

  - [x] 2.3 Implement operational cost calculation
    - Fetch operational costs for last 30 days
    - Calculate monthly operational cost by category
    - Estimate monthly production volume from production history
    - Calculate operational cost per unit
    - _Requirements: 2.3, 2.4_

  - [x] 2.4 Implement cost breakdown generation
    - Calculate percentages for each cost component
    - Format breakdown structure matching database schema
    - Validate calculation results
    - _Requirements: 2.4, 2.5_

- [x] 3. Implement snapshot manager module
  - [x] 3.1 Create `snapshot-manager.ts` with snapshot creation logic
    - Implement `createSnapshot` function for single recipe
    - Validate snapshot data before insertion
    - Handle database insertion with error handling
    - _Requirements: 2.4, 2.5, 5.3_

  - [x] 3.2 Implement batch snapshot creation for user
    - Fetch all active recipes for a user
    - Create snapshots for each recipe sequentially
    - Track successes and failures
    - Return summary metrics
    - _Requirements: 2.1, 2.2, 2.6_

  - [x] 3.3 Implement multi-user processing orchestration
    - Fetch all users with active recipes
    - Process users in batches with configurable batch size
    - Implement error recovery to continue after failures
    - Aggregate metrics across all users
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 7.1, 7.2_

- [x] 4. Implement Edge Function entry point
  - [x] 4.1 Create main request handler in `index.ts`
    - Set up Deno.serve with HTTP handler
    - Parse incoming requests
    - Route to snapshot creation workflow
    - Return JSON responses with proper status codes
    - _Requirements: 1.1, 1.5_

  - [x] 4.2 Implement authorization middleware
    - Extract authorization header from request
    - Validate bearer token against service role key
    - Return 401 for invalid/missing authorization
    - Log authentication attempts
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.3 Implement Supabase client initialization
    - Create Supabase client with service role key
    - Configure client for Edge Function environment
    - Disable session persistence
    - _Requirements: 1.3, 1.4_

  - [x] 4.4 Implement response formatting
    - Format success responses with execution metrics
    - Format error responses with proper error codes
    - Include execution time in all responses
    - _Requirements: 1.5, 5.4, 8.1, 8.2, 8.3_

- [x] 5. Implement error handling and logging
  - [x] 5.1 Create structured logging utility
    - Implement log function with levels (info, warn, error)
    - Format logs as JSON with timestamp and context
    - Use console.log for Supabase log collection
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.4_

  - [x] 5.2 Implement error categorization
    - Define error types (AUTH_FAILED, DB_CONNECTION_FAILED, etc.)
    - Create error formatting functions
    - Map errors to HTTP status codes
    - _Requirements: 5.3, 5.5_

  - [x] 5.3 Add comprehensive error logging
    - Log execution start and end
    - Log user processing progress
    - Log individual snapshot creation errors with context
    - Log database errors with details
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Create database migration for pg-cron
  - [x] 6.1 Create migration file for pg-cron setup
    - Create `supabase/migrations/[timestamp]_setup_hpp_cron.sql`
    - Enable pg_cron extension
    - Store service role key in database settings
    - _Requirements: 3.1, 3.5_

  - [x] 6.2 Configure cron schedule
    - Create cron job with schedule `0 0 * * *`
    - Configure HTTP POST to Edge Function URL
    - Include authorization header with service role key
    - Set job name to 'hpp-daily-snapshots'
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 6.3 Add cron job management queries
    - Add query to check job status
    - Add query to view job execution history
    - Add query to unschedule job (for rollback)
    - _Requirements: 3.5_

- [x] 7. Deploy and configure Edge Function
  - [x] 7.1 Deploy Edge Function to Supabase
    - Run `supabase functions deploy hpp-daily-snapshots`
    - Verify deployment success
    - Check function appears in Supabase dashboard
    - _Requirements: 1.1, 6.1_

  - [x] 7.2 Configure Edge Function secrets
    - Set SUPABASE_URL secret
    - Set SUPABASE_SERVICE_ROLE_KEY secret
    - Verify secrets are accessible in function
    - _Requirements: 1.3, 4.5_

  - [x] 7.3 Apply database migration
    - Run `supabase db push` to apply pg-cron migration
    - Verify pg_cron extension is enabled
    - Verify cron job is scheduled
    - Check job appears in cron.job table
    - _Requirements: 3.1, 3.2, 3.5_

- [-] 8. Test Edge Function functionality
  - [x] 8.1 Test manual Edge Function invocation
    - Call Edge Function with valid authorization
    - Verify snapshots are created in database
    - Check response contains correct metrics
    - Verify execution completes within time limit
    - _Requirements: 1.5, 2.6, 8.1, 8.2, 8.3_

  - [x] 8.2 Test authorization and security
    - Test with missing authorization header (expect 401)
    - Test with invalid token (expect 401)
    - Test with valid service role key (expect 200)
    - Verify no sensitive data in logs
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 8.3 Test error handling scenarios
    - Test with no active recipes (expect graceful handling)
    - Test with invalid recipe data (expect error logging and continuation)
    - Test with database connection issues (expect proper error response)
    - Verify errors are logged with context
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 8.4 Test HPP calculation accuracy
    - Compare Edge Function calculations with existing Next.js implementation
    - Verify material cost calculations match
    - Verify operational cost calculations match
    - Verify cost breakdown percentages are correct
    - _Requirements: 2.3, 2.4_

- [ ] 9. Verify scheduled execution
  - [ ] 9.1 Monitor first scheduled execution
    - Wait for pg-cron to trigger at scheduled time
    - Check Edge Function logs for execution
    - Verify snapshots created in database
    - Check execution metrics in logs
    - _Requirements: 3.2, 3.3, 3.4, 8.5_

  - [ ] 9.2 Verify execution consistency
    - Monitor executions for 3 consecutive days
    - Verify consistent execution at scheduled time
    - Check for any errors or failures
    - Verify data quality and completeness
    - _Requirements: 3.2, 8.5_

- [ ] 10. Update documentation and deprecate old endpoint
  - [ ] 10.1 Update cron job documentation
    - Update `docs/HPP_CRON_JOBS.md` with Edge Function details
    - Document new architecture and flow
    - Add troubleshooting guide for Edge Functions
    - Document pg-cron management commands
    - _Requirements: 6.4_

  - [ ] 10.2 Add migration guide
    - Document migration steps performed
    - Add rollback instructions
    - Document differences between old and new implementation
    - _Requirements: 6.1, 6.4_

  - [x] 10.3 Disable Vercel Cron configuration
    - Remove HPP cron job from `vercel.json`
    - Deploy Next.js app with updated configuration
    - Verify Vercel Cron no longer triggers
    - _Requirements: 6.2_

  - [x] 10.4 Add deprecation notice to old API route
    - Add deprecation comment to `src/app/api/cron/hpp-snapshots/route.ts`
    - Add response header indicating deprecation
    - Log deprecation warnings when endpoint is called
    - _Requirements: 6.1, 6.5_

- [ ] 11. Performance optimization and monitoring
  - [ ] 11.1 Implement performance monitoring
    - Add execution time tracking for each phase
    - Log performance metrics (snapshots/second, memory usage)
    - Add warnings for slow executions
    - _Requirements: 7.3, 8.1, 8.2_

  - [ ] 11.2 Optimize batch processing
    - Tune batch size based on performance metrics
    - Implement parallel processing where safe
    - Add delays between batches to avoid overwhelming database
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 11.3 Set up monitoring dashboard
    - Configure Supabase dashboard alerts for failures
    - Document how to access Edge Function logs
    - Create monitoring checklist for operators
    - _Requirements: 8.4, 8.5_

- [x] 12. Final verification and cleanup
  - [x] 12.1 Verify production readiness
    - Run full end-to-end test in production
    - Verify all users are processed correctly
    - Check data consistency with previous implementation
    - Verify no regressions in HPP calculations
    - _Requirements: 6.1, 7.5_

  - [x] 12.2 Monitor for one week
    - Check daily executions for 7 days
    - Review logs for any errors or warnings
    - Verify data quality and completeness
    - Address any issues that arise
    - _Requirements: 8.5_

  - [x] 12.3 Remove old API route (after 30 days)
    - Delete `src/app/api/cron/hpp-snapshots/route.ts`
    - Remove related code from `src/lib/cron-jobs.ts`
    - Update any remaining documentation references
    - _Requirements: 6.5_
