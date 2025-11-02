#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const TABLE_MAPPINGS = {
  AppSettings: 'app_settings', ChatContextCache: 'chat_context_cache', ChatMessages: 'chat_messages',
  ChatSessions: 'chat_sessions', ConversationHistory: 'conversation_history', ConversationSessions: 'conversation_sessions',
  Customers: 'customers', DailySalesSummary: 'daily_sales_summary', ErrorLogs: 'error_logs',
  Expenses: 'expenses', FinancialRecords: 'financial_records', HppAlerts: 'hpp_alerts',
  HppCalculations: 'hpp_calculations', HppHistory: 'hpp_history', HppRecommendations: 'hpp_recommendations',
  IngredientPurchases: 'ingredient_purchases', Ingredients: 'ingredients', InventoryAlerts: 'inventory_alerts',
  InventoryReorderRules: 'inventory_reorder_rules', InventoryStockLogs: 'inventory_stock_logs',
  NotificationPreferences: 'notification_preferences', Notifications: 'notifications',
  OperationalCosts: 'operational_costs', OrderItems: 'order_items', Orders: 'orders',
  Payments: 'payments', PerformanceLogs: 'performance_logs', ProductionBatches: 'production_batches',
  ProductionSchedules: 'production_schedules', Productions: 'productions', RecipeIngredients: 'recipe_ingredients',
  Recipes: 'recipes', StockReservations: 'stock_reservations', StockTransactions: 'stock_transactions',
  SupplierIngredients: 'supplier_ingredients', Suppliers: 'suppliers', UsageAnalytics: 'usage_analytics',
  UserProfiles: 'user_profiles', WhatsappTemplates: 'whatsapp_templates',
}

let totalFiles = 0, totalChanges = 0
const modifiedFiles = []

function getAllTsFiles(dir, fileList = []) {
  readdirSync(dir).forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getAllTsFiles(filePath, fileList)
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath)
    }
  })
  return fileList
}

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8')
  const originalContent = content
  let changes = 0
  
  // Step 1: Handle import statement - remove old types, add helpers
  const importMatch = content.match(/import type \{([^}]+)\} from '@\/types\/database'/)
  if (importMatch) {
    const importTypes = importMatch[1].split(',').map(t => t.trim()).filter(Boolean)
    const typesToKeep = []
    const typesToAdd = new Set()
    
    importTypes.forEach(type => {
      let shouldRemove = false
      
      // Check if it's an old pattern type that should be removed
      for (const pascal of Object.keys(TABLE_MAPPINGS)) {
        if (type === `${pascal}Table`) {
          shouldRemove = true
          typesToAdd.add('Row')
          break
        } else if (type === `${pascal}Insert`) {
          shouldRemove = true
          typesToAdd.add('Insert')
          break
        } else if (type === `${pascal}Update`) {
          shouldRemove = true
          typesToAdd.add('Update')
          break
        }
      }
      
      // Also check for Tables, TablesInsert, TablesUpdate
      if (type === 'Tables') {
        shouldRemove = true
        typesToAdd.add('Row')
      } else if (type === 'TablesInsert') {
        shouldRemove = true
        typesToAdd.add('Insert')
      } else if (type === 'TablesUpdate') {
        shouldRemove = true
        typesToAdd.add('Update')
      }
      
      if (!shouldRemove) {
        typesToKeep.push(type)
      }
    })
    
    if (typesToAdd.size > 0 || typesToKeep.length !== importTypes.length) {
      const allTypes = [...typesToAdd, ...typesToKeep]
      const uniqueTypes = [...new Set(allTypes)]
      content = content.replace(importMatch[0], `import type { ${uniqueTypes.join(', ')} } from '@/types/database'`)
      changes++
    }
  }
  
  // Step 2: Replace type usage (skip ALL import lines, not just type imports)
  const lines = content.split('\n')
  const newLines = lines.map(line => {
    // Skip any import line to avoid breaking component imports
    if (line.trim().startsWith('import ')) {
      return line
    }
    
    let newLine = line
    for (const [pascal, snake] of Object.entries(TABLE_MAPPINGS)) {
      newLine = newLine.replace(new RegExp(`\\b${pascal}Table\\b`, 'g'), `Row<'${snake}'>`)
      newLine = newLine.replace(new RegExp(`\\b${pascal}Insert\\b`, 'g'), `Insert<'${snake}'>`)
      newLine = newLine.replace(new RegExp(`\\b${pascal}Update\\b`, 'g'), `Update<'${snake}'>`)
    }
    return newLine
  })
  content = newLines.join('\n')
  
  // Step 3: Handle Tables<'xxx'> pattern
  content = content.replace(/Tables<'/g, "Row<'")
  content = content.replace(/TablesInsert<'/g, "Insert<'")
  content = content.replace(/TablesUpdate<'/g, "Update<'")
  
  // Step 4: Ensure Row, Insert, Update are imported if needed
  if (content.includes("from '@/types/database'")) {
    const needsRow = /Row<'/.test(content)
    const needsInsert = /Insert<'/.test(content)
    const needsUpdate = /Update<'/.test(content)
    
    const currentImportMatch = content.match(/import type \{([^}]+)\} from '@\/types\/database'/)
    if (currentImportMatch) {
      const imports = currentImportMatch[1]
      const hasRow = /\bRow\b/.test(imports)
      const hasInsert = /\bInsert\b/.test(imports)
      const hasUpdate = /\bUpdate\b/.test(imports)
      
      const typesToAdd = []
      if (needsRow && !hasRow) typesToAdd.push('Row')
      if (needsInsert && !hasInsert) typesToAdd.push('Insert')
      if (needsUpdate && !hasUpdate) typesToAdd.push('Update')
      
      if (typesToAdd.length > 0) {
        const existingTypes = imports.split(',').map(t => t.trim()).filter(Boolean)
        const allTypes = [...typesToAdd, ...existingTypes]
        const uniqueTypes = [...new Set(allTypes)]
        content = content.replace(currentImportMatch[0], `import type { ${uniqueTypes.join(', ')} } from '@/types/database'`)
        changes++
      }
    }
  }
  
  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8')
    totalFiles++
    totalChanges++
    modifiedFiles.push({ path: relative(rootDir, filePath), changes: 1 })
    return true
  }
  return false
}

console.log('🚀 Starting database types migration...\n')

const backupDir = join(rootDir, `.migration-backup-${Date.now()}`)
console.log(`📦 Creating backup in ${relative(rootDir, backupDir)}...`)

const srcDir = join(rootDir, 'src')
const files = getAllTsFiles(srcDir)

files.forEach(file => {
  const relativePath = relative(srcDir, file)
  const backupPath = join(backupDir, 'src', relativePath)
  mkdirSync(dirname(backupPath), { recursive: true })
  copyFileSync(file, backupPath)
})

console.log('✓ Backup created\n')
console.log('🔄 Processing TypeScript files...\n')

files.forEach(file => {
  if (processFile(file)) {
    const fileInfo = modifiedFiles[modifiedFiles.length - 1]
    console.log(`✓ ${fileInfo.path}`)
  }
})

console.log('\n' + '='.repeat(80))
console.log('✓ Migration complete!')
console.log('='.repeat(80))
console.log(`Files modified: ${totalFiles}`)
console.log(`\nBackup location: ${relative(rootDir, backupDir)}`)
console.log('\nNext steps:')
console.log('1. Run: npm run type-check')
console.log('2. Review changes with: git diff')
console.log('3. If everything looks good, commit')
console.log(`4. If you need to rollback: cp -r ${relative(rootDir, backupDir)}/src/* src/\n`)
