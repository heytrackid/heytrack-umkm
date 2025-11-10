# shadcn/ui Components - Installation Complete ✅

## Installed Components

### 1. 🎨 **Drawer** - Mobile-Friendly Modal
**Location:** `src/components/ui/drawer.tsx`

Bottom sheet drawer yang perfect untuk mobile. Lebih natural daripada dialog di mobile.

**Usage Example:**
```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

export function OrderDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Buat Pesanan</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Pesanan Baru</DrawerTitle>
          <DrawerDescription>
            Isi form di bawah untuk membuat pesanan baru
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          {/* Form content here */}
        </div>
        <DrawerFooter>
          <Button>Simpan</Button>
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
```

**Best Use Cases:**
- Mobile form (New Order, Add Ingredient)
- Quick actions
- Filter panels
- Image preview

---


- ✅ Search functionality
- ✅ Grouped commands

**Customize:**
Edit `src/components/command-palette.tsx` untuk menambah command baru.

---

### 3. 📊 **Data Table** - Advanced Table Component
**Location:** `src/components/ui/data-table.tsx`

Table dengan sorting, filtering, pagination, dan column visibility built-in.

**Usage Example:**
```tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Define your data type
type Order = {
  id: string
  customer: string
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
}

// Define columns
const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'customer',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Pelanggan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className="capitalize">
          {status === 'pending' && '⏳ Pending'}
          {status === 'completed' && '✅ Selesai'}
          {status === 'cancelled' && '❌ Dibatalkan'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Hapus</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Use in component
export function OrdersTable({ data }: { data: Order[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="customer"
      searchPlaceholder="Cari pelanggan..."
    />
  )
}
```

**Features:**
- ✅ Sorting (click column header)
- ✅ Filtering (search box)
- ✅ Pagination (prev/next buttons)
- ✅ Column visibility toggle
- ✅ Row selection
- ✅ Responsive design

**Best Use Cases:**
- Orders list
- Ingredients list
- Customers list
- Recipes list
- Transactions history

---

## Integration Recommendations

### 1. Replace Simple Tables with DataTable
**Files to update:**
- `src/app/orders/page.tsx` - Orders list
- `src/app/ingredients/page.tsx` - Ingredients list
- `src/app/customers/page.tsx` - Customers list
- `src/app/recipes/page.tsx` - Recipes list

### 2. Use Drawer for Mobile Forms
**Files to update:**
- `src/modules/orders/components/OrderForm.tsx` - Wrap in Drawer
- `src/components/ingredients/EnhancedIngredientForm.tsx` - Mobile version
- `src/app/customers/components/CustomerDialog.tsx` - Replace Dialog with Drawer on mobile

### 3. Command Palette Already Active!
Just press `Cmd+K` or `Ctrl+K` anywhere in the app.

---

## Dependencies Installed

```json
{
  "vaul": "^1.1.2",
  "cmdk": "^1.1.1",
  "@tanstack/react-table": "^8.21.3"
}
```

---

## Quick Tips

### Drawer vs Dialog
- **Drawer**: Mobile-first, slides from bottom, better for forms
- **Dialog**: Desktop-first, centered modal, better for confirmations

### When to use DataTable
- When you have > 10 rows
- When users need to search/filter
- When sorting is important
- When you want professional table UX

### Command Palette Shortcuts
- `Cmd+K` / `Ctrl+K` - Open command palette
- Type to search
- Arrow keys to navigate
- Enter to select
- Esc to close

---

## Next Steps

1. **Replace existing tables** with DataTable for better UX
2. **Add Drawer** to mobile forms for better mobile experience
3. **Customize Command Palette** with more commands specific to your workflow
4. **Add keyboard shortcuts** to common actions

Semua komponen sudah siap digunakan! 🎉
