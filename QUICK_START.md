# 🚀 HeyTrack Quick Start Guide

Get up and running with HeyTrack in 5 minutes!

---

## 📋 Prerequisites

- **Node.js** 18+ installed
- **pnpm** package manager
- **Supabase** account (free tier works)
- **Git** for version control

---

## ⚡ Quick Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd heytrack

# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

```bash
# Run migrations (if using Supabase CLI)
supabase db push

# Or manually run the schema.sql file in Supabase dashboard
```

### 4. Start Development

```bash
# Start the dev server
pnpm dev

# Open http://localhost:3000
```

---

## 🎯 First Steps

### 1. Create Your First Customer

1. Navigate to **Customers** page
2. Click **+ Tambah Pelanggan**
3. Fill in customer details
4. Click **Simpan**

### 2. Add Ingredients

1. Go to **Inventory** → **Ingredients**
2. Click **+ Tambah Bahan**
3. Enter ingredient details
4. Set min/max stock levels

### 3. Create a Recipe

1. Navigate to **Recipes**
2. Click **+ Tambah Resep**
3. Add ingredients with quantities
4. System auto-calculates HPP (cost)

### 4. Create an Order

1. Go to **Orders**
2. Click **+ Pesanan Baru**
3. Select customer & recipes
4. System auto-calculates pricing

---

## 🔑 Key Features

### Global Search (Cmd+K)
Press `Cmd+K` (Mac) or `Ctrl+K` (Windows) to search everything instantly!

### Customer Detail Page
Click any customer to see:
- Complete customer info
- Order history
- Purchase statistics
- Quick actions

### Reports Dashboard
Navigate to `/reports` for:
- Sales reports
- Inventory reports
- Financial reports
- Export to Excel/PDF

### Empty States
When you have no data, you'll see beautiful empty states with quick action buttons.

### Confirmation Dialogs
All delete actions require confirmation to prevent accidents.

---

## 📱 Navigation

### Main Menu
- **Dashboard** - Overview & analytics
- **Customers** - Customer management
- **Orders** - Order tracking
- **Inventory** - Stock management
- **Recipes** - Recipe & HPP
- **Reports** - Analytics & reports
- **Settings** - App configuration

### Keyboard Shortcuts
- `Cmd+K` / `Ctrl+K` - Global search
- `Esc` - Close modals/dialogs
- `Enter` - Submit forms

---

## 🎨 UI Components

### Using Empty States

```tsx
import { EmptyIngredients } from '@/components/ui/empty-state'

{data.length === 0 && (
  <EmptyIngredients onAdd={handleAdd} />
)}
```

### Using Confirmation Dialogs

```tsx
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog'

<DeleteConfirmDialog
  open={showConfirm}
  onOpenChange={setShowConfirm}
  onConfirm={handleDelete}
  itemName="Customer Name"
/>
```

### Using Card Lists (Mobile)

```tsx
import { CardList } from '@/components/ui/card-list'

<CardList
  items={data}
  renderCard={(item) => (
    <div>{item.name}</div>
  )}
/>
```

---

## 🔧 Common Tasks

### Adding a New Page

1. Create file in `src/app/your-page/page.tsx`
2. Use `AppLayout` wrapper
3. Add to navigation menu
4. Update types if needed

### Creating a New Component

1. Create in `src/components/`
2. Use TypeScript for props
3. Export from index if shared
4. Add to Storybook (optional)

### Adding a Database Table

1. Create migration in `supabase/migrations/`
2. Update types in `src/types/`
3. Add to `useSupabase` hook if needed
4. Test with sample data

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### TypeScript Errors

```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### Database Connection Issues

1. Check `.env.local` has correct Supabase URL & key
2. Verify Supabase project is active
3. Check network connection
4. Review Supabase dashboard for errors

### Build Errors

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Type check
pnpm type-check
```

---

## 📚 Learn More

### Documentation
- `README.md` - Project overview
- `PROJECT_STATUS.md` - Current status
- `DEPLOYMENT.md` - Deployment guide
- `TESTING.md` - Testing guide
- `/docs` folder - Detailed docs

### Key Files
- `src/hooks/useSupabase.ts` - Database hook
- `src/lib/currency.ts` - Currency utilities
- `src/types/` - TypeScript types
- `supabase/schema.sql` - Database schema

---

## 🎯 Next Steps

1. ✅ Complete initial setup
2. ✅ Create sample data
3. ✅ Explore all features
4. ✅ Read documentation
5. ✅ Customize for your needs
6. ✅ Deploy to production

---

## 💡 Tips

### Performance
- Use code splitting for large components
- Implement lazy loading where possible
- Optimize images and assets
- Enable caching strategies

### Security
- Never commit `.env.local`
- Use Row Level Security in Supabase
- Validate all user inputs
- Keep dependencies updated

### Best Practices
- Follow TypeScript conventions
- Write meaningful commit messages
- Test before deploying
- Document complex logic

---

## 🆘 Need Help?

### Resources
- **Documentation** - Check `/docs` folder
- **GitHub Issues** - Report bugs
- **Discussions** - Ask questions
- **Supabase Docs** - Database help

### Common Questions

**Q: How do I add a new user?**  
A: Use Supabase Auth dashboard or implement signup flow.

**Q: Can I customize the theme?**  
A: Yes! Edit `tailwind.config.ts` and theme variables.

**Q: How do I export data?**  
A: Use the Reports page → Export button.

**Q: Is it mobile-friendly?**  
A: Yes! Fully responsive design with mobile-optimized views.

---

## 🎉 You're Ready!

HeyTrack is now running and ready to use. Start by adding your first customer, then create some recipes and orders.

**Happy tracking!** 🚀

---

*For detailed documentation, see `PROJECT_STATUS.md` and `/docs` folder.*
