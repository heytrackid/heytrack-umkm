# 🧪 Test Commands Quick Reference

## 📋 Available Test Scripts

### 1. Comprehensive Codebase Test
```bash
npx tsx scripts/test-codebase.ts
```
**Tests**: Project structure, TypeScript, code quality, dependencies, API routes, database, security, performance  
**Duration**: ~17 seconds  
**Current Score**: 88% (44/50 tests passed)

### 2. AI Security Test
```bash
npx tsx scripts/test-ai-security.ts
```
**Tests**: Input sanitization, injection detection, prompt security  
**Duration**: ~2 seconds  
**Current Score**: 100% (21/21 tests passed) ✅

### 3. TypeScript Compilation Check
```bash
npx tsc --noEmit
```
**Tests**: Type safety, compilation errors  
**Duration**: ~15 seconds  
**Status**: ⚠️ Has errors (needs fixing)

### 4. Next.js Build Test
```bash
npm run build
```
**Tests**: Full application build, production readiness  
**Duration**: ~60-120 seconds  
**Use**: Before deployment

### 5. Lint Check
```bash
npm run lint
```
**Tests**: Code style, ESLint rules  
**Duration**: ~5-10 seconds  
**Use**: Code quality check

## 🎯 Test by Category

### Security Tests
```bash
# AI security (injection, sanitization)
npx tsx scripts/test-ai-security.ts

# Check for hardcoded secrets
grep -r "api_key\|secret\|password" src/ --include="*.ts" --include="*.tsx"

# Check .env is in .gitignore
grep ".env" .gitignore
```

### Type Safety Tests
```bash
# TypeScript compilation
npx tsc --noEmit

# Check for "any" types
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l

# Check for type assertions
grep -r "as any" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### Code Quality Tests
```bash
# Check for console.log
grep -r "console.log" src/ --include="*.ts" --include="*.tsx"

# Check for TODO comments
grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx"

# Check file sizes
find src -type f -size +50k
```

### Database Tests
```bash
# List migrations
ls -la supabase/migrations/

# Check migration naming
ls supabase/migrations/*.sql | grep -v "^[0-9]\{14\}_"

# Count migrations
ls supabase/migrations/*.sql | wc -l
```

### API Tests
```bash
# List API routes
find src/app/api -name "route.ts"

# Check for HTTP methods
grep -r "export async function" src/app/api/

# Count API endpoints
find src/app/api -name "route.ts" | wc -l
```

## 🔄 Test Workflows

### Before Commit
```bash
# Quick checks
npx tsc --noEmit && \
npm run lint && \
npx tsx scripts/test-ai-security.ts
```

### Before Push
```bash
# Comprehensive checks
npx tsx scripts/test-codebase.ts && \
npm run build
```

### Before Deployment
```bash
# Full test suite
npx tsc --noEmit && \
npm run lint && \
npx tsx scripts/test-ai-security.ts && \
npx tsx scripts/test-codebase.ts && \
npm run build
```

### Daily Health Check
```bash
# Quick health check
npx tsx scripts/test-codebase.ts
```

## 📊 Test Results Interpretation

### Codebase Test Results
- **90-100%**: Excellent ✅
- **80-89%**: Good (current: 88%) ⚠️
- **70-79%**: Needs improvement ⚠️
- **< 70%**: Critical issues ❌

### AI Security Test Results
- **100%**: Perfect (current) ✅
- **95-99%**: Very good ✅
- **90-94%**: Acceptable ⚠️
- **< 90%**: Security risk ❌

### TypeScript Compilation
- **0 errors**: Perfect ✅
- **1-5 errors**: Minor issues ⚠️
- **6-20 errors**: Needs attention ⚠️
- **> 20 errors**: Critical (current) ❌

## 🛠️ Fix Common Issues

### TypeScript Errors
```bash
# See all errors
npx tsc --noEmit

# Fix incrementally
npx tsc --noEmit | head -20
```

### "any" Type Issues
```bash
# Find all "any" types
grep -rn ": any" src/

# Replace with proper types
# See CODEBASE_TEST_REPORT.md for examples
```

### Migration Naming
```bash
# Check current naming
ls supabase/migrations/

# Rename format: YYYYMMDDHHMMSS_description.sql
# Example: 20250125120000_add_user_profiles.sql
```

### Hardcoded Secrets
```bash
# Find potential secrets
grep -rn "api_key\|secret\|password" src/ --include="*.ts"

# Move to .env
echo "API_KEY=your_key_here" >> .env
```

## 📈 Continuous Improvement

### Weekly Tasks
- [ ] Run comprehensive codebase test
- [ ] Review and fix TypeScript errors
- [ ] Check for new "any" types
- [ ] Review security test results

### Monthly Tasks
- [ ] Full code quality audit
- [ ] Update dependencies
- [ ] Review and optimize performance
- [ ] Update test scripts

### Before Release
- [ ] All tests passing
- [ ] TypeScript compilation clean
- [ ] Build successful
- [ ] Security tests 100%
- [ ] Code review complete

## 🎓 Test Coverage Goals

### Current Status
- ✅ AI Security: 100% (21/21)
- ⚠️ Codebase: 88% (44/50)
- ❌ TypeScript: Has errors

### Target Goals
- 🎯 AI Security: Maintain 100%
- 🎯 Codebase: Achieve 95%+
- 🎯 TypeScript: 0 errors
- 🎯 Build: Success
- 🎯 Lint: 0 warnings

## 📚 Documentation

- **Full Report**: `CODEBASE_TEST_REPORT.md`
- **AI Security**: `AI_PROMPT_ENHANCEMENT_SUMMARY.md`
- **Security Guide**: `AI_PROMPT_SECURITY_GUIDE.md`
- **Quick Reference**: `AI_SECURITY_QUICK_REFERENCE.md`

## 🆘 Need Help?

### Test Failing?
1. Read the error message carefully
2. Check `CODEBASE_TEST_REPORT.md` for details
3. Review relevant documentation
4. Fix issues incrementally
5. Re-run tests

### Can't Fix an Issue?
1. Document the issue
2. Add to TODO list
3. Create GitHub issue
4. Ask for help in team chat

---

**Quick Start**: `npx tsx scripts/test-codebase.ts`  
**Full Test**: See "Before Deployment" workflow above  
**Help**: Check `CODEBASE_TEST_REPORT.md`
