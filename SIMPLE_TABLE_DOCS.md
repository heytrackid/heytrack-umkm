# Simple Data Table with Filter Implementation

## ✅ What's Been Implemented

### 1. **SimpleDataTable Component** (`/src/components/ui/simple-data-table.tsx`)
- **Search Functionality**: Global search across all columns
- **Column-Specific Filters**: Dropdown filters with custom options
- **Sorting**: Click column headers to sort data
- **Export**: CSV export functionality
- **Actions Menu**: View, Edit, Delete actions with dropdown
- **Responsive Design**: Mobile-friendly table
- **Loading State**: Skeleton loading animation
- **Empty State**: Custom message when no data

### 2. **Implementation in bahan-simple Page** (`/src/app/bahan-simple/page.tsx`)
- **Dual View Mode**: Toggle between Grid Cards and Table view
- **Smart Integration**: Maintains existing functionality while adding table view
- **Filter Options**: Status filter (Aman/Rendah/Habis) in table view
- **Column Definitions**: Properly configured columns with custom renderers

## 🎨 Key Features

### **Simple API**
```tsx
<SimpleDataTable
  title="Daftar Bahan Baku"
  description="Kelola stok bahan dengan fitur pencarian dan filter"
  data={bahan}
  columns={tableColumns}
  searchPlaceholder="Cari nama bahan..."
  onAdd={() => setShowAddDialog(true)}
  onEdit={handleEditBahan}
  onDelete={(item) => deleteBahan(item.id)}
  addButtonText="Tambah Bahan"
  emptyMessage="Belum ada bahan. Tambah bahan pertama!"
  exportData={true}
/>
```

### **Column Configuration**
```tsx
const tableColumns = [
  {
    key: 'nama',
    header: 'Nama Bahan',
    sortable: true,
    render: (value) => <span className="font-medium">{value}</span>
  },
  {
    key: 'statusStok',
    header: 'Status',
    filterable: true,
    filterOptions: [
      { label: 'Aman', value: 'aman' },
      { label: 'Rendah', value: 'rendah' },
      { label: 'Habis', value: 'habis' }
    ],
    render: (value) => <Badge>{value}</Badge>
  }
]
```

### **View Toggle**
- **Grid View**: Original card-based layout with individual stock editing
- **Table View**: New table with filtering, sorting, and export
- **Toggle Button**: Switch between Grid/Table modes
- **Maintains State**: Search and data persist between views

## 🚀 Usage in Other Pages

To implement the SimpleDataTable in other simple pages:

### 1. Import the Component
```tsx
import { SimpleDataTable } from '@/components/ui/simple-data-table'
```

### 2. Define Column Structure
```tsx
const columns = [
  {
    key: 'name',
    header: 'Nama',
    sortable: true
  },
  {
    key: 'status',
    header: 'Status',
    filterable: true,
    filterOptions: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' }
    ]
  }
]
```

### 3. Use the Component
```tsx
<SimpleDataTable
  data={yourData}
  columns={columns}
  onEdit={handleEdit}
  onDelete={handleDelete}
  exportData={true}
/>
```

## 🔧 Available Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Table title |
| `description` | string | Table description |
| `data` | T[] | Array of data objects |
| `columns` | Column[] | Column configuration |
| `searchPlaceholder` | string | Search input placeholder |
| `onAdd` | function | Add new item handler |
| `onView` | function | View item handler |
| `onEdit` | function | Edit item handler |
| `onDelete` | function | Delete item handler |
| `addButtonText` | string | Add button text |
| `emptyMessage` | string | Empty state message |
| `exportData` | boolean | Enable CSV export |
| `loading` | boolean | Show loading state |

## 📱 Responsive Features

- **Mobile Optimized**: Horizontal scrolling for mobile
- **Hide Columns**: `hideOnMobile` property for columns
- **Action Menu**: Dropdown for actions on mobile
- **Touch Friendly**: Proper button sizes and spacing

## 🎯 Benefits

1. **Simple Implementation**: Easy to add to existing simple pages
2. **Consistent Design**: Uses shadcn/ui components throughout
3. **Feature Rich**: Search, filter, sort, export in one component
4. **Flexible**: Customizable columns and actions
5. **No Complex Dependencies**: Built with basic React patterns
6. **Lightweight**: Much simpler than TanStack Table approach

The SimpleDataTable provides a perfect balance between functionality and simplicity, making it ideal for your simple-style pages while providing powerful table features with filtering capabilities.