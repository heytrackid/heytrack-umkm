#!/bin/bash

# =================================================================
# UMKM HeyTrack Playwright Test Runner
# Automated testing untuk aplikasi Bakery Management System
# =================================================================

echo "🚀 Starting UMKM HeyTrack Automated Testing Suite..."
echo "📅 $(date)"
echo "🌍 Target: https://heytrack-umkm.vercel.app"
echo ""

# Create test results directory
mkdir -p test-results

# =================================================================
# TEST 1: Basic Application Workflow Verification
# =================================================================
echo "📋 TEST 1: Basic Application Workflow Verification"
echo "=============================================="
echo "🎯 Verifying all main pages load correctly..."
echo "🎯 Testing navigation through complete workflow..."
echo "🎯 Testing mobile responsiveness..."
echo ""

npx playwright test --config=playwright-chromium.config.ts tests/umkm-workflow-simple.spec.ts --project=chromium

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ TEST 1 PASSED - Basic workflow verification successful!"
else
    echo ""
    echo "❌ TEST 1 FAILED - Basic workflow has issues"
fi

echo ""
echo "=============================================="
echo ""

# =================================================================
# TEST 2: Data Entry Automation
# =================================================================
echo "📝 TEST 2: Data Entry Automation"
echo "=============================================="
echo "🎯 Automating data entry for ingredients..."
echo "🎯 Automating operational costs entry..."
echo "🎯 Attempting recipe creation..."
echo "🎯 Verifying data persistence..."
echo ""

npx playwright test --config=playwright-chromium.config.ts tests/umkm-data-entry.spec.ts --project=chromium

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ TEST 2 PASSED - Data entry automation successful!"
else
    echo ""
    echo "❌ TEST 2 FAILED - Data entry has issues"
fi

echo ""
echo "=============================================="
echo ""

# =================================================================
# FINAL SUMMARY
# =================================================================
echo "🎉 UMKM HeyTrack Testing Summary"
echo "=============================================="
echo "📊 Tests completed at: $(date)"
echo ""
echo "📁 Generated Files:"
echo "   📸 Screenshots in test-results/"
echo "   📋 HTML Report available via: npx playwright show-report"
echo "   📄 Test results: test-results/"
echo ""
echo "🚀 Next Steps for UMKM Owners:"
echo "   1. Review screenshots to verify UI appearance"
echo "   2. Manually test any failed automated steps"
echo "   3. Add your real business data using the UI"
echo "   4. Set up your recipes and calculate HPP"
echo "   5. Start managing your bakery operations!"
echo ""
echo "💡 Tips:"
echo "   - Use 'Bahan Baku' for ingredients inventory"
echo "   - Set 'Biaya Operasional' for overhead costs"
echo "   - Create 'Resep' with proper ingredient quantities"
echo "   - Calculate 'HPP' to set profitable prices"
echo ""
echo "🔗 Application URL: https://heytrack-umkm.vercel.app"
echo "=============================================="
echo "🎯 Happy Baking & Profitable Business! 🥖💰"