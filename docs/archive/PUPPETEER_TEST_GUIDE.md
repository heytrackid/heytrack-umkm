# 🎭 Puppeteer Browser Testing Guide

## 🚀 Quick Start

### Prerequisites
✅ Puppeteer installed  
✅ Dev server running on port 3000

### Run Tests

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run browser tests
node test-ai-with-browser.mjs
```

---

## 📋 What Gets Tested

The Puppeteer script will test:

1. ✅ **Data Fetcher Verification** - `/api/test-ai-data`
2. ✅ **AI Pricing Analysis (GET)** - `/api/ai/pricing`
3. ✅ **AI Pricing (POST)** - With database mode
4. ✅ **AI Inventory** - `/api/ai/inventory`
5. ✅ **Customer Insights** - `/api/ai/customer-insights`
6. ✅ **Dashboard Insights** - `/api/ai/dashboard-insights`
7. ✅ **AI Chat** - `/api/ai/chat-with-data`
8. ✅ **Dashboard Page Load** - Actual page navigation + screenshot

---

## 🎯 Expected Output

```bash
🔍 Checking if server is running...
✅ Server is running!

🚀 Starting AI API Browser Tests
=====================================

🌐 Launching browser...
✅ Browser ready

🧪 Testing: Data Fetcher Verification
   GET /api/test-ai-data
   ✅ PASSED (234ms)
   Status: 200
   Success: true
   Message: 🎉 AI dapat mengakses data dari Supabase!

🧪 Testing: AI Pricing Analysis (All Recipes)
   GET /api/ai/pricing
   ✅ PASSED (1523ms)
   Status: 200
   Success: true

🧪 Testing: AI Pricing Analysis (Database Mode)
   POST /api/ai/pricing
   ✅ PASSED (1834ms)
   Status: 200
   Success: true
   Data Source: database

🧪 Testing: AI Inventory Optimization
   POST /api/ai/inventory
   ✅ PASSED (2145ms)
   Status: 200
   Data Source: database

🧪 Testing: AI Customer Insights
   GET /api/ai/customer-insights
   ✅ PASSED (1678ms)
   Status: 200
   Success: true
   Data Source: database

🧪 Testing: AI Dashboard Insights
   GET /api/ai/dashboard-insights
   ✅ PASSED (2456ms)
   Status: 200
   Success: true
   Data Source: database

🧪 Testing: AI Chat with Database Context
   POST /api/ai/chat-with-data
   ✅ PASSED (3234ms)
   Status: 200
   Success: true

🧪 Testing: Dashboard Page Load
   ✅ PASSED - Page loaded: Bakery Management
   📸 Screenshot saved: dashboard-screenshot.png

=====================================
📊 Test Summary
=====================================
Total Tests: 8
✅ Passed: 8
❌ Failed: 0
Success Rate: 100.0%
=====================================

🎉 All tests passed!

🔒 Browser closed
```

---

## 🖼️ Screenshot

After running tests, check `dashboard-screenshot.png` for visual verification!

---

## 🛠️ Customization

### Add New Test

Edit `test-ai-with-browser.mjs`:

```javascript
// Test 9: Your custom test
results.total++;
const test9 = await testAPIEndpoint(
  page,
  'My Custom Test',
  'POST',
  '/api/my-endpoint',
  { custom: 'data' }
);
if (test9.passed) results.passed++; else results.failed++;
```

### Change Browser Settings

```javascript
browser = await puppeteer.launch({
  headless: false,  // Show browser window
  slowMo: 100,      // Slow down for debugging
  devtools: true    // Open DevTools
});
```

### Take More Screenshots

```javascript
await page.screenshot({ 
  path: 'my-screenshot.png',
  fullPage: true  // Capture entire page
});
```

---

## 🐛 Troubleshooting

### Issue: "Server not running"
**Solution**: Start dev server first
```bash
npm run dev
```

### Issue: "Browser failed to launch"
**Solution**: Install Chrome/Chromium
```bash
# macOS
brew install --cask google-chrome
```

### Issue: "Timeout waiting for page"
**Solution**: Increase timeout
```javascript
await page.goto(url, { 
  timeout: 30000  // 30 seconds
});
```

### Issue: "API returns 401 Unauthorized"
**Solution**: Check Supabase credentials in `.env.local`

---

## 📊 Performance Testing

### Measure Response Times

The script automatically measures and displays response times for each API call.

**Typical Response Times:**
- Data Fetcher: ~200-300ms ✅
- Pricing Analysis: ~1000-2000ms ⚡
- Dashboard Insights: ~2000-3000ms 🔄
- AI Chat: ~3000-4000ms 🤖

---

## 🔬 Advanced Testing

### Test with Different Data

```javascript
// Test multiple recipes
for (const recipeName of ['Roti', 'Brownies', 'Croissant']) {
  await testAPIEndpoint(
    page,
    `Pricing: ${recipeName}`,
    'POST',
    '/api/ai/pricing',
    { useDatabase: true, productName: recipeName }
  );
}
```

### Test Error Handling

```javascript
// Test invalid data
const errorTest = await testAPIEndpoint(
  page,
  'Error Handling',
  'POST',
  '/api/ai/pricing',
  { invalid: 'data' }
);
// Should fail gracefully
```

### Test Load

```javascript
// Concurrent requests
const promises = [];
for (let i = 0; i < 10; i++) {
  promises.push(
    testAPIEndpoint(page, `Load Test ${i}`, 'GET', '/api/test-ai-data')
  );
}
await Promise.all(promises);
```

---

## 📝 Test Reports

### Generate JSON Report

Add to script:

```javascript
const report = {
  timestamp: new Date().toISOString(),
  results: results,
  tests: allTestResults
};

fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
```

### Generate HTML Report

```javascript
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Report</title>
</head>
<body>
  <h1>AI API Test Report</h1>
  <p>Passed: ${results.passed}/${results.total}</p>
  <img src="dashboard-screenshot.png" width="800"/>
</body>
</html>
`;

fs.writeFileSync('test-report.html', html);
```

---

## 🎯 CI/CD Integration

### GitHub Actions

```yaml
name: AI API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Start server
        run: npm run dev &
      - name: Run tests
        run: node test-ai-with-browser.mjs
      - name: Upload screenshot
        uses: actions/upload-artifact@v2
        with:
          name: dashboard-screenshot
          path: dashboard-screenshot.png
```

---

## ✅ Success Criteria

All tests should:
- ✅ Return status 200
- ✅ Have `success: true` in response
- ✅ Complete within reasonable time (<5s per test)
- ✅ Return data from `database` source
- ✅ No browser errors in console
- ✅ Screenshot shows loaded page

---

## 🚀 Quick Commands

```bash
# Install Puppeteer
npm install --save-dev puppeteer

# Run tests (with server running)
node test-ai-with-browser.mjs

# Run tests headless (no browser window)
# Already default behavior

# Run tests with visible browser
# Edit script: headless: false

# View screenshot
open dashboard-screenshot.png
```

---

## 💡 Tips

1. **Run server first** - Always start `npm run dev` before testing
2. **Check logs** - Browser console errors show in test output
3. **Take screenshots** - Visual verification is powerful
4. **Measure performance** - Track response times over time
5. **Test regularly** - Run after each feature addition

---

## 🎉 What's Next

After all tests pass:

1. ✅ **Integrate to CI/CD** - Automated testing on every commit
2. ✅ **Add more tests** - Cover edge cases
3. ✅ **Performance monitoring** - Track API response times
4. ✅ **Visual regression** - Compare screenshots over time
5. ✅ **Deploy to production** - You're ready! 🚀

---

**Created**: 2025-10-01  
**Status**: ✅ Ready to use  
**Puppeteer Version**: Latest
