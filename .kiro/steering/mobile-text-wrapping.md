---
inclusion: always
---

# Mobile Text Wrapping Best Practices

## Problem
Di tampilan mobile, teks yang panjang sering terpotong dengan ellipsis (...) karena menggunakan `truncate` class. Ini membuat informasi tidak lengkap dan membingungkan user.

## Solution
Gunakan utility classes yang sudah disediakan di `globals.css` untuk menangani text wrapping dengan lebih baik.

## Available Utility Classes

### 1. `text-wrap-mobile`
**Use case:** Teks yang harus ditampilkan penuh di mobile
```tsx
<h3 className="font-semibold text-wrap-mobile">
  {ingredient.name}
</h3>
```
- Word breaks at natural points
- Wraps to multiple lines
- Auto hyphenation

### 2. `truncate-desktop-only`
**Use case:** Truncate di desktop (space terbatas), full text di mobile
```tsx
<span className="truncate-desktop-only">
  {customer.email}
</span>
```
- Mobile (≤768px): Full text with wrapping
- Desktop (>768px): Truncated with ellipsis

### 3. `text-wrap-balance`
**Use case:** Teks yang perlu balanced wrapping (judul, heading)
```tsx
<h2 className="text-wrap-balance">
  {order.title}
</h2>
```
- Distributes text evenly across lines
- Better visual balance

### 4. `text-break-all`
**Use case:** URL, kode, atau text tanpa spasi
```tsx
<code className="text-break-all">
  {apiKey}
</code>
```
- Breaks anywhere, even mid-word
- Prevents horizontal overflow

### 5. `line-clamp-2-mobile` / `line-clamp-3-mobile`
**Use case:** Limit lines tapi tetap readable (gunakan jarang!)
```tsx
<p className="line-clamp-3-mobile">
  {description}
</p>
```
- Shows 2-3 lines then ellipsis
- Use only when space is critical

## Migration Guide

### ❌ Before (Bad)
```tsx
// Teks terpotong di mobile
<h3 className="truncate">{name}</h3>
<p className="truncate">{description}</p>
<span className="truncate max-w-32">{email}</span>
```

### ✅ After (Good)
```tsx
// Teks full di mobile
<h3 className="text-wrap-mobile">{name}</h3>
<p className="text-wrap-mobile">{description}</p>
<span className="truncate-desktop-only">{email}</span>
```

## Common Patterns

### Card Titles
```tsx
<div className="flex items-start gap-3">
  <div className="flex-1 min-w-0">
    <h3 className="font-semibold truncate-desktop-only">
      {title}
    </h3>
    <p className="text-sm text-muted-foreground text-wrap-mobile">
      {subtitle}
    </p>
  </div>
  <Button className="flex-shrink-0">Action</Button>
</div>
```

### List Items
```tsx
<div className="flex items-center gap-2">
  <Icon className="flex-shrink-0" />
  <span className="text-wrap-mobile">{text}</span>
</div>
```

### Table Cells (Mobile View)
```tsx
<TableCell>
  <div className="space-y-1">
    <div className="font-medium text-wrap-mobile">
      {customer.name}
    </div>
    <div className="text-sm text-muted-foreground truncate-desktop-only">
      {customer.email}
    </div>
  </div>
</TableCell>
```

### Modal/Dialog Titles
```tsx
<DialogTitle className="text-wrap-mobile">
  {title}
</DialogTitle>
```

## When to Use Each

| Scenario | Class | Reason |
|----------|-------|--------|
| Product names | `text-wrap-mobile` | Users need full name |
| Customer names | `text-wrap-mobile` | Important identification |
| Addresses | `text-wrap-mobile` | Full address needed |
| Email addresses | `truncate-desktop-only` | Can truncate on desktop |
| Phone numbers | `text-wrap-mobile` | Must show full number |
| Descriptions | `text-wrap-mobile` | Full context needed |
| URLs/Codes | `text-break-all` | Prevent overflow |
| Long paragraphs | `line-clamp-3-mobile` | Space constrained |
| Sidebar items | `truncate-desktop-only` | Desktop has less space |

## Important Notes

1. **Always add `flex-shrink-0` to icons** when using text wrapping:
   ```tsx
   <Icon className="flex-shrink-0" />
   ```

2. **Use `min-w-0` on flex containers** to allow text to shrink:
   ```tsx
   <div className="flex-1 min-w-0">
     <span className="text-wrap-mobile">{text}</span>
   </div>
   ```

3. **Avoid `truncate` in mobile-first components** unless absolutely necessary

4. **Test on real mobile devices** - simulator might not show the issue

## Components Already Updated

✅ MobileIngredientCard
✅ EnhancedTransactionList  
✅ DataCard (card-list.tsx)
✅ MobileHeader
✅ OrderSummaryCard
✅ CustomersTable
✅ SidebarItem
✅ Modal/Drawer titles

## When Adding New Components

Before using `truncate`, ask:
- Will users need to see the full text on mobile?
- Is this information critical for decision making?
- Can I use `truncate-desktop-only` instead?

**Default to showing full text on mobile unless space is extremely limited.**

## Testing Checklist

- [ ] Test on mobile viewport (375px width)
- [ ] Test with long text (50+ characters)
- [ ] Test with special characters (emoji, symbols)
- [ ] Test with different languages (Indonesian, English)
- [ ] Verify icons don't wrap with text
- [ ] Check that layout doesn't break

---

**Remember:** Mobile users often have limited screen space, but that doesn't mean we should hide information. Good wrapping is better than truncation!
