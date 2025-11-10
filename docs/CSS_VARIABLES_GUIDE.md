# CSS Variables & Theming Guide

## Overview

HeyTrack menggunakan CSS variables untuk theming yang konsisten di seluruh aplikasi. Semua warna dan styling harus menggunakan CSS variables yang sudah didefinisikan di `src/app/globals.css`.

## ❌ JANGAN Gunakan Hardcoded Colors

```tsx
// ❌ SALAH - Hardcoded colors
<div className="text-gray-900 bg-white border-gray-200">
<div style={{ color: '#000000', backgroundColor: '#ffffff' }}>
<div className="text-black bg-gray-50">

// ❌ SALAH - Inline styles dengan hardcoded colors
<div style={{ 
  color: 'rgb(0, 0, 0)',
  backgroundColor: 'hsl(0, 0%, 100%)',
  borderColor: '#e5e7eb'
}}>
```

## ✅ GUNAKAN CSS Variables

```tsx
// ✅ BENAR - Menggunakan Tailwind classes yang sudah mapped ke CSS variables
<div className="text-foreground bg-background border-border">
<div className="text-card-foreground bg-card">
<div className="text-muted-foreground bg-muted">

// ✅ BENAR - Menggunakan CSS variables di inline styles (jika diperlukan)
<div style={{ 
  color: 'var(--foreground)',
  backgroundColor: 'var(--background)',
  borderColor: 'var(--border)'
}}>
```

## Available CSS Variables

### Colors

#### Background & Foreground
- `--background` / `bg-background` - Background utama aplikasi
- `--foreground` / `text-foreground` - Text color utama

#### Card
- `--card` / `bg-card` - Background untuk card/panel
- `--card-foreground` / `text-card-foreground` - Text color di dalam card

#### Popover
- `--popover` / `bg-popover` - Background untuk popover/dropdown
- `--popover-foreground` / `text-popover-foreground` - Text color di popover

#### Primary
- `--primary` / `bg-primary` - Primary brand color
- `--primary-foreground` / `text-primary-foreground` - Text di atas primary color

#### Secondary
- `--secondary` / `bg-secondary` - Secondary color untuk badges, tags
- `--secondary-foreground` / `text-secondary-foreground` - Text di secondary

#### Muted
- `--muted` / `bg-muted` - Muted background untuk subtle elements
- `--muted-foreground` / `text-muted-foreground` - Muted text (descriptions, labels)

#### Accent
- `--accent` / `bg-accent` - Accent color untuk highlights
- `--accent-foreground` / `text-accent-foreground` - Text di accent

#### Destructive
- `--destructive` / `bg-destructive` - Destructive actions (delete, error)
- `--destructive-foreground` / `text-destructive-foreground` - Text di destructive

#### Borders & Inputs
- `--border` / `border-border` - Border color untuk semua elements
- `--input` / `bg-input` - Background untuk input fields
- `--ring` / `ring-ring` - Focus ring color

#### Charts
- `--chart-1` to `--chart-5` - Colors untuk data visualization

### Border Radius
- `--radius` - Base border radius (0.625rem)
- `--radius-sm` - Small radius (calc(var(--radius) - 4px))
- `--radius-md` - Medium radius (calc(var(--radius) - 2px))
- `--radius-lg` - Large radius (var(--radius))
- `--radius-xl` - Extra large radius (calc(var(--radius) + 4px))

## Common Patterns

### Card Component
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <h3 className="text-foreground font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Button Variants
```tsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</button>

// Secondary button
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary Action
</button>

// Destructive button
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
  Delete
</button>
```

### Form Elements
```tsx
<input 
  className="bg-input text-foreground border-border focus:ring-ring"
  placeholder="Enter text..."
/>

<textarea 
  className="bg-input text-foreground border-border focus:ring-ring"
/>

<select className="bg-input text-foreground border-border">
  <option>Option 1</option>
</select>
```

### Status Badges
```tsx
// Success
<span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
  Success
</span>

// Warning
<span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
  Warning
</span>

// Error
<span className="bg-destructive/10 text-destructive">
  Error
</span>

// Info
<span className="bg-secondary text-secondary-foreground">
  Info
</span>
```

### Borders
```tsx
// Standard border
<div className="border border-border">

// Enhanced border (slightly more visible)
<div className="border border-enhanced">

// Subtle border (very subtle)
<div className="border border-subtle">

// Prominent border (for emphasis)
<div className="border border-prominent">
```

## Dark Mode Support

Semua CSS variables sudah otomatis support dark mode. Tidak perlu menambahkan `dark:` prefix untuk basic colors:

```tsx
// ✅ Otomatis support dark mode
<div className="bg-background text-foreground border-border">

// ❌ Tidak perlu ini (redundant)
<div className="bg-background dark:bg-background text-foreground dark:text-foreground">
```

Gunakan `dark:` prefix hanya untuk override khusus:

```tsx
// ✅ Override khusus untuk dark mode
<div className="bg-card hover:bg-muted dark:hover:bg-card/50">
```

## Custom Utility Classes

Global CSS sudah menyediakan utility classes tambahan:

### Border Variants
- `.border-subtle` - Border sangat subtle
- `.border-enhanced` - Border standard
- `.border-prominent` - Border lebih terlihat

### Text Wrapping
- `.text-wrap-mobile` - Word break untuk mobile
- `.text-wrap-balance` - Balanced text wrapping
- `.text-break-all` - Break semua words (untuk URL panjang)
- `.line-clamp-2-mobile` - Limit 2 lines dengan ellipsis
- `.line-clamp-3-mobile` - Limit 3 lines dengan ellipsis

### Scrollbar
- `.scrollbar-thin` - Thin custom scrollbar

### Animations
- `.animate-fade-in` - Fade in animation
- `.animate-fade-in-scale` - Fade in dengan scale
- `.animate-slide-in-top` - Slide dari atas
- `.animate-slide-in-bottom` - Slide dari bawah
- `.animate-success-pulse` - Success pulse effect
- `.animate-shake` - Shake animation untuk error

### Mobile
- `.mobile-min-vh` - Minimum viewport height untuk mobile
- `.touch-manipulation` - Touch-friendly tap targets

## Recharts Theming

Untuk charts, gunakan CSS variables:

```tsx
import { useTheme } from 'next-themes'

function MyChart() {
  const { theme } = useTheme()
  
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <Line 
          stroke="hsl(var(--primary))" 
          fill="hsl(var(--primary))"
        />
        <CartesianGrid 
          stroke="hsl(var(--border))" 
          strokeDasharray="3 3"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--popover-foreground))'
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

## Migration Checklist

Jika menemukan hardcoded colors, ganti dengan:

- [ ] `text-gray-900` → `text-foreground`
- [ ] `text-gray-600` → `text-muted-foreground`
- [ ] `text-black` → `text-foreground`
- [ ] `text-white` → `text-primary-foreground` (di atas primary) atau `text-background`
- [ ] `bg-white` → `bg-background` atau `bg-card`
- [ ] `bg-gray-50` → `bg-muted`
- [ ] `bg-gray-100` → `bg-secondary`
- [ ] `bg-gray-900` → `bg-background` (dark mode)
- [ ] `border-gray-200` → `border-border`
- [ ] `border-gray-300` → `border-border`
- [ ] `#000000` → `var(--foreground)` atau `oklch(0 0 0)`
- [ ] `#ffffff` → `var(--background)` atau `oklch(1 0 0)`
- [ ] `rgb(...)` → CSS variables
- [ ] `hsl(...)` → CSS variables

## Testing

Selalu test komponen di kedua mode:

1. Light mode - Default
2. Dark mode - Toggle theme switcher
3. Check contrast untuk accessibility
4. Verify borders terlihat di kedua mode

## Resources

- Global CSS: `src/app/globals.css`
- Theme Provider: `src/providers/ThemeProvider.tsx`
- shadcn/ui components: `src/components/ui/`
