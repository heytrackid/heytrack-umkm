# Requirements Document

## Introduction

This document outlines requirements for a comprehensive health audit and fixes for the HeyTrack UMKM application. The audit will ensure authentication sessions work properly, all features function correctly, and the application provides a reliable user experience. This includes verifying Supabase auth integration, session persistence, protected routes, and core feature functionality across the application.

## Glossary

- **Auth System**: The Supabase-based authentication system managing user sessions, login, registration, and password reset
- **Session**: An authenticated user's active connection to the application with valid credentials
- **Protected Routes**: Application pages that require authentication to access (dashboard, orders, ingredients, etc.)
- **Core Features**: Main application functionality including orders, inventory, recipes, HPP tracking, and financial reports
- **RLS**: Row Level Security policies in Supabase that control data access based on user authentication
- **Middleware**: Next.js middleware that validates sessions and controls route access
- **Client Components**: React components that run in the browser and can access client-side auth state
- **Server Components**: React components that run on the server and need server-side auth validation

## Requirements

### Requirement 1

**User Story:** As a user, I want the authentication system to maintain my session reliably, so that I don't get unexpectedly logged out while using the application

#### Acceptance Criteria

1. WHEN a user logs in successfully, THE Auth System SHALL create a persistent session that survives page refreshes
2. WHEN a user navigates between pages, THE Auth System SHALL maintain the session without requiring re-authentication
3. WHEN a session token expires, THE Auth System SHALL automatically refresh the token without user intervention
4. WHEN a user closes and reopens the browser, THE Auth System SHALL restore the session if it is still valid
5. IF a session cannot be refreshed, THEN THE Auth System SHALL redirect the user to the login page with a clear message

### Requirement 2

**User Story:** As a user, I want protected routes to properly enforce authentication, so that my data remains secure and unauthorized users cannot access the application

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access a protected route, THE Middleware SHALL redirect them to the login page
2. WHEN an authenticated user accesses a protected route, THE Middleware SHALL allow access without redirection
3. WHEN an authenticated user visits the login or register page, THE Middleware SHALL redirect them to the dashboard
4. WHEN a user visits the root path ("/"), THE Middleware SHALL redirect authenticated users to dashboard and unauthenticated users to login
5. THE Middleware SHALL validate session on every protected route request

### Requirement 3

**User Story:** As a user, I want all core features to work correctly with proper authentication, so that I can manage my business operations without errors

#### Acceptance Criteria

1. WHEN a user accesses the dashboard, THE Auth System SHALL provide valid user context to all components
2. WHEN a user performs CRUD operations on orders, THE Auth System SHALL include user_id in database operations
3. WHEN a user manages ingredients, THE Auth System SHALL enforce RLS policies based on the authenticated user
4. WHEN a user creates or views recipes, THE Auth System SHALL associate data with the correct user account
5. WHEN a user accesses HPP tracking, THE Auth System SHALL filter data to show only the user's own records

### Requirement 4

**User Story:** As a user, I want clear feedback when authentication errors occur, so that I understand what went wrong and how to fix it

#### Acceptance Criteria

1. WHEN login fails due to invalid credentials, THE Auth System SHALL display a user-friendly error message
2. WHEN registration fails due to validation errors, THE Auth System SHALL show specific field-level error messages
3. WHEN password reset is requested, THE Auth System SHALL confirm the email was sent or show an appropriate error
4. WHEN a session expires during use, THE Auth System SHALL notify the user before redirecting to login
5. THE Auth System SHALL log authentication errors for debugging without exposing sensitive information to users

### Requirement 5

**User Story:** As a developer, I want consistent auth patterns across the application, so that the codebase is maintainable and bugs are easier to prevent

#### Acceptance Criteria

1. THE Auth System SHALL use the same Supabase client creation pattern in all client components
2. THE Auth System SHALL use the same server-side auth validation pattern in all API routes
3. THE Auth System SHALL provide a centralized useAuth hook for client components to access auth state
4. THE Auth System SHALL handle auth state changes consistently across all components
5. THE Auth System SHALL document auth patterns and best practices for future development

### Requirement 6

**User Story:** As a user, I want all API endpoints to properly validate my authentication, so that my data operations are secure and reliable

#### Acceptance Criteria

1. WHEN a user calls an API endpoint, THE Auth System SHALL validate the session before processing the request
2. WHEN an API endpoint receives an invalid session, THE Auth System SHALL return a 401 Unauthorized response
3. WHEN an API endpoint processes a request, THE Auth System SHALL extract the user_id from the validated session
4. THE Auth System SHALL apply RLS policies automatically for all database operations
5. THE Auth System SHALL handle auth errors in API routes with consistent error responses

### Requirement 7

**User Story:** As a user, I want the application to work correctly on both mobile and desktop devices with proper authentication, so that I can manage my business from anywhere

#### Acceptance Criteria

1. WHEN a user logs in on a mobile device, THE Auth System SHALL maintain the session across app navigation
2. WHEN a user switches between mobile and desktop, THE Auth System SHALL maintain separate valid sessions
3. WHEN a user uses the mobile interface, THE Auth System SHALL provide the same security as desktop
4. THE Auth System SHALL handle touch interactions on mobile auth forms without errors
5. THE Auth System SHALL display auth-related UI elements properly on all screen sizes
