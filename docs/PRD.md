# HeyTrack - Product Requirements Document (PRD)

**Version:** 1.0.0  
**Last Updated:** December 4, 2024  
**Product Owner:** HeyTrack Team  
**Status:** Active Development

---

## Executive Summary

HeyTrack adalah sistem manajemen bisnis kuliner komprehensif yang dirancang khusus untuk UMKM (Usaha Mikro, Kecil, dan Menengah) di Indonesia. Platform ini mengintegrasikan manajemen operasional, analisis biaya, dan kecerdasan buatan untuk membantu pemilik bisnis kuliner mengoptimalkan operasi, memaksimalkan profit, dan membuat keputusan berbasis data.

### Vision Statement
Menjadi platform #1 untuk manajemen bisnis kuliner UMKM di Indonesia dengan menggabungkan kemudahan penggunaan, analisis mendalam, dan AI assistance.

### Mission Statement
Memberdayakan pemilik bisnis kuliner untuk fokus pada kreativitas dan pertumbuhan dengan mengotomatisasi operasi, memberikan insight real-time, dan menyediakan tools untuk optimasi profit.

---

## Product Overview

### Target Users
- **Primary:** Pemilik bisnis kuliner UMKM (restoran, katering, bakery, food manufacturer)
- **Secondary:** Manager operasional, chef, dan staff yang mengelola inventory/produksi
- **Market:** Indonesia (Bahasa Indonesia sebagai bahasa utama)

### Core Value Propositions
1. **Cost Optimization:** HPP calculator dengan AI-powered pricing recommendations
2. **Operational Efficiency:** Automated inventory tracking, order management, dan production planning
3. **Data-Driven Decisions:** Comprehensive analytics dan real-time reporting
4. **AI Assistant:** Chatbot untuk recipe generation, business insights, dan operational guidance
5. **WhatsApp Integration:** Automated customer communication untuk order confirmations

---

## Core Features & Modules

### 1. Dashboard (Beranda)
**Purpose:** Central hub untuk business overview dan quick actions

**Key Features:**
- Real-time business metrics (revenue, orders, customers, inventory)
- 90-day financial trends (revenue & inventory charts)
- Low stock alerts dengan actionable notifications
- Quick action buttons (create order, generate recipe, manage inventory)
- Onboarding wizard untuk new users
- Production schedule widget

**User Stories:**
- Sebagai pemilik bisnis, saya ingin melihat performa bisnis saya secara sekilas saat membuka aplikasi
- Sebagai manager, saya ingin mendapat notifikasi stock yang hampir habis agar bisa restock tepat waktu
- Sebagai new user, saya ingin guided tour untuk memahami fitur-fitur aplikasi

**Technical Implementation:**
- Server Components untuk initial load performance
- React Query untuk data caching dan background updates
- Real-time updates via Supabase Realtime
- Progressive disclosure pattern untuk onboarding

---

### 2. HPP Calculator (Harga Pokok Penjualan)
**Purpose:** Advanced cost calculation system untuk pricing optimization

**Key Features:**
- **Recipe Cost Analysis:** Detailed breakdown per ingredient dengan waste factor
- **Scenario Planning:** What-if analysis untuk berbagai pricing strategies
- **Cost Trend Monitoring:** Historical cost tracking dengan alerts
- **AI Pricing Recommendations:** Optimal pricing suggestions berdasarkan market data
- **WAC (Weighted Average Cost):** Automatic inventory valuation
- **Comparison Tool:** Compare costs across multiple recipes
- **Alerts System:** Notifikasi saat cost melewati threshold

**User Stories:**
- Sebagai chef, saya ingin tahu exact cost per porsi untuk setiap menu
- Sebagai pemilik, saya ingin simulate berbagai harga jual untuk maximize profit
- Sebagai manager, saya ingin dapat alert saat ingredient price naik signifikan

**Business Rules:**
- HPP = (Ingredient Cost + Overhead) / (1 - Profit Margin)
- Minimum markup: 30-50% (configurable)
- Auto-recalculation saat ingredient price berubah
- Support multiple pricing scenarios per recipe

**Technical Implementation:**
- Web Workers untuk heavy calculations (non-blocking UI)
- HppService untuk business logic
- HppTriggerService untuk automatic recalculation
- Real-time cost updates via database triggers

---

### 3. Order Management (Pesanan)
**Purpose:** Complete order lifecycle management

**Key Features:**
- **Multi-step Order Creation:**
  - Step 1: Customer selection/creation
  - Step 2: Item selection dengan real-time stock validation
  - Step 3: Delivery details (date, address, notes)
  - Step 4: Payment method & confirmation
- **Order Status Tracking:** pending → confirmed → in_production → ready → delivered → completed
- **WhatsApp Integration:** Automated order confirmations dan updates
- **Customer Management:** Integrated customer database dengan order history
- **Payment Processing:** Multiple payment methods (cash, transfer, e-wallet)
- **Order Templates:** Save frequent orders untuk quick reorder
- **Bulk Actions:** Bulk status updates dan bulk delete

**User Stories:**
- Sebagai staff, saya ingin create order dengan cepat tanpa banyak klik
- Sebagai customer service, saya ingin kirim order confirmation via WhatsApp otomatis
- Sebagai pemilik, saya ingin track order status real-time

**Business Rules:**
- Stock validation sebelum order confirmation
- Automatic stock reservation saat order confirmed
- Payment deadline enforcement
- Cancellation policy based on order status
- Order cannot be deleted if status is "delivered" or "completed"

**Technical Implementation:**
- State machine pattern untuk status transitions
- OrderValidationService untuk business rules
- WhatsApp Business API integration
- Optimistic updates dengan React Query

---

### 4. Recipe Management (Resep)
**Purpose:** Recipe database dengan AI-powered generation dan cost analysis

**Key Features:**
- **AI Recipe Generator:** Create recipes using natural language prompts
- **Ingredient Cost Tracking:** Automatic cost calculation per recipe
- **Production Scaling:** Batch size adjustments dengan proportional costing
- **Recipe Categories:** Organized library dengan search dan filters
- **Cost Optimization:** Identify most profitable recipes
- **Recipe Versioning:** Track recipe changes over time
- **Smart Pricing Assistant:** AI-powered pricing recommendations
- **Bulk Import/Export:** CSV import untuk mass data updates

**User Stories:**
- Sebagai chef, saya ingin generate recipe ideas menggunakan AI
- Sebagai pemilik, saya ingin tahu recipe mana yang paling profitable
- Sebagai manager, saya ingin scale recipe untuk production batch

**Business Rules:**
- Recipe cost = Sum of (ingredient quantity × ingredient price)
- Support waste factor per ingredient (default 5%)
- Minimum ingredients: 1
- Recipe difficulty levels: easy, medium, hard
- Auto-update cost saat ingredient price berubah

**Technical Implementation:**
- AI integration via Openrouter API
- RecipeService untuk business logic
- Cross-referencing dengan inventory untuk availability
- Recipe versioning dengan audit trail

---

### 5. Inventory Management (Bahan Baku)
**Purpose:** Comprehensive ingredient dan raw material tracking

**Key Features:**
- **Stock Level Monitoring:** Real-time inventory dengan low-stock alerts
- **Purchase Tracking:** Supplier management dan purchase history
- **Cost Tracking:** Price per unit dengan historical pricing
- **Bulk Import/Export:** CSV import untuk mass updates
- **Supplier Management:** Multi-supplier support dengan pricing comparison
- **Reorder Point Calculation:** Automatic reorder suggestions
- **Stock Movement History:** Complete audit trail
- **Inventory Valuation:** WAC (Weighted Average Cost) method

**User Stories:**
- Sebagai manager, saya ingin tahu stock level real-time
- Sebagai purchasing, saya ingin compare prices dari berbagai supplier
- Sebagai pemilik, saya ingin dapat alert saat stock hampir habis

**Business Rules:**
- Reorder Point = (Average Daily Usage × Lead Time) + Safety Stock
- Stock valuation: Weighted Average Cost (WAC)
- Low stock alert: Current Stock ≤ Reorder Point
- Cannot delete ingredient if used in recipes or has purchase history

**Technical Implementation:**
- InventorySyncService untuk automatic updates
- Real-time stock updates via Supabase Realtime
- Automatic reorder point calculations
- Integration dengan purchase orders dan recipe consumption

---

### 6. Production Management (Produksi)
**Purpose:** Production planning dan batch tracking

**Key Features:**
- **Batch Production:** Track production batches dengan quality control
- **Production Scheduling:** Plan production based on orders dan inventory
- **Quality Assurance:** Production checklists dan quality metrics
- **Yield Tracking:** Monitor production efficiency dan waste
- **Cost Allocation:** Allocate overhead costs to production batches
- **Production Status:** planned → in_progress → quality_check → completed → cancelled
- **Batch Details:** Complete production history per batch

**User Stories:**
- Sebagai production manager, saya ingin schedule production berdasarkan orders
- Sebagai QA, saya ingin track quality metrics per batch
- Sebagai pemilik, saya ingin monitor production efficiency

**Business Rules:**
- Production batch lifecycle: planned → in_progress → quality_check → completed
- Automatic ingredient consumption saat production started
- Quality control checkpoints dengan pass/fail criteria
- Cost roll-up dari ingredients ke finished products

**Technical Implementation:**
- ProductionService untuk business logic
- Integration dengan recipes untuk ingredient consumption
- Quality control checkpoints dengan validation
- Cost allocation algorithms

---

### 7. Cash Flow Management (Arus Kas)
**Purpose:** Financial transaction tracking dan cash flow analysis

**Key Features:**
- **Transaction Categorization:** Income/expense classification
- **Category Management:** Customizable transaction categories
- **Period Filtering:** Flexible date range analysis
- **Trend Analysis:** Visual cash flow trends dan projections
- **Budget Tracking:** Budget vs actual spending analysis
- **Expense Management:** Track operational costs
- **Financial Sync:** Auto-sync dengan orders dan purchases

**User Stories:**
- Sebagai pemilik, saya ingin track semua income dan expense
- Sebagai accountant, saya ingin categorize transactions untuk reporting
- Sebagai manager, saya ingin compare budget vs actual spending

**Business Rules:**
- Double-entry accounting principles
- Category-based budgeting dan variance analysis
- Cash flow forecasting using historical patterns
- Integration dengan sales dan expense data

**Technical Implementation:**
- FinancialSyncService untuk automatic transaction creation
- Category-based budgeting system
- Trend analysis dengan time-series data
- Integration dengan orders dan purchases

---

### 8. Reports & Analytics (Laporan)
**Purpose:** Comprehensive business intelligence dan reporting

**Key Features:**
- **Profit Reports:** Detailed profit/loss analysis by period
- **Sales Reports:** Revenue analysis by product, category, customer
- **Inventory Reports:** Stock movement dan valuation reports
- **Financial Trends:** Long-term business performance visualization
- **Export Functionality:** PDF/Excel export untuk external reporting
- **Custom Date Ranges:** Flexible period selection
- **Comparative Analysis:** YoY, MoM, WoW comparisons

**User Stories:**
- Sebagai pemilik, saya ingin lihat profit/loss per bulan
- Sebagai manager, saya ingin analyze sales trends by product
- Sebagai accountant, saya ingin export reports untuk tax filing

**Business Rules:**
- Multi-dimensional data aggregation
- Time-series analysis dengan growth calculations
- Comparative period analysis (YoY, MoM)
- Automated report generation dengan scheduled delivery

**Technical Implementation:**
- ReportService untuk complex queries
- Data aggregation dengan efficient SQL queries
- Chart visualization dengan Recharts
- Export functionality dengan ExcelJS

---

### 9. Customer Management (Pelanggan)
**Purpose:** Customer relationship management

**Key Features:**
- **Customer Profiles:** Complete customer information dan history
- **Customer Segmentation:** Regular, VIP, wholesale classification
- **Order History:** Complete purchase history per customer
- **Communication Tracking:** Customer interaction logs
- **Analytics:** Customer lifetime value dan retention metrics
- **Bulk Actions:** Bulk delete dan bulk updates
- **Import/Export:** CSV import untuk mass data management

**User Stories:**
- Sebagai sales, saya ingin track customer purchase history
- Sebagai pemilik, saya ingin identify VIP customers
- Sebagai marketing, saya ingin segment customers untuk campaigns

**Business Rules:**
- Customer segmentation: regular, VIP, wholesale
- RFM (Recency, Frequency, Monetary) analysis
- Automated VIP status based on purchase thresholds
- Cannot delete customer with existing orders

**Technical Implementation:**
- CustomerStatsService untuk analytics
- Customer segmentation algorithms
- Integration dengan order management
- Bulk operations support

---

### 10. Supplier Management (Pemasok)
**Purpose:** Supplier relationship management

**Key Features:**
- **Supplier Profiles:** Complete supplier information dan performance history
- **Supplier Classification:** Preferred/standard/trial/blacklisted
- **Performance Tracking:** Delivery time, quality ratings, cost analysis
- **Procurement Analytics:** Supplier comparison dan optimization metrics
- **Contract Management:** Payment terms, credit limits, lead time tracking
- **Bulk Actions:** Bulk delete dan bulk updates
- **Import/Export:** CSV import untuk mass data management

**User Stories:**
- Sebagai purchasing, saya ingin compare supplier performance
- Sebagai manager, saya ingin track supplier delivery time
- Sebagai pemilik, saya ingin identify best suppliers

**Business Rules:**
- Supplier classification: preferred, standard, trial, blacklisted
- Automated supplier scoring (quality, timeliness, cost)
- Preferred supplier prioritization untuk procurement
- Cannot delete supplier with existing ingredients

**Technical Implementation:**
- SupplierStatsService untuk analytics
- Supplier classification algorithms
- Performance tracking metrics
- Integration dengan inventory management

---

### 11. AI Chatbot Assistant
**Purpose:** Conversational AI untuk business insights dan operational guidance

**Key Features:**
- **Recipe Generation:** Generate recipes using natural language
- **Business Insights:** Answer questions about business performance
- **Operational Guidance:** Help dengan common tasks
- **Context-Aware:** Understands business context dan user history
- **Multi-turn Conversations:** Support complex dialogues
- **Session Management:** Save dan resume conversations

**User Stories:**
- Sebagai chef, saya ingin generate recipe ideas dengan AI
- Sebagai pemilik, saya ingin tanya "berapa profit bulan ini?"
- Sebagai staff, saya ingin guidance untuk common tasks

**Technical Implementation:**
- OpenRouter API integration
- ChatSessionService untuk session management
- BusinessContextService untuk context awareness
- Streaming responses untuk better UX

---

### 12. Settings & Configuration
**Purpose:** System configuration dan user preferences

**Key Features:**
- **User Profile Management:** Personal settings dan preferences
- **Business Settings:** Company information, branding, currency
- **Notification Preferences:** Customizable alert settings
- **Security Settings:** Password management dan access controls
- **Data Management:** Import/export dan data backup options
- **WhatsApp Templates:** Manage message templates

**User Stories:**
- Sebagai user, saya ingin customize notification preferences
- Sebagai admin, saya ingin manage business information
- Sebagai pemilik, saya ingin backup data regularly

**Technical Implementation:**
- User preference persistence
- Business rule configuration
- Data validation dan sanitization
- Role-based access control (RBAC)

---

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript (strict mode)
- **UI Library:** React 19 with concurrent features
- **Styling:** Tailwind CSS 4
- **Components:** Shadcn/ui (Radix UI primitives)
- **State Management:** 
  - React Query (TanStack Query) untuk server state
  - Zustand untuk client state
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend Stack
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Stack Auth
- **Real-time:** Supabase Realtime
- **File Storage:** Supabase Storage
- **API Pattern:** RESTful dengan `createApiRoute()` factory
- **Validation:** Zod schemas
- **Logging:** Pino logger

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL)
- **CDN:** Vercel Edge Network
- **Analytics:** Vercel Analytics
- **Monitoring:** Built-in error tracking

### Security
- **Authentication:** Stack Auth (JWT-based)
- **Authorization:** Row Level Security (RLS) di database
- **API Protection:** Middleware-based auth checks
- **Input Validation:** Zod schemas untuk semua inputs
- **SQL Injection Prevention:** Parameterized queries
- **XSS Prevention:** DOMPurify untuk user-generated content
- **Rate Limiting:** Upstash Rate Limit

### Performance Optimizations
- **Code Splitting:** Automatic dengan Next.js
- **Lazy Loading:** Dynamic imports untuk heavy components
- **Image Optimization:** Next.js Image component
- **Caching Strategy:**
  - React Query untuk data caching
  - Stale-while-revalidate pattern
  - Background updates
- **Web Workers:** Heavy calculations (HPP, reports)
- **Database Indexing:** Optimized queries dengan proper indexes
- **Bundle Analysis:** Regular bundle size monitoring

---

## Data Models

### Core Entities

#### Users
- Authentication via Stack Auth
- User preferences dan settings
- Role-based permissions

#### Customers
- Basic info (name, email, phone, address)
- Customer type (regular, VIP, wholesale)
- Discount percentage
- Loyalty points
- Order history

#### Suppliers
- Basic info (name, contact, email, phone, address)
- Supplier type (preferred, standard, trial, blacklisted)
- Payment terms
- Lead time days
- Performance ratings
- Total spent

#### Ingredients
- Basic info (name, unit, description, category)
- Pricing (price_per_unit, weighted_average_cost)
- Stock (current_stock, min_stock, reorder_point)
- Supplier relationship
- Purchase history

#### Recipes
- Basic info (name, description, category, difficulty)
- Ingredients (recipe_ingredients junction table)
- Costing (total_cost, cost_per_serving)
- Production info (prep_time, cook_time, servings)
- Pricing (selling_price, profit_margin)

#### Orders
- Customer relationship
- Order items (order_items junction table)
- Status tracking
- Delivery info (date, address, notes)
- Payment info (method, status, amount)
- Timestamps (created, updated, delivered)

#### Production Batches
- Recipe relationship
- Batch info (quantity, status, notes)
- Quality metrics (yield_percentage, quality_score)
- Cost allocation
- Timestamps (started, completed)

#### Transactions
- Type (income, expense)
- Category
- Amount
- Date
- Description
- Related entity (order, purchase, etc.)

---

## User Flows

### 1. New User Onboarding
1. User signs up via Stack Auth
2. Welcome screen dengan onboarding wizard
3. Guided tour of key features
4. Setup business information
5. Import initial data (optional)
6. Create first recipe/order

### 2. Create Order Flow
1. Navigate to Orders page
2. Click "Tambah Pesanan"
3. Select/create customer
4. Add order items dengan stock validation
5. Set delivery details
6. Choose payment method
7. Review dan confirm
8. Auto-send WhatsApp confirmation

### 3. HPP Calculation Flow
1. Navigate to HPP Calculator
2. Select recipe
3. View cost breakdown
4. Adjust pricing scenarios
5. Get AI recommendations
6. Save optimal pricing
7. Monitor cost trends

### 4. Inventory Management Flow
1. Navigate to Ingredients
2. View stock levels
3. Receive low-stock alerts
4. Create purchase order
5. Update stock levels
6. Track cost changes
7. Auto-recalculate HPP

---

## Success Metrics (KPIs)

### User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- Feature adoption rate
- Retention rate (D1, D7, D30)

### Business Impact
- Time saved per order (target: 50% reduction)
- Profit margin improvement (target: 10-20% increase)
- Inventory accuracy (target: 95%+)
- Order processing time (target: <5 minutes)
- Cost calculation accuracy (target: 99%+)

### Technical Performance
- Page load time (target: <2s)
- API response time (target: <500ms)
- Error rate (target: <0.1%)
- Uptime (target: 99.9%)
- Build time (target: <5 minutes)

---

## Roadmap

### Phase 1: MVP (Completed)
- ✅ Core modules (Orders, Recipes, Ingredients, Customers)
- ✅ Basic HPP calculator
- ✅ Dashboard dengan stats
- ✅ Authentication & authorization
- ✅ Mobile-responsive design

### Phase 2: Advanced Features (Current)
- ✅ AI Recipe Generator
- ✅ WhatsApp Integration
- ✅ Production Management
- ✅ Advanced HPP features (scenarios, trends, alerts)
- ✅ Cash Flow Management
- ✅ Comprehensive Reports
- ✅ AI Chatbot Assistant
- ✅ Supplier Management dengan bulk actions

### Phase 3: Optimization (Q1 2025)
- [ ] Performance optimization (Web Workers, caching)
- [ ] Advanced analytics (predictive insights)
- [ ] Multi-location support
- [ ] Team collaboration features
- [ ] Mobile app (React Native)

### Phase 4: Scale (Q2 2025)
- [ ] Multi-tenant architecture
- [ ] White-label solution
- [ ] API for third-party integrations
- [ ] Advanced AI features (demand forecasting, price optimization)
- [ ] Marketplace for recipes dan templates

---

## Constraints & Assumptions

### Technical Constraints
- Next.js 16+ required (App Router)
- PostgreSQL database (via Supabase)
- Modern browser support (Chrome, Firefox, Safari, Edge)
- Internet connection required (no offline mode yet)

### Business Constraints
- Target market: Indonesia (Bahasa Indonesia)
- Currency: IDR (Rupiah)
- UMKM focus (not enterprise)
- Single-tenant per user (no multi-tenant yet)

### Assumptions
- Users have basic computer literacy
- Users have smartphone untuk WhatsApp integration
- Users understand basic culinary business concepts
- Stable internet connection available

---

## Risks & Mitigations

### Technical Risks
1. **Performance degradation dengan large datasets**
   - Mitigation: Pagination, virtualization, Web Workers
   
2. **Database query performance**
   - Mitigation: Proper indexing, query optimization, caching

3. **Third-party API failures (AI, WhatsApp)**
   - Mitigation: Graceful degradation, fallback mechanisms, retry logic

### Business Risks
1. **User adoption challenges**
   - Mitigation: Comprehensive onboarding, video tutorials, customer support

2. **Data accuracy concerns**
   - Mitigation: Validation rules, audit trails, data verification tools

3. **Competition from established players**
   - Mitigation: Focus on UMKM niche, superior UX, AI differentiation

---

## Appendix

### Glossary
- **HPP:** Harga Pokok Penjualan (Cost of Goods Sold)
- **WAC:** Weighted Average Cost
- **RLS:** Row Level Security
- **UMKM:** Usaha Mikro, Kecil, dan Menengah (SME)
- **RFM:** Recency, Frequency, Monetary (customer segmentation)

### References
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stack Auth Documentation](https://docs.stack-auth.com)
- [React Query Documentation](https://tanstack.com/query/latest)

### Change Log
- **v1.0.0 (Dec 4, 2024):** Initial PRD creation
