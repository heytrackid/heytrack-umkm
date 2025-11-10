---
inclusion: always
---

# CSS Theming & Styling Rules

## CRITICAL: No Hardcoded Colors

**NEVER** use hardcoded colors in the codebase. Always use CSS variables defined in `src/app/globals.css`.

### ❌ FORBIDDEN Patterns

```tsx
// ❌ Hardcoded Tailwind gray colors
<div className="text-gray-900 bg-gray-50 border-gray-200">

// ❌ Hardcoded hex colors
<div style={{ color: '#000000', backgroundColor: '#ffffff' }}>

// ❌ Hardcoded rgb/rgba
<div style={{ color: 'rgb(0, 0, 0)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>

// ❌ Hardcoded hsl
<div style={{ color: 'hsl(0, 0%, 0%)' }}>

// ❌ Hardcoded text colors
<div className="text-black text-white">
```

### ✅ REQUIRED Patterns

```tsx
// ✅ Use semantic CSS variables via Tailwind
<div className="text-foreground bg-background border-border">
<div className="text-card-foreground bg-card">
<div className="text-muted-foreground bg-muted">

// ✅ Use CSS variables in inline styles (when necessary)
<div style={{ 
  color: 'var(--foreground)',
  backgroundColor: 'var(--background)',
  borderColor: 'var(--border)'
}}>

// ✅ Use themed components
import { ThemedCard, ThemedBadge } from '@/components/ui/themed-elements'
<ThemedCard>Content</ThemedCard>
<ThemedBadge variant="success">Status</ThemedBadge>
```

## Available CSS Variables

### Text Colors
- `text-foreground` - Primary text color
- `text-muted-foreground` - Secondary/muted text
- `text-card-foreground` - Text on cards
- `text-primary-foreground` - Text on primary backgrounds
- `text-secondary-foreground` - Text on secondary backgrounds
- `text-destructive` - Error/destructive text

### Background Colors
- `bg-background` - Main background
- `bg-card` - Card/panel background
- `bg-muted` - Muted/subtle background
- `bg-primary` - Primary brand color
- `bg-secondary` - Secondary color
- `bg-destructive` - Error/destructive background
- `bg-input` - Input field background
- `bg-popover` - Popover/dropdown background

### Borders
- `border-border` - Standard border color
- `border-input` - Input border color
- `border-subtle` - Very subtle border
- `border-enhanced` - Enhanced visibility border
- `border-prominent` - Prominent border

### Focus & Interaction
- `ring-ring` - Focus ring color
- `hover:bg-muted` - Hover states
- `focus:ring-ring` - Focus states

## Component Patterns

### Cards
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <h3 className="text-foreground font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Buttons
```tsx
// Primary
<button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Secondary
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">

// Destructive
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
```

### Form Elements
```tsx
<input className="bg-input text-foreground border-border focus:ring-ring" />
<textarea className="bg-input text-foreground border-border focus:ring-ring" />
<select className="bg-input text-foreground border-border" />
```

### Status Badges
```tsx
// Use ThemedBadge component
<ThemedBadge variant="success">Active</ThemedBadge>
<ThemedBadge variant="warning">Pending</ThemedBadge>
<ThemedBadge variant="error">Failed</ThemedBadge>
```

## Dark Mode

All CSS variables automatically support dark mode. DO NOT add redundant `dark:` prefixes:

```tsx
// ✅ Correct - automatic dark mode support
<div className="bg-background text-foreground">

// ❌ Wrong - redundant
<div className="bg-background dark:bg-background text-foreground dark:text-foreground">
```

Only use `dark:` for specific overrides:

```tsx
// ✅ Correct - specific dark mode override
<div className="bg-card hover:bg-muted dark:hover:bg-card/50">
```

## Charts & Data Visualization

For Recharts, use CSS variables:

```tsx
<Line 
  stroke="hsl(var(--primary))" 
  fill="hsl(var(--primary))"
/>
<CartesianGrid 
  stroke="hsl(var(--border))" 
/>
<Tooltip 
  contentStyle={{
    backgroundColor: 'hsl(var(--popover))',
    borderColor: 'hsl(var(--border))',
    color: 'hsl(var(--popover-foreground))'
  }}
/>
```

## Migration Guide

When you see hardcoded colors, replace with:

| Hardcoded | Replace With |
|-----------|-------------|
| `text-gray-900`, `text-black` | `text-foreground` |
| `text-gray-600`, `text-gray-500` | `text-muted-foreground` |
| `bg-white` | `bg-background` or `bg-card` |
| `bg-gray-50`, `bg-gray-100` | `bg-muted` or `bg-secondary` |
| `bg-gray-900` | `bg-background` (in dark mode) |
| `border-gray-200`, `border-gray-300` | `border-border` |
| `#000000`, `rgb(0,0,0)` | `var(--foreground)` |
| `#ffffff`, `rgb(255,255,255)` | `var(--background)` |

## Enforcement

- ESLint should warn about hardcoded colors
- All new components MUST use CSS variables
- Code reviews should reject hardcoded colors
- Use `ThemedCard`, `ThemedBadge`, etc. from `@/components/ui/themed-elements`

## Resources

- Full guide: `docs/CSS_VARIABLES_GUIDE.md`
- Global CSS: `src/app/globals.css`
- Themed components: `src/components/ui/themed-elements.tsx`
