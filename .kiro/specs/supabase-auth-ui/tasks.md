# Implementation Plan - Supabase Auth UI

- [x] 1. Update Supabase client utilities to use @supabase/ssr
  - Migrate from @supabase/auth-helpers-nextjs to @supabase/ssr package
  - Create browser client utility at utils/supabase/client.ts
  - Create server client utility at utils/supabase/server.ts
  - Create middleware helper at utils/supabase/middleware.ts
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 2. Update middleware for session management
  - Update middleware.ts to use new updateSession helper
  - Implement proper session refresh logic using getUser()
  - Configure route matcher to exclude static files
  - Add redirect logic for authenticated/unauthenticated users
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 3. Enhance login page with modern UI
  - Update login page to use server actions instead of client-side auth
  - Create login server action in auth/login/actions.ts
  - Implement email and password inputs with icons
  - Add password show/hide toggle functionality
  - Implement loading states with spinner
  - Add error display with Alert component
  - Style with neutral color palette
  - Add "Forgot password?" link
  - Ensure mobile responsiveness
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

- [x] 4. Enhance register page with modern UI
  - Update register page to use server actions
  - Create signup server action in auth/register/actions.ts
  - Add confirm password field with validation
  - Implement password match validation
  - Add password strength indicator
  - Implement success state with confirmation message
  - Style with neutral color palette matching login
  - Ensure mobile responsiveness
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

- [x] 5. Implement password reset functionality
  - [x] 5.1 Create password reset request page
    - Create auth/reset-password/page.tsx with email input form
    - Create resetPassword server action in auth/reset-password/actions.ts
    - Implement email submission with loading state
    - Show success message with instructions
    - Style with neutral color palette
    - _Requirements: 3.1, 3.2, 3.5, 5.1, 5.2, 5.3_
  
  - [x] 5.2 Create password update page
    - Create auth/update-password/page.tsx with new password form
    - Create updatePassword server action in auth/update-password/actions.ts
    - Add new password and confirm password inputs
    - Implement password requirements display
    - Add password strength validation
    - Show success message on completion
    - _Requirements: 3.3, 3.4, 3.5, 5.1, 5.2, 5.3_
  
  - [x] 5.3 Update Supabase email templates
    - Configure "Reset password" email template in Supabase dashboard
    - Set redirect URL to /auth/update-password with token_hash
    - Test email delivery and link functionality
    - _Requirements: 3.2, 3.3_

- [x] 6. Create email confirmation handler
  - Create auth/confirm/route.ts route handler
  - Implement token_hash verification using verifyOtp
  - Handle email confirmation type
  - Redirect to dashboard on success
  - Redirect to error page on failure
  - _Requirements: 1.4, 7.4_

- [x] 7. Implement logout functionality
  - Create auth/signout/route.ts route handler
  - Implement user session check before signout
  - Call supabase.auth.signOut() to clear session
  - Clear session cookies
  - Redirect to login page after logout
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Implement comprehensive error handling
  - Create error message mapping for common auth errors
  - Translate error messages to Indonesian
  - Implement inline validation errors for form fields
  - Add toast notifications for success messages
  - Clear errors on input change
  - Provide actionable error messages with links
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9. Add loading states and transitions
  - Implement button loading states with spinner
  - Disable form inputs during submission
  - Add smooth transitions for error/success messages
  - Implement skeleton loaders where appropriate
  - Add fade-in animations for success states
  - _Requirements: 5.4, 6.1, 6.4_

- [x] 10. Ensure mobile responsiveness
  - Test all auth pages on mobile viewport
  - Adjust spacing and sizing for touch targets
  - Ensure form inputs are properly sized (min 44px height)
  - Test keyboard behavior on mobile devices
  - Verify gradient backgrounds work on all screen sizes
  - _Requirements: 5.5_

- [ ] 11. Update environment configuration
  - Add NEXT_PUBLIC_SITE_URL to .env.example
  - Document required environment variables in README
  - Verify all environment variables are properly loaded
  - _Requirements: 7.5_

- [x] 12. Add form validation
  - Implement client-side email format validation
  - Add password length validation (minimum 8 characters)
  - Implement password match validation for registration
  - Add real-time validation feedback
  - _Requirements: 1.3, 1.5, 6.5_

- [ ] 13. Implement accessibility features
  - Add proper ARIA labels to all form inputs
  - Ensure keyboard navigation works correctly
  - Add focus indicators to interactive elements
  - Test with screen readers
  - Verify color contrast ratios meet WCAG AA standards
  - Add error announcements for screen readers
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.5_

- [ ] 14. Add OAuth providers (optional)
  - Keep existing Google OAuth button on login page
  - Keep existing Google OAuth button on register page
  - Ensure OAuth redirects work with new auth flow
  - Test OAuth flow end-to-end
  - _Requirements: 2.1, 1.1_

- [ ] 15. Performance optimization
  - Implement code splitting for auth pages
  - Lazy load heavy components
  - Optimize bundle size by tree-shaking unused code
  - Add proper cache headers for static assets
  - _Requirements: 7.5_
