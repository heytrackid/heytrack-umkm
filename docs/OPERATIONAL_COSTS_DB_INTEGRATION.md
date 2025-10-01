# Operational Costs Database Integration

## Overview

The Operational Costs page has been fully integrated with the Supabase `expenses` table. All operational costs are now stored in the database and automatically flow into financial reports (Cash Flow and Profit).

## Architecture

### Database Schema

Operational costs are stored in the `expenses` table with the following structure:

```sql
expenses (
  id UUID PRIMARY KEY,
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  receipt_number VARCHAR,
  supplier VARCHAR,
  tax_amount NUMERIC DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  payment_method VARCHAR DEFAULT 'CASH',
  status VARCHAR DEFAULT 'paid',
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  reference_type VARCHAR,
  reference_id UUID
)
```

### Category Structure

- **Revenue**: Income records (from orders) - `category = 'Revenue'`
- **Operational Costs**: All other expenses - `category != 'Revenue'`

Common operational cost categories:
- `utilities` - Utilitas (Listrik, air, gas)
- `rent` - Sewa & Properti
- `staff` - Gaji Karyawan
- `transport` - Transport & Logistik
- `communication` - Komunikasi
- `insurance` - Asuransi & Keamanan
- `maintenance` - Perawatan
- `other` - Lainnya

## API Endpoints

### GET /api/operational-costs

Fetch all operational costs from the database.

**Query Parameters:**
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)

**Response:**
```json
{
  "costs": [
    {
      "id": "uuid",
      "name": "string",
      "category": "string",
      "subcategory": "string",
      "amount": 0,
      "frequency": "monthly",
      "description": "string",
      "isFixed": false,
      "expense_date": "2024-01-01",
      "supplier": "string",
      "payment_method": "CASH",
      "status": "paid",
      "receipt_number": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "total": 0,
  "summary": {
    "total_amount": 0,
    "total_monthly": 0,
    "fixed_costs": 0,
    "variable_costs": 0
  }
}
```

### POST /api/operational-costs

Create a new operational cost.

**Request Body:**
```json
{
  "name": "Listrik",
  "category": "utilities",
  "subcategory": "Electricity",
  "amount": 500000,
  "frequency": "monthly",
  "description": "Biaya listrik bulanan",
  "isFixed": false,
  "supplier": "PLN",
  "expense_date": "2024-01-15",
  "payment_method": "BANK_TRANSFER",
  "receipt_number": "INV-001"
}
```

**Response:**
```json
{
  "success": true,
  "cost": { /* created cost object */ }
}
```

### PUT /api/operational-costs

Update an existing operational cost.

**Request Body:**
```json
{
  "id": "uuid",
  "name": "Updated name",
  "amount": 600000,
  // ... other fields to update
}
```

**Response:**
```json
{
  "success": true,
  "cost": { /* updated cost object */ }
}
```

### DELETE /api/operational-costs

Delete one or more operational costs.

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "success": true,
  "deleted_count": 3,
  "message": "Successfully deleted 3 operational cost(s)"
}
```

## UI Integration

### Features Implemented

1. **Fetch from Database**: On page load, all operational costs are fetched from the database
2. **Create**: Add new operational costs via the form
3. **Update**: Edit existing operational costs
4. **Delete**: Delete individual or multiple operational costs (bulk delete)
5. **Quick Setup**: Template-based quick setup that creates records in the database

### State Management

- Costs are fetched on component mount
- After any mutation (create, update, delete), the list is refreshed from the database
- Loading states are properly managed for all operations

### Error Handling

- All API calls include try-catch blocks
- User-friendly error messages are displayed via alerts
- Failed operations don't crash the UI

## Financial Reports Integration

### Cash Flow Report

The Cash Flow report (`/api/reports/cash-flow`) automatically includes operational costs:

```typescript
// Expenses are filtered as: category !== 'Revenue'
const expenses = transactions?.filter(t => t.category !== 'Revenue') || []
const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
const netCashFlow = totalIncome - totalExpenses
```

All operational costs created through the Operational Costs page are automatically:
- Included in total expenses calculation
- Categorized in the expenses breakdown
- Displayed in the transactions list
- Factored into net cash flow calculation

### Profit Report

The Profit report (`/api/reports/profit`) uses operational costs for operating expenses:

```typescript
// Fetch expenses from database
const { data: expenses } = await supabase
  .from('expenses')
  .select('*')
  .neq('category', 'Revenue')  // Exclude revenue records
  .gte('expense_date', startDate)
  .lte('expense_date', endDate)

// Calculate operating expenses
const totalOperatingExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

// Net Profit = Gross Profit - Operating Expenses
const netProfit = grossProfit - totalOperatingExpenses
```

The operating expenses breakdown shows all operational cost categories.

## Testing

### Manual Testing Steps

1. **Navigate to Operational Costs Page**
   - URL: `http://localhost:3000/operational-costs`

2. **Test Create Operation**
   - Click "Tambah Biaya"
   - Fill in the form
   - Click "Simpan"
   - Verify the cost appears in the list

3. **Test Quick Setup**
   - Click "Setup Cepat"
   - Confirm the dialog
   - Verify template costs are created

4. **Test Edit Operation**
   - Click edit icon on any cost
   - Modify the details
   - Click "Simpan"
   - Verify changes are saved

5. **Test Delete Operation**
   - Click delete icon on any cost
   - Confirm the dialog
   - Verify the cost is removed

6. **Test Bulk Delete**
   - Select multiple costs using checkboxes
   - Click "Hapus yang Dipilih"
   - Confirm the dialog
   - Verify all selected costs are removed

7. **Verify in Financial Reports**
   - Navigate to Cash Flow: `http://localhost:3000/cash-flow`
   - Verify operational costs appear in expenses
   - Navigate to Profit: `http://localhost:3000/profit`
   - Verify operational costs appear in operating expenses breakdown

### API Testing with curl

```bash
# Get all operational costs
curl http://localhost:3000/api/operational-costs

# Create a new cost
curl -X POST http://localhost:3000/api/operational-costs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cost",
    "category": "utilities",
    "amount": 100000,
    "frequency": "monthly",
    "description": "Test description",
    "isFixed": false
  }'

# Update a cost (replace <uuid> with actual ID)
curl -X PUT http://localhost:3000/api/operational-costs \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<uuid>",
    "name": "Updated Cost",
    "amount": 150000
  }'

# Delete costs (replace <uuid> with actual IDs)
curl -X DELETE http://localhost:3000/api/operational-costs \
  -H "Content-Type: application/json" \
  -d '{"ids": ["<uuid1>", "<uuid2>"]}'
```

### Database Verification

```sql
-- View all operational costs
SELECT * FROM expenses WHERE category != 'Revenue' ORDER BY expense_date DESC;

-- View cost by category
SELECT category, COUNT(*), SUM(amount) as total
FROM expenses 
WHERE category != 'Revenue'
GROUP BY category
ORDER BY total DESC;

-- View recent operational costs
SELECT 
  description,
  category,
  amount,
  expense_date,
  is_recurring,
  recurring_frequency
FROM expenses 
WHERE category != 'Revenue'
ORDER BY created_at DESC
LIMIT 10;
```

## Benefits

1. **Data Persistence**: All operational costs are now permanently stored in the database
2. **Automatic Report Integration**: Costs automatically flow into financial reports
3. **Data Consistency**: Single source of truth for all expense data
4. **Audit Trail**: All costs have created_at and updated_at timestamps
5. **Flexible Categorization**: Support for categories, subcategories, and tags
6. **Rich Metadata**: Supplier, receipt number, payment method, status tracking

## Migration Notes

### For Existing Users

If you had local/demo data in the Operational Costs page before this integration:

1. The old local state data will not automatically migrate to the database
2. You'll need to re-enter or use the "Quick Setup" feature
3. Once created, all data will persist and sync with reports

### Data Flow

```
Operational Costs Page → expenses table (category != 'Revenue')
                              ↓
                    Cash Flow Report & Profit Report
```

## Security

- All API endpoints use server-side Supabase admin client
- Safety checks prevent accidental deletion of Revenue records
- Row Level Security (RLS) is enabled on the expenses table
- Input validation on both frontend and backend

## Future Enhancements

Possible improvements for future iterations:

1. **Recurring Cost Automation**: Automatically create recurring costs based on frequency
2. **Cost Budgets**: Set budget limits per category
3. **Expense Approval Workflow**: Multi-step approval for large expenses
4. **Attachment Support**: Upload receipts and invoices
5. **Expense Analytics**: Trend analysis and forecasting
6. **Multi-currency Support**: Handle expenses in different currencies
7. **Cost Allocation**: Split costs across multiple departments/projects
8. **Integration with Accounting Software**: Export to QuickBooks, Xero, etc.

## Troubleshooting

### Common Issues

**Issue**: "Failed to fetch costs"
- **Solution**: Check database connection, verify Supabase credentials

**Issue**: "Failed to create cost"
- **Solution**: Verify required fields (name, category, amount) are provided

**Issue**: Costs not appearing in reports
- **Solution**: Ensure `expense_date` is within the report date range

**Issue**: Quick Setup adds duplicates
- **Solution**: Quick Setup filters out existing template names (case-insensitive)

### Debug Checklist

1. ✅ Supabase connection is working
2. ✅ `expenses` table exists with correct schema
3. ✅ API routes are accessible
4. ✅ RLS policies allow operations
5. ✅ Date ranges in reports cover the cost dates
6. ✅ Category is not 'Revenue' for operational costs

## Support

For issues or questions, refer to:
- Main documentation: `/docs/`
- Financial reports summary: `/docs/FINANCIAL_REPORTS_SUMMARY.md`
- Database audit: `/docs/MENU_API_DATABASE_AUDIT.md`
