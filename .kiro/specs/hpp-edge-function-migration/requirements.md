# Requirements Document

## Introduction

This specification defines the migration of the HPP (Harga Pokok Produksi) daily snapshot cron job from a Next.js API Route to a Supabase Edge Function. The current implementation uses Vercel Cron to trigger a Next.js API endpoint that creates daily HPP snapshots for all active recipes. By migrating to Supabase Edge Functions, we can achieve better performance, lower costs, and improved scalability for scheduled background tasks.

## Glossary

- **HPP System**: The Harga Pokok Produksi (Cost of Goods Manufactured) tracking system that calculates and monitors production costs for recipes
- **Edge Function**: A Deno-based serverless function that runs on Supabase's edge network
- **Snapshot**: A point-in-time record of HPP calculation including material costs, operational costs, and total HPP value
- **Cron Job**: A scheduled task that runs automatically at specified intervals
- **HPP Snapshot Manager**: The service module responsible for creating and managing HPP snapshots
- **Service Role Key**: A privileged Supabase API key with elevated permissions for server-side operations
- **pg-cron**: PostgreSQL extension for scheduling database-level cron jobs

## Requirements

### Requirement 1: Edge Function Creation

**User Story:** As a system administrator, I want the HPP snapshot creation to run as a Supabase Edge Function, so that I can leverage serverless architecture benefits and reduce operational costs.

#### Acceptance Criteria

1. WHEN THE Edge Function is deployed, THE HPP System SHALL create a new Deno-based Edge Function named `hpp-daily-snapshots`
2. WHEN THE Edge Function executes, THE HPP System SHALL use the Supabase JavaScript client to interact with the database
3. WHEN THE Edge Function is invoked, THE HPP System SHALL authenticate using the service role key from environment variables
4. WHERE THE Edge Function requires dependencies, THE HPP System SHALL use Deno-compatible imports from JSR or npm via esm.sh
5. WHEN THE Edge Function completes execution, THE HPP System SHALL return a JSON response with execution metrics including snapshots created, errors encountered, and execution timestamp

### Requirement 2: Business Logic Migration

**User Story:** As a developer, I want the HPP snapshot creation logic to be preserved during migration, so that the system continues to function identically to the current implementation.

#### Acceptance Criteria

1. WHEN THE Edge Function executes, THE HPP System SHALL fetch all users with active recipes from the database
2. WHEN processing users, THE HPP System SHALL iterate through each user and their recipes sequentially
3. WHEN creating snapshots for a recipe, THE HPP System SHALL calculate current HPP using material costs and operational costs
4. WHEN a snapshot is created, THE HPP System SHALL store the snapshot data including hpp_value, material_cost, operational_cost, cost_breakdown, and snapshot_date
5. WHEN errors occur during processing, THE HPP System SHALL log the error details and continue processing remaining recipes
6. WHEN all processing completes, THE HPP System SHALL return summary statistics including total users processed, snapshots created, and any errors encountered

### Requirement 3: Scheduling Configuration

**User Story:** As a system administrator, I want the Edge Function to run automatically every day at midnight, so that HPP snapshots are created consistently without manual intervention.

#### Acceptance Criteria

1. WHEN THE scheduling is configured, THE HPP System SHALL use pg-cron extension to schedule the Edge Function execution
2. WHEN THE schedule is defined, THE HPP System SHALL set the cron expression to `0 0 * * *` for daily execution at 00:00 UTC
3. WHEN THE pg-cron job executes, THE HPP System SHALL invoke the Edge Function using an HTTP POST request
4. WHERE THE Edge Function requires authentication, THE HPP System SHALL include the service role key in the authorization header
5. WHEN THE pg-cron job is created, THE HPP System SHALL store the job configuration in a database migration file

### Requirement 4: Security Implementation

**User Story:** As a security engineer, I want the Edge Function to be protected from unauthorized access, so that only legitimate scheduled jobs can trigger snapshot creation.

#### Acceptance Criteria

1. WHEN THE Edge Function receives a request, THE HPP System SHALL verify the authorization header contains a valid bearer token
2. WHEN THE authorization header is missing, THE HPP System SHALL return a 401 Unauthorized response
3. WHEN THE authorization token is invalid, THE HPP System SHALL return a 401 Unauthorized response
4. WHEN THE authorization token matches the function secret, THE HPP System SHALL proceed with snapshot creation
5. WHERE THE function secret is stored, THE HPP System SHALL use Supabase Edge Function secrets management

### Requirement 5: Error Handling and Logging

**User Story:** As a system operator, I want comprehensive error handling and logging in the Edge Function, so that I can monitor execution and troubleshoot issues effectively.

#### Acceptance Criteria

1. WHEN THE Edge Function starts execution, THE HPP System SHALL log the start timestamp and execution context
2. WHEN processing each user, THE HPP System SHALL log the user ID and number of recipes being processed
3. WHEN an error occurs during snapshot creation, THE HPP System SHALL log the error message, recipe ID, and user ID
4. WHEN THE Edge Function completes, THE HPP System SHALL log execution metrics including duration, success count, and error count
5. WHEN database operations fail, THE HPP System SHALL include the database error details in the response

### Requirement 6: Migration Path and Backward Compatibility

**User Story:** As a developer, I want a clear migration path from the current Next.js implementation, so that I can transition smoothly without service disruption.

#### Acceptance Criteria

1. WHEN THE Edge Function is deployed, THE HPP System SHALL maintain the existing Next.js API route for backward compatibility
2. WHEN THE pg-cron schedule is activated, THE HPP System SHALL disable the Vercel Cron configuration
3. WHEN testing the migration, THE HPP System SHALL provide a manual invocation endpoint for the Edge Function
4. WHERE documentation is required, THE HPP System SHALL update all cron job documentation to reflect the new Edge Function implementation
5. WHEN THE migration is complete, THE HPP System SHALL provide instructions for removing the deprecated Next.js API route

### Requirement 7: Performance and Scalability

**User Story:** As a system architect, I want the Edge Function to handle large numbers of users and recipes efficiently, so that the system can scale as the user base grows.

#### Acceptance Criteria

1. WHEN processing multiple users, THE HPP System SHALL implement batch processing with configurable batch sizes
2. WHEN creating snapshots, THE HPP System SHALL process recipes in parallel where possible to reduce execution time
3. WHEN THE Edge Function execution time exceeds 5 minutes, THE HPP System SHALL log a warning about potential timeout issues
4. WHERE database queries are performed, THE HPP System SHALL use efficient queries with proper indexing
5. WHEN THE number of users exceeds 1000, THE HPP System SHALL continue to function without degradation

### Requirement 8: Monitoring and Observability

**User Story:** As a DevOps engineer, I want visibility into Edge Function execution metrics, so that I can monitor system health and performance.

#### Acceptance Criteria

1. WHEN THE Edge Function executes, THE HPP System SHALL record execution start time and end time
2. WHEN THE Edge Function completes, THE HPP System SHALL calculate and return total execution duration in milliseconds
3. WHEN errors occur, THE HPP System SHALL include error counts and error details in the response
4. WHERE Supabase logging is available, THE HPP System SHALL use structured logging with consistent log levels
5. WHEN monitoring execution history, THE HPP System SHALL provide access to Edge Function logs through Supabase dashboard
