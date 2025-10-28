---
inclusion: always
---

---
inclusion: always
---

# HeyTrack Product Context

HeyTrack is a business management system for Indonesian culinary SMEs (UMKM) focusing on cost tracking, inventory management, and financial analysis for food production businesses.

## Domain Terminology

- **HPP (Harga Pokok Produksi)**: Cost of Goods Sold - the total cost to produce a recipe including ingredients and operational costs
- **WAC (Weighted Average Cost)**: Inventory valuation method that calculates average cost based on purchase history
- **Resep**: Recipe in Indonesian - the core production unit containing ingredients and instructions
- **Bahan**: Ingredient in Indonesian - raw materials tracked in inventory
- **Biaya Operasional**: Operational costs - fixed/variable costs allocated to production (electricity, rent, labor, etc.)
- **Batch Production**: Manufacturing multiple units of a recipe at once with automatic inventory deduction

## Business Rules

### HPP Calculation
- HPP = (Total Ingredient Costs using WAC) + (Allocated Operational Costs)
- Ingredient costs use WAC from purchase history, not latest price
- Operational costs are allocated based on production volume or time
- Daily snapshots capture HPP changes for trend analysis
- Alert thresholds: >10% increase triggers notification

### Inventory Management
- Stock deduction happens automatically when orders are confirmed
- Reorder alerts trigger when stock falls below minimum threshold
- WAC recalculates on each ingredient purchase
- Negative stock is prevented at order confirmation

### Order Workflow
1. Order created → validates ingredient availability
2. Order confirmed → deducts inventory, records income
3. Order completed → updates financial reports
4. Order cancelled → restores inventory if already deducted

### Recipe Constraints
- Recipes must have at least one ingredient
- Ingredient quantities must be positive numbers
- Recipe yield (output quantity) must be specified
- Operational costs are optional but recommended for accurate HPP

## User Experience Principles

### Language & Localization
- Primary language: Indonesian (Bahasa Indonesia)
- UI labels use Indonesian terms (Resep, Bahan, HPP, etc.)
- Currency: Indonesian Rupiah (IDR) formatted as "Rp 10.000"
- Date format: DD/MM/YYYY (Indonesian standard)

### Mobile-First Design
- Target users often work on mobile devices in production environments
- Critical features must be fully functional on mobile
- Use responsive cards and bottom sheets for mobile interactions
- Minimize text input on mobile, prefer selection/scanning

### Data Entry Optimization
- Minimize manual data entry where possible
- Provide smart defaults based on historical data
- Use AI assistance for recipe generation
- Auto-calculate values (HPP, totals, margins) in real-time

### Financial Visibility
- Always show profit margins alongside prices
- Display HPP prominently in recipe and order views
- Alert users to cost increases that affect profitability
- Provide clear cash flow and P&L summaries

## Feature Modules

### HPP Module (`src/modules/hpp/`)
- Real-time HPP calculation with WAC methodology
- Historical tracking with daily snapshots
- Alert system for cost threshold breaches
- Comparison tools for recipe profitability
- Export capabilities for external analysis

### Recipe Module (`src/modules/recipes/`)
- Recipe CRUD with ingredient composition
- AI-powered recipe generation
- Cost breakdown and margin analysis
- Batch production planning
- Smart pricing assistant

### Order Module (`src/modules/orders/`)
- Order lifecycle management
- Automatic inventory integration
- Financial recording (income/expenses)
- Production time estimation
- Customer order history

### Inventory Module (`src/modules/inventory/`)
- Real-time stock tracking
- WAC calculation on purchases
- Reorder alerts and notifications
- Supplier management
- Purchase history

### Production Module (`src/modules/production/`)
- Batch production tracking
- Ingredient consumption recording
- Production scheduling
- Yield tracking and waste management

## AI Integration Guidelines

### Recipe Generation
- Uses OpenAI or Anthropic APIs (configurable)
- Generates Indonesian recipes with local ingredients
- Provides ingredient quantities and instructions
- Estimates costs based on existing ingredient database
- User can edit AI suggestions before saving

### Context-Aware Chatbot
- Answers business questions using app data
- Provides insights on costs, inventory, and profitability
- Suggests optimizations (cheaper ingredients, better margins)
- Uses structured data from database for accuracy

## Automation & Scheduling

### Daily Jobs (pg_cron)
- **HPP Snapshots**: Capture daily HPP for all recipes at midnight
- **Alert Detection**: Check for cost threshold breaches
- **Data Archival**: Archive old records for performance

### Real-time Alerts
- Low stock warnings when inventory < minimum threshold
- HPP increase alerts when cost rises >10%
- Order notifications for new/updated orders
- Production reminders for scheduled batches

## Performance Considerations

- HPP calculations can be expensive - use caching and snapshots
- Large ingredient lists should use virtualization
- Financial reports aggregate data - use database views
- Export operations run asynchronously for large datasets
- Lazy load heavy components (charts, AI features)

## Security & Data Isolation

- All data is user-scoped via `user_id` column
- Row Level Security (RLS) enforced at database level
- Users can only access their own business data
- Authentication required for all protected routes
- API routes validate user ownership before mutations
