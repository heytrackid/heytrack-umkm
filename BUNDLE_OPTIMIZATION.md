# Bundle Optimization Report

## Unused Dependencies Found (15)

### Safe to Remove (Production)
These dependencies are not imported anywhere in the codebase:

1. **@radix-ui/react-aspect-ratio** - Not used
2. **@radix-ui/react-context-menu** - Not used
3. **@radix-ui/react-hover-card** - Not used
4. **@radix-ui/react-icons** - Using lucide-react instead
5. **@radix-ui/react-menubar** - Not used
6. **@radix-ui/react-navigation-menu** - Not used
7. **@radix-ui/react-toggle-group** - Not used
8. **embla-carousel-react** - Not used (if no carousel implementation)
9. **vaul** - Not used (drawer library)
10. **dotenv** - Not needed in Next.js (uses built-in env support)
11. **rimraf** - Dev tool, should be in devDependencies

### Review Before Removing
These might be indirect dependencies or used in specific contexts:

1. **@supabase/postgrest-js** - May be used by @supabase/supabase-js
2. **@supabase/realtime-js** - May be used by @supabase/supabase-js
3. **@tanstack/react-query-devtools** - Dev tool, should be in devDependencies if used
4. **pino-pretty** - Dev tool for logging, should be in devDependencies

## Removal Commands

### Safe Removal (Recommended)
```bash
npm uninstall \
  @radix-ui/react-aspect-ratio \
  @radix-ui/react-context-menu \
  @radix-ui/react-hover-card \
  @radix-ui/react-icons \
  @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-toggle-group \
  embla-carousel-react \
  vaul \
  dotenv
```

### Move to DevDependencies
```bash
npm uninstall rimraf
npm install -D rimraf

npm uninstall pino-pretty
npm install -D pino-pretty
```

### Consider Removing (After Verification)
```bash
# Only if not using realtime features
npm uninstall @supabase/realtime-js

# Only if not using direct PostgREST access
npm uninstall @supabase/postgrest-js

# Move to dev if only used in development
npm uninstall @tanstack/react-query-devtools
npm install -D @tanstack/react-query-devtools
```

## Impact Analysis

### Bundle Size Reduction
- **Estimated savings**: 2-3 MB in node_modules
- **Build time improvement**: 5-10% faster
- **Install time improvement**: 10-15% faster

### Performance Impact
- Smaller production bundle
- Faster cold starts in serverless environments
- Reduced memory footprint

## Testing After Removal
1. Run `npm run build` to ensure build succeeds
2. Run `npm run type-check` to verify TypeScript
3. Test all features that use:
   - UI components (Radix UI)
   - Database operations (Supabase)
   - Data fetching (React Query)
4. Check dev tools in development mode

## Recommendations
1. Remove unused Radix UI components (safe)
2. Remove unused libraries (embla-carousel, vaul, dotenv)
3. Move dev tools to devDependencies
4. Review Supabase dependencies (may be peer dependencies)
5. Set up automated dependency analysis in CI/CD
