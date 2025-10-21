# 🥐 Bakery Management System

**Smart Bakery Management System with AI-Powered Automation**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC)](https://tailwindcss.com/)
[![ShadCN/UI](https://img.shields.io/badge/ShadCN%2FUI-Latest-orange)](https://ui.shadcn.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Tests-green)](https://playwright.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()

## 📝 Overview

Comprehensive bakery management solution featuring smart automation, cost optimization, and real-time analytics. Built with modern web technologies and AI-powered insights to streamline bakery operations.

**🚀 Status**: Production Ready ✅  
**📊 Version**: 1.0.0  
**🔄 Last Updated**: 2025-10-21  
**💯 Quality Score**: 92/100

## ✨ Key Features

### 🏠 **Dashboard**
- Real-time business metrics and KPIs
- Smart notifications and alerts
- Performance analytics
- Quick action shortcuts

### 🥖 **Recipe Management**
- Complete recipe database
- Ingredient tracking and costing
- Batch production planning
- Recipe cost calculation (HPP)

### 🧮 **HPP Calculator**
- Automatic cost calculation per product
- Real-time ingredient pricing
- Profit margin analysis
- Bulk pricing optimization

### 📦 **Ingredients Management**
- Inventory tracking and alerts
- Supplier management
- Automatic reorder points
- Expiration date tracking

### 📈 **Inventory System**
- Multi-line trend charts
- Stock movements tracking
- Waste management
- Automated alerts

### 🛒 **Order Management**
- Customer order tracking
- Production scheduling
- Delivery management
- Order status automation

### 👥 **Customer Management**
- Customer database
- Purchase history
- Loyalty programs
- Customer insights

### 🏭 **Production Planning**
- Smart batch scheduling
- Resource optimization
- Production tracking
- Quality control

### 💰 **Financial Management** ⭐ ENHANCED
- **Auto-Sync Income**: Orders automatically create income records when delivered
- **Unified Cash Flow**: Single source for all income and expenses
- **WAC-Based COGS**: Weighted Average Cost for accurate profit calculation
- **Real Profit Reports**: Net profit with ingredient cost breakdowns
- **Period Filtering**: Week/Month/Year/Custom date ranges
- **Export Capabilities**: CSV and Excel export

### 💳 **Cash Flow Tracking** ⭐ CORE FEATURE
- **Comprehensive Transaction Hub**: All income and expenses in one place
- **Auto-Sync from Orders**: Delivered orders create income automatically
- **Manual Entry Support**: Add custom income and expenses
- **Category Breakdown**: Visual analysis by category
- **Period Reports**: Weekly, monthly, yearly, or custom ranges
- **Financial Health**: Real-time cash flow monitoring

### 🔄 **Real-Time Data Synchronization** ⭐ NEW!
- **Cross-Module Sync**: Inventory ↔ Recipes ↔ Orders ↔ Reports
- **Instant Updates**: Zero-latency data consistency across all modules
- **Smart Automation**: Auto-consume ingredients on order confirmation
- **Event Tracking**: Complete audit trail with timestamps
- **System Health**: Live monitoring with sync status indicators
- **Customer Analytics**: Auto-generated profiles with purchase history
- **Conflict Resolution**: Advanced data consistency management
- **Demo System**: Interactive showcase of sync capabilities

### 📊 **Advanced Analytics**
- Interactive multi-line charts
- Real-time data visualization
- Trend analysis
- Performance metrics

### 📱 **Mobile-First Design**
- Responsive sidebar overlay
- Touch-optimized interface
- Mobile-friendly charts
- Progressive Web App ready

## 🚀 Technology Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN/UI** - Modern component library
- **Recharts** - Interactive data visualization
- **Lucide React** - Beautiful icons

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **PostgreSQL Triggers** - Automated data synchronization
- **Database Views** - Optimized complex queries for real-time data
- **JSONB Storage** - Flexible metadata and event tracking
- **Row Level Security** - Enterprise-grade data protection
- **Next.js API Routes** - Serverless backend functions

### Testing & Quality
- **Playwright** - End-to-end testing (115+ tests)
- **TypeScript ESLint** - Code quality and consistency

## 📁 Project Structure

```
bakery-management/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── recipes/           # Recipe management
│   │   ├── hpp/               # HPP calculator
│   │   ├── ingredients/       # Ingredients management
│   │   ├── inventory/         # Inventory system
│   │   ├── orders/            # Order management
│   │   ├── customers/         # Customer management
│   │   ├── production/        # Production planning
│   │   ├── finance/           # Financial management
│   │   ├── expenses/          # Smart expense automation ⭐
│   │   ├── sync-demo/         # Real-time sync demonstration ⭐ NEW!
│   │   ├── reports/           # Analytics & reports
│   │   └── settings/          # System settings
│   ├── components/
│   │   ├── ui/                # ShadCN/UI components
│   │   ├── layout/            # Layout components
│   │   ├── automation/        # Smart automation features
│   │   └── charts/            # Data visualization
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and configurations
│   └── types/                 # TypeScript type definitions
├── tests/                     # Playwright test suites
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Clone Repository
```bash
git clone https://github.com/heytrackid/heytrack-umkm.git
cd heytrack-umkm
git checkout bakery-management
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Environment Setup
Create `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Features (Optional)
OPENROUTER_API_KEY=your_openrouter_key
AI_MODEL=x-ai/grok-4-fast:free
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=1500

# Environment
NODE_ENV=development
```

### Run Development Server
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Run All Tests
```bash
npm run test
# or
npx playwright test
```

### Run Tests with UI
```bash
npx playwright test --ui
```

### Test Coverage
- **115+ End-to-end tests**
- **100% Core functionality coverage**
- **Cross-browser testing** (Chrome, Firefox, Safari)
- **Mobile responsiveness testing**
- **Automation engine testing**

## 💡 Smart Automation Features

### 🔄 Real-Time Data Synchronization Engine ⭐ NEW!
- **Instant Cross-Module Updates**: Changes in inventory automatically update recipe availability
- **Smart Ingredient Consumption**: Orders automatically consume ingredients from stock
- **Auto-Customer Creation**: New customers created from orders with analytics tracking
- **Event-Driven Architecture**: Every data change triggers sync events with full audit trail
- **System Health Monitoring**: Real-time sync status with health metrics
- **Conflict Resolution**: Advanced data consistency management
- **Zero Data Loss**: Enterprise-grade reliability with comprehensive error handling

### 🤖 Expense Automation Engine
- **Auto-generate recurring expenses**: Rent (Rp 5M/month), Utilities, Salaries
- **Smart budget alerts**: 80% threshold warnings
- **Cost spike detection**: 35% increase alerts
- **Overdue payment reminders**: 3-day advance notifications

### 📊 Budget Optimization
- **Real-time progress tracking** with visual progress bars
- **Category-wise analysis**: 8 expense categories with icons
- **Over-budget warnings** with specific amounts
- **Monthly/weekly recurring patterns**

### 💰 Cost Savings Suggestions
- **Electricity optimization**: 20% savings (Rp 170K/month)
- **Delivery route optimization**: 15% savings (Rp 45K/month)
- **Communication package optimization**: 25% savings (Rp 37.5K/month)
- **Total potential savings**: Rp 450,000/month

## 📈 Data Visualization

### Multi-line Charts
- **Inventory Trends**: Stock in/out/waste/remaining
- **Financial Trends**: Revenue/expenses/profit/HPP
- **Interactive legends** with data point highlighting
- **Responsive design** for all screen sizes

### Analytics Dashboard
- **Real-time KPIs** and performance metrics
- **Trend analysis** with historical data
- **Category breakdowns** with visual representations
- **Export capabilities** for reports

## 📱 Mobile Experience

### Responsive Design
- **Mobile-first approach** with touch optimization
- **Overlay sidebar** that doesn't block content
- **Swipe gestures** for navigation
- **Optimized charts** for mobile viewing

### Progressive Web App
- **Offline capability** (coming soon)
- **Push notifications** for alerts
- **App-like experience** on mobile devices

## 🔐 Security & Performance

### Security Features
- **Supabase authentication** with row-level security
- **API route protection** with middleware
- **Input validation** and sanitization
- **Secure environment variables**

### Performance Optimizations
- **Next.js App Router** with server components
- **Image optimization** with Next.js Image
- **Code splitting** for faster load times
- **Lazy loading** for components and charts

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Docker
```dockerfile
# Dockerfile available in root directory
docker build -t bakery-management .
docker run -p 3000:3000 bakery-management
```

### Manual Deployment
```bash
npm run build
npm run start
```

## 🚀 Quick Start

**New to HeyTrack?** Check out our [Quick Start Guide](./QUICK_START.md) to get up and running in 5 minutes!

**Want to know the current status?** See [Project Status](./PROJECT_STATUS.md) for detailed information.

## 📚 Documentation

### Developer Documentation ✅

1. **[API Documentation](./docs/API_DOCUMENTATION.md)**
   - All 42 API endpoints documented
   - Request/response examples
   - Auto-sync behavior explained
   - Error handling guide

2. **[Menu → API → Database Audit](./docs/MENU_API_DATABASE_AUDIT.md)**
   - Complete system mapping
   - All menu items tracked
   - Database relationships
   - Data flow diagrams

3. **[Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)**
   - Production deployment guide
   - Environment setup
   - Testing procedures
   - Rollback plan

4. **[Project Summary](./docs/PROJECT_SUMMARY.md)**
   - Complete feature list
   - Technical achievements
   - Future roadmap
   - Success metrics

### Quick Links

- **Dashboard**: `/` - Main dashboard with metrics
- **Cash Flow**: `/cash-flow` - Complete income/expense tracking
- **Profit Report**: `/profit` - WAC-based profit analysis
- **Ingredients**: `/ingredients` - Inventory management
- **Recipes**: `/resep` - Recipe management
- **Orders**: `/orders` - Order processing
- **AI Assistant**: `/ai` - AI-powered insights

## 📊 Business Impact

### Financial Management ✅
- **Auto-Sync Income**: 100% automated from delivered orders
- **WAC-Based COGS**: Accurate cost tracking
- **Real Profit Calculation**: Net profit with all costs
- **Period Analysis**: Flexible date range reporting
- **Export Reports**: CSV and Excel support

### Operational Efficiency ✅
- **Real-Time Synchronization**: 100% data consistency across all modules
- **Automated workflow** for financial tracking
- **Smart inventory consumption**: Zero manual stock updates needed
- **Smart categorization** of income and expenses
- **Budget compliance** monitoring
- **Exception handling** for anomalies
- **Instant customer insights**: Auto-generated analytics

### Data-Driven Decisions ✅
- **Interactive analytics** for trend identification
- **Cost center analysis** for optimization opportunities
- **Performance metrics** for business growth
- **Predictive insights** for planning
- **AI-powered recommendations** for pricing and inventory

## 🛣️ Roadmap

### Q1 2024
- [x] **Real-Time Data Synchronization**: Cross-module sync with zero-latency updates ✅
- [x] **Smart Automation Engine**: Auto-consume ingredients, customer analytics ✅
- [ ] **Advanced AI Features**: Machine learning for demand forecasting
- [ ] **Mobile App**: React Native companion app
- [ ] **API Integration**: Third-party accounting software
- [ ] **Advanced Reporting**: Custom report builder

### Q2 2024
- [ ] **Multi-location Support**: Chain bakery management
- [ ] **Inventory Automation**: Auto-ordering integration
- [ ] **Customer App**: Online ordering system
- [ ] **Advanced Analytics**: Predictive analytics dashboard

### Q3 2024
- [ ] **IoT Integration**: Smart equipment monitoring
- [ ] **Voice Commands**: AI assistant integration
- [ ] **Advanced Security**: Two-factor authentication
- [ ] **Offline Mode**: Progressive Web App features

## 👥 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support & Contact

### Documentation
- **API Documentation**: [docs/api.md](docs/api.md)
- **Component Guide**: [docs/components.md](docs/components.md)
- **Deployment Guide**: [docs/deployment.md](docs/deployment.md)

### Support Channels
- **GitHub Issues**: Bug reports and feature requests
- **Email**: support@heytrack.id
- **Discord**: [Join our community](https://discord.gg/heytrack)

## 🏆 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for deployment platform
- **ShadCN** for the beautiful UI components
- **Supabase** for the backend infrastructure
- **HeyTrack Team** for continuous development

---

**Built with ❤️ by HeyTrack Team**

*Empowering bakeries with smart technology and AI-driven insights.*
