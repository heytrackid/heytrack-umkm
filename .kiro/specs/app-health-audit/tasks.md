# Implementation Plan

- [x] 1. Database schema audit and migration
  - Check all tables for user_id column existence
  - Create migration file to add user_id columns where missing
  - Add indexes for user_id columns for query performance
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Enable Row Level Security (RLS) policies
  - [x] 2.1 Enable RLS on all user-specific tables
    - Enable RLS on orders, bahan_baku, recipes, customers, expenses, hpp_snapshots, productions tables
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 2.2 Create RLS policies for each table
    - Write SELECT, INSERT, UPDATE, DELETE policies that filter by auth.uid() = user_id
    - Test policies to ensure users can only access their own data
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Enhance auth utilities and hooks
  - [x] 3.1 Update useAuth hook with error handling
    - Add try-catch blocks for session and user fetch
    - Add error logging for debugging
    - Add router refresh on auth state changes (SIGNED_IN, SIGNED_OUT)
    - Add redirect to login on sign out
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.4, 5.1, 5.4_
  
  - [x] 3.2 Enhance middleware with error handling
    - Add try-catch wrapper around middleware logic
    - Add redirectTo parameter for login redirects to preserve intended destination
    - Add error logging for auth failures
    - Ensure session refresh happens on every request
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 4.4, 5.2_

- [x] 4. Update API routes with proper auth validation
  - [x] 4.1 Replace createServerSupabaseAdmin with createClient in orders API
    - Update /api/orders/route.ts GET endpoint
    - Update /api/orders/route.ts POST endpoint
    - Add auth validation at the start of each endpoint
    - Add user_id to INSERT operations
    - Add user_id filter to SELECT operations
    - Return 401 for unauthorized requests
    - _Requirements: 3.2, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 4.2 Replace createServerSupabaseAdmin with createClient in ingredients API
    - Update /api/ingredients/route.ts GET endpoint
    - Update /api/ingredients/route.ts POST endpoint
    - Add auth validation at the start of each endpoint
    - Add user_id to INSERT operations
    - Add user_id filter to SELECT operations
    - Return 401 for unauthorized requests
    - _Requirements: 3.3, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 4.3 Audit and update remaining API routes
    - Check /api/recipes, /api/hpp, /api/customers, /api/expenses, /api/reports routes
    - Add auth validation to all endpoints
    - Replace admin client with authenticated client
    - Add user_id filtering to all queries
    - _Requirements: 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5. Update client-side components to handle auth properly
  - [x] 5.1 Update Orders page to use useAuth hook
    - Import and use useAuth hook
    - Show loading state while auth is initializing
    - Handle auth errors gracefully
    - Ensure API calls include proper error handling for 401 responses
    - _Requirements: 3.2, 4.1, 4.2, 4.3, 5.1, 5.3_
  
  - [x] 5.2 Update Ingredients page to use useAuth hook
    - Import and use useAuth hook
    - Show loading state while auth is initializing
    - Handle auth errors gracefully
    - Ensure API calls include proper error handling for 401 responses
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 5.1, 5.3_
  
  - [x] 5.3 Update Dashboard to use useAuth hook
    - Import and use useAuth hook
    - Show loading state while auth is initializing
    - Display user info from auth state
    - Handle session expiry gracefully
    - _Requirements: 3.1, 4.1, 4.2, 4.3, 5.1, 5.3_
  
  - [x] 5.4 Update remaining pages (Recipes, HPP, Customers, Reports)
    - Add useAuth hook to all protected pages
    - Add loading states during auth initialization
    - Add error handling for auth failures
    - _Requirements: 3.4, 3.5, 4.1, 4.2, 4.3, 5.1, 5.3_

- [x] 6. Implement consistent error handling
  - [x] 6.1 Create error message constants
    - Create Indonesian error messages for common auth errors
    - Create error codes for different failure scenarios
    - Export from centralized location
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 6.2 Add client-side error handling utilities
    - Create helper function to handle API errors
    - Add toast notifications for auth errors
    - Add automatic redirect to login on 401
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.5_
  
  - [x] 6.3 Add server-side error handling utilities
    - Create consistent error response format
    - Add error logging without exposing sensitive data
    - Return appropriate HTTP status codes
    - _Requirements: 4.5, 6.5_

- [x] 7. Test auth flows and protected routes
  - [x] 7.1 Test authentication flows
    - Test login with valid credentials
    - Test login with invalid credentials
    - Test registration flow
    - Test password reset flow
    - Test session persistence across page refreshes
    - Test sign out functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3_
  
  - [x] 7.2 Test protected routes
    - Test accessing protected routes without auth (should redirect to login)
    - Test accessing protected routes with auth (should allow access)
    - Test accessing login page with auth (should redirect to dashboard)
    - Test root path redirects based on auth state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 7.3 Test API endpoints with auth
    - Test API calls without auth (should return 401)
    - Test API calls with valid auth (should succeed)
    - Test API calls with expired session (should return 401)
    - Verify RLS policies filter data correctly
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 7.4 Test feature integration
    - Test creating orders with user_id
    - Test viewing only user's own orders
    - Test creating ingredients with user_id
    - Test viewing only user's own ingredients
    - Test recipes, HPP, customers, financial records similarly
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 7.5 Test mobile responsiveness
    - Test auth flows on mobile devices
    - Test session persistence on mobile
    - Test touch interactions on auth forms
    - Verify auth UI displays correctly on all screen sizes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Create documentation
  - [ ] 8.1 Document auth patterns and best practices
    - Create guide for using useAuth hook
    - Document API route auth pattern
    - Document error handling patterns
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 8.2 Create developer onboarding guide
    - Document how to add new protected routes
    - Document how to create new API endpoints with auth
    - Document how to handle auth errors
    - Document RLS policy patterns
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
