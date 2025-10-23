/**
 * Test script for HPP cron jobs
 * 
 * Usage:
 * npx tsx scripts/test-cron-jobs.ts [job-name]
 * 
 * Examples:
 * npx tsx scripts/test-cron-jobs.ts snapshots
 * npx tsx scripts/test-cron-jobs.ts alerts
 * npx tsx scripts/test-cron-jobs.ts archive
 * npx tsx scripts/test-cron-jobs.ts all
 */

import {
    archiveOldHPPSnapshots,
    createDailyHPPSnapshots,
    detectHPPAlertsForAllUsers
} from '../src/lib/cron-jobs'

async function testSnapshots() {
    console.log('\n📸 Testing Daily HPP Snapshot Creation...\n')
    try {
        const result = await createDailyHPPSnapshots()
        console.log('✅ Success:', JSON.stringify(result, null, 2))
    } catch (error: any) {
        console.error('❌ Error:', error.message)
    }
}

async function testAlerts() {
    console.log('\n🔔 Testing HPP Alert Detection...\n')
    try {
        const result = await detectHPPAlertsForAllUsers()
        console.log('✅ Success:', JSON.stringify(result, null, 2))
    } catch (error: any) {
        console.error('❌ Error:', error.message)
    }
}

async function testArchive() {
    console.log('\n🗄️ Testing HPP Data Archival...\n')
    try {
        const result = await archiveOldHPPSnapshots()
        console.log('✅ Success:', JSON.stringify(result, null, 2))
    } catch (error: any) {
        console.error('❌ Error:', error.message)
    }
}

async function testAll() {
    await testSnapshots()
    await testAlerts()
    await testArchive()
}

// Main execution
const jobName = process.argv[2] || 'all'

console.log('🚀 HPP Cron Jobs Test Script')
console.log('============================')

switch (jobName.toLowerCase()) {
    case 'snapshots':
    case 'snapshot':
        testSnapshots()
        break

    case 'alerts':
    case 'alert':
        testAlerts()
        break

    case 'archive':
    case 'archival':
        testArchive()
        break

    case 'all':
        testAll()
        break

    default:
        console.error(`\n❌ Unknown job: ${jobName}`)
        console.log('\nAvailable jobs:')
        console.log('  - snapshots')
        console.log('  - alerts')
        console.log('  - archive')
        console.log('  - all')
        process.exit(1)
}
