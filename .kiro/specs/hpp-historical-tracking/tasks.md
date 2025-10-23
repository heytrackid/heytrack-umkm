# Implementation Plan: Historical HPP Tracking & Trends

- [x] 1. Database Setup and Migration
  - Create hpp_snapshots table with proper schema and indexes
  - Create hpp_alerts table with status tracking fields
  - Create hpp_snapshots_archive table for data older than 1 year
  - Set up Row Level Security (RLS) policies for both tables
  - Add database indexes for performance optimization
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 2. TypeScript Types and Interfaces
  - [x] 2.1 Create hpp-tracking.ts type definitions file
    - Define HPPSnapshot, HPPAlert, HPPTrendData interfaces
    - Define CostBreakdown, HPPComparison, HPPRecommendation types
    - Define TimePeriod and HPPExportData types
    - Export all types for use across the application
    - _Requirements: All requirements_

  - [x] 2.2 Update database types to include new tables
    - Add hpp_snapshots table type to Database interface
    - Add hpp_alerts table type to Database interface
    - Update types/index.ts to export new table types
    - _Requirements: 7.1, 7.2_

- [x] 3. Core Business Logic Implementation
  - [x] 3.1 Create HPP calculation utility
    - Implement calculateHPP function in lib/hpp-calculator.ts
    - Calculate material cost from recipe ingredients
    - Calculate operational cost per unit from monthly costs
    - Generate detailed cost breakdown with percentages
    - _Requirements: 1.1, 4.1, 4.2, 4.3, 4.4_

  - [x] 3.2 Create alert detection logic
    - Implement detectHPPAlerts function in lib/hpp-alert-detector.ts
    - Detect HPP increases > 10% (Rule 1)
    - Detect margin below 15% (Rule 2)
    - Detect ingredient cost spikes > 15% (Rule 3)
    - Generate affected components analysis
    - _Requirements: 3.1, 3.2, 3.4, 4.5_

  - [x] 3.3 Create snapshot management utilities
    - Implement createSnapshot function to save HPP data
    - Implement getRecentSnapshots with date filtering
    - Implement compareSnapshots for period comparison
    - Add data validation and error handling
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 4. API Endpoints Implementation
  - [x] 4.1 Create /api/hpp/snapshots endpoint
    - Handle GET requests with recipe_id and period filters
    - Query hpp_snapshots table with proper date range
    - Return paginated results with metadata
    - Add error handling for invalid parameters
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Create /api/hpp/trends endpoint
    - Handle multiple recipe_ids (max 5)
    - Aggregate snapshot data by date
    - Return formatted trend data for charting
    - Optimize query performance with indexes
    - _Requirements: 1.1, 6.1, 6.2_

  - [x] 4.3 Create /api/hpp/comparison endpoint
    - Calculate current and previous period statistics
    - Compute change percentage and trend direction
    - Return comparison data with min/max/avg values
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.4 Create /api/hpp/alerts endpoints
    - Implement GET /api/hpp/alerts for listing alerts
    - Implement POST /api/hpp/alerts/:id/read for marking as read
    - Filter by unread status and pagination
    - Return unread count in metadata
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.5 Create /api/hpp/breakdown endpoint
    - Fetch latest snapshot or specific date snapshot
    - Return detailed cost breakdown with percentages
    - Include top 5 ingredients by cost
    - Highlight components with significant changes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.6 Create /api/hpp/export endpoint
    - Generate Excel file using ExcelJS
    - Include snapshot data, summary statistics, and charts
    - Format currency and percentages properly
    - Stream file download response
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.7 Create /api/hpp/recommendations endpoint
    - Analyze HPP trends for optimization opportunities
    - Generate recommendations based on rules
    - Calculate potential savings estimates
    - Return prioritized action items
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 4.8 Create /api/hpp/snapshot POST endpoint (internal)
    - Calculate HPP for specified recipe or all recipes
    - Save snapshot to database with breakdown
    - Trigger alert detection after snapshot creation
    - Return summary of snapshots created and alerts generated
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 5. Cron Jobs Implementation
  - [x] 5.1 Create daily HPP snapshot cron job
    - Set up cron job to run at 00:00 daily
    - Call /api/hpp/snapshot endpoint for all recipes
    - Implement batch processing (50 recipes at a time)
    - Add error logging and retry logic
    - _Requirements: 7.1, 7.2_

  - [x] 5.2 Create alert detection cron job
    - Set up cron job to run every 6 hours
    - Call alert detection logic for all recipes
    - Save generated alerts to database
    - Log execution metrics (time, success rate)
    - _Requirements: 3.1, 3.2_

  - [x] 5.3 Create data archival cron job
    - Set up monthly cron job for data archival
    - Move snapshots older than 1 year to archive table
    - Verify data integrity after archival
    - Log archival statistics
    - _Requirements: 7.4, 7.5_

- [x] 6. Frontend Components - HPP Historical Chart
  - [x] 6.1 Create HPPHistoricalChart component
    - Build line chart using Recharts library
    - Display HPP trend data with time on X-axis
    - Add period filter buttons (7d, 30d, 90d, 1y)
    - Show min/max/avg values below chart
    - Add loading skeleton and error states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 6.2 Add multi-product comparison feature
    - Implement multi-select dropdown for recipes
    - Display multiple lines with different colors
    - Add legend with color coding
    - Implement hover tooltip with all product values
    - Add toggle buttons to show/hide specific products
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.3 Add mobile responsiveness
    - Optimize chart size for mobile screens
    - Make period filters scrollable on mobile
    - Adjust tooltip positioning for touch devices
    - Test on various screen sizes
    - _Requirements: 1.1, 1.2_

- [x] 7. Frontend Components - HPP Comparison Card
  - [x] 7.1 Create HPPComparisonCard component
    - Display current vs previous period comparison
    - Show percentage change with color coding
    - Add up/down/stable arrow icons
    - Display absolute value change
    - Format numbers with currency utility
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 7.2 Add trend indicators
    - Red indicator for increase > 5%
    - Green indicator for decrease > 5%
    - Gray indicator for stable (< 5% change)
    - Add animated transitions for value changes
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 8. Frontend Components - HPP Alerts List
  - [x] 8.1 Create HPPAlertsList component
    - Display list of alerts with severity badges
    - Show unread count badge in header
    - Implement mark as read functionality
    - Add dismiss alert action
    - Group alerts by date (Today, Yesterday, This Week)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 8.2 Create HPPAlertDetail modal
    - Show full alert details with affected components
    - Display before/after comparison
    - Highlight changed ingredients/costs
    - Add action buttons (Mark Read, Dismiss)
    - _Requirements: 3.4, 3.5_

  - [x] 8.3 Add alert notifications to dashboard
    - Show alert badge in navigation menu
    - Display recent alerts in dashboard widget
    - Add click handler to navigate to HPP page
    - _Requirements: 3.1, 3.3_

- [x] 9. Frontend Components - Cost Breakdown Chart
  - [x] 9.1 Create CostBreakdownChart component
    - Build pie chart using Recharts
    - Show material vs operational cost split
    - Display percentages on chart segments
    - Add legend with cost values
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 9.2 Add detailed breakdown view
    - Show top 5 ingredients by cost
    - Display cost and percentage for each
    - Highlight ingredients with price increases > 15%
    - Add expandable section for full ingredient list
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 9.3 Add interactive features
    - Implement click on pie segment to show details
    - Add hover effects with tooltips
    - Enable drill-down to ingredient details
    - _Requirements: 4.2_

- [x] 10. Frontend Components - Export Functionality
  - [x] 10.1 Create HPPExportButton component
    - Add "Export to Excel" button with icon
    - Show loading state during export
    - Handle export errors with toast notifications
    - Trigger file download on success
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 10.2 Implement export data formatting
    - Format dates in user's locale
    - Format currency values properly
    - Include summary statistics sheet
    - Add chart images to Excel file (optional)
    - _Requirements: 5.3, 5.4_

- [x] 11. Frontend Components - Recommendations Panel
  - [x] 11.1 Create HPPRecommendationsPanel component
    - Display list of recommendations with priority badges
    - Show potential savings estimates
    - List action items for each recommendation
    - Add expand/collapse for details
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 11.2 Add recommendation logic
    - Detect consistent HPP increases (30 days)
    - Identify operational cost increases > 20%
    - Calculate potential savings from alternatives
    - Generate margin improvement suggestions
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x] 12. Integration with Existing HPP Page
  - [x] 12.1 Add "HPP Lanjutan" tab to existing page
    - Update HPP page to use Tabs component
    - Add new tab for Historical Tracking
    - Maintain existing "Kalkulator HPP" and "Strategi Pricing" tabs
    - Ensure smooth tab transitions
    - _Requirements: 1.1_

  - [x] 12.2 Create HPPHistoricalTab component
    - Compose all sub-components (chart, comparison, alerts, breakdown)
    - Add recipe selector dropdown
    - Implement data fetching with TanStack Query
    - Add loading states and error handling
    - _Requirements: All requirements_

  - [x] 12.3 Add mobile layout for historical tab
    - Stack components vertically on mobile
    - Make charts responsive
    - Optimize touch interactions
    - Test on various mobile devices
    - _Requirements: 1.1, 1.2_

- [x] 13. Custom Hooks Implementation
  - [x] 13.1 Create useHPPSnapshots hook
    - Fetch snapshots with TanStack Query
    - Handle period filtering
    - Implement caching strategy
    - Add refetch on window focus
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 13.2 Create useHPPAlerts hook
    - Fetch alerts with real-time updates
    - Track unread count
    - Implement mark as read mutation
    - Add optimistic updates
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 13.3 Create useHPPComparison hook
    - Fetch comparison data for selected period
    - Calculate trend indicators
    - Memoize expensive calculations
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 13.4 Create useHPPExport hook
    - Handle export API call
    - Manage loading and error states
    - Trigger file download
    - Show success/error notifications
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 14. Utilities and Helper Functions
  - [x] 14.1 Create date range utilities
    - Implement getPeriodDateRange function
    - Add date formatting helpers
    - Create period label generators
    - _Requirements: 1.3, 1.4_

  - [x] 14.2 Create chart data formatters
    - Format snapshot data for Recharts
    - Aggregate data by date
    - Handle missing data points
    - _Requirements: 1.1, 6.1, 6.2_

  - [x] 14.3 Create alert severity helpers
    - Map severity to colors and icons
    - Generate alert messages
    - Format change percentages
    - _Requirements: 3.1, 3.2, 3.4_

- [ ] 15. Testing and Quality Assurance
  - [ ] 15.1 Write unit tests for business logic
    - Test HPP calculation function
    - Test alert detection algorithms
    - Test date range calculations
    - Test cost breakdown calculations
    - _Requirements: All requirements_

  - [ ] 15.2 Write integration tests for API endpoints
    - Test all API endpoints with various scenarios
    - Test error handling and edge cases
    - Test authentication and authorization
    - _Requirements: All requirements_

  - [ ] 15.3 Perform manual testing
    - Test complete user flows
    - Test on different browsers
    - Test mobile responsiveness
    - Test with various data scenarios
    - _Requirements: All requirements_

- [ ] 16. Documentation and Deployment
  - [ ] 16.1 Update API documentation
    - Document all new endpoints
    - Add request/response examples
    - Document error codes
    - _Requirements: All requirements_

  - [ ] 16.2 Create user guide
    - Write guide for using Historical HPP features
    - Add screenshots and examples
    - Document alert types and meanings
    - Explain recommendations
    - _Requirements: All requirements_

  - [ ] 16.3 Deploy to production
    - Run database migrations
    - Deploy backend code
    - Deploy frontend code
    - Set up cron jobs
    - Monitor for errors
    - _Requirements: All requirements_

  - [ ] 16.4 Backfill historical data (optional)
    - Generate snapshots from existing data
    - Run alert detection on historical data
    - Verify data integrity
    - _Requirements: 7.1, 7.2_
