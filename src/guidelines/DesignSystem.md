# ERP System Design System
## iPad Optimized Design System (pt units)

---

## Table of Contents
1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [iPad Specifications](#ipad-specifications)
4. [Color System](#color-system)
5. [Typography](#typography)
6. [Spacing System](#spacing-system)
7. [Layout & Grid](#layout--grid)
8. [Components](#components)
9. [Module Views](#module-views)
10. [Icons](#icons)
11. [Interaction Patterns](#interaction-patterns)
12. [Responsive Breakpoints](#responsive-breakpoints)

---

## Overview

This design system provides comprehensive guidelines for building a minimalistic ERP system optimized for iPad devices. The system emphasizes clarity, efficiency, and touch-friendly interactions suitable for business workflows on iPad.

### Key Features
- **Platform**: iPad-optimized web application
- **Framework**: React + Tailwind CSS
- **Design Philosophy**: Minimalistic, enterprise-grade, touch-optimized
- **Unit System**: Point (pt) units for consistency across iPad devices
- **Mapping**: 1px = 1pt (all values are natural numbers)

---

## Design Principles

1. **Clarity First**: Clean, uncluttered interfaces that prioritize essential information
2. **Touch-Optimized**: All interactive elements sized for comfortable touch interaction (minimum 44pt)
3. **Efficient Workflows**: Quick actions and shortcuts prominently accessible
4. **Responsive Hierarchy**: Clear visual hierarchy with appropriate spacing
5. **Enterprise Professional**: Business-appropriate aesthetics without sacrificing usability
6. **Accessibility**: WCAG AA compliant color contrasts and keyboard navigation

---

## iPad Specifications

### Target Devices
- **iPad Mini**: 744 × 1133 pt (portrait) / 1133 × 744 pt (landscape)
- **iPad Air / iPad 10.9"**: 820 × 1180 pt (portrait) / 1180 × 820 pt (landscape)
- **iPad Pro 11"**: 834 × 1194 pt (portrait) / 1194 × 834 pt (landscape)
- **iPad Pro 12.9"**: 1024 × 1366 pt (portrait) / 1366 × 1024 pt (landscape)

### Design Target
Primary optimization for **iPad Pro 11"** (1194 × 834 pt landscape) with responsive adaptation for other sizes.

### Orientation
- **Primary**: Landscape mode
- **Content Area**: 1194 × 834 pt (actual screen area)
- **Device Frame**: 1234 × 874 pt (including 20pt bezel on all sides)

---

## Color System

### Light Mode (Default)

#### Primary Colors
```css
--background: #ffffff          /* Pure white background */
--foreground: oklch(0.145 0 0) /* Near-black text (~#1a1a1a) */
--primary: #030213             /* Primary brand color - dark blue-black */
--primary-foreground: #ffffff  /* Text on primary */
```

#### Secondary & Accent Colors
```css
--secondary: oklch(0.95 0.0058 264.53)  /* Light blue-gray */
--secondary-foreground: #030213         /* Text on secondary */
--accent: #e9ebef                       /* Subtle gray accent */
--accent-foreground: #030213            /* Text on accent */
--muted: #ececf0                        /* Muted background */
--muted-foreground: #717182             /* Muted text */
```

#### UI Element Colors
```css
--card: #ffffff                 /* Card background */
--card-foreground: #030213      /* Card text */
--border: rgba(0, 0, 0, 0.1)   /* Border color - subtle */
--input-background: #f3f3f5     /* Input field background */
--switch-background: #cbced4    /* Switch inactive state */
```

#### Status Colors
```css
--destructive: #d4183d          /* Error/delete actions */
--destructive-foreground: #ffffff
--success: #16a34a              /* Success states */
--warning: #ea580c              /* Warning states */
--info: #0284c7                 /* Information */
```

#### Chart Colors
```css
--chart-1: oklch(0.646 0.222 41.116)  /* Orange */
--chart-2: oklch(0.6 0.118 184.704)   /* Blue */
--chart-3: oklch(0.398 0.07 227.392)  /* Dark blue */
--chart-4: oklch(0.828 0.189 84.429)  /* Yellow */
--chart-5: oklch(0.769 0.188 70.08)   /* Yellow-green */
```

---

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Type Scale (iPad Optimized - pt/px units)

#### Display & Headings
```css
Display Large:   32pt / 500 weight / 1.3 line-height
Display:         28pt / 500 weight / 1.3 line-height
H1 (2xl):        24pt / 500 weight / 1.5 line-height
H2 (xl):         20pt / 500 weight / 1.5 line-height
H3 (lg):         18pt / 500 weight / 1.5 line-height
H4 (base):       16pt / 500 weight / 1.5 line-height
```

#### Body Text
```css
Body Large:      18pt / 400 weight / 1.6 line-height
Body (base):     16pt / 400 weight / 1.5 line-height
Body Small:      14pt / 400 weight / 1.5 line-height
Caption:         12pt / 400 weight / 1.4 line-height
```

#### UI Elements
```css
Button:          16pt / 500 weight / 1.5 line-height
Label:           16pt / 500 weight / 1.5 line-height
Input:           16pt / 400 weight / 1.5 line-height
Badge:           13pt / 500 weight / 1.2 line-height
```

### Font Weights
```css
--font-weight-normal: 400   /* Regular text */
--font-weight-medium: 500   /* Headings, buttons, labels */
--font-weight-semibold: 600 /* Emphasis */
--font-weight-bold: 700     /* Strong emphasis */
```

---

## Spacing System

### Base Unit
**4pt base** - All spacing follows 4pt increments for visual consistency

### Spacing Scale (pt/px units - all natural numbers)
```css
--space-0:   0      /* None */
--space-1:   4      /* Extra tight */
--space-2:   8      /* Tight */
--space-3:   12     /* Comfortable */
--space-4:   16     /* Standard */
--space-5:   20     /* Relaxed */
--space-6:   24     /* Loose */
--space-8:   32     /* Extra loose */
--space-10:  40     /* Section spacing */
--space-12:  48     /* Large section spacing */
--space-16:  64     /* Page section divider */
--space-20:  80     /* Major sections */
--space-24:  96     /* Page padding */
```

### Component-Specific Spacing

#### Cards
```css
Padding (internal):      24pt
Gap between cards:       24pt
Card header padding:     24pt
Card content padding:    24pt
Border radius:           12pt
```

#### Forms
```css
Label to input:          8pt
Input vertical padding:  12pt
Input horizontal padding: 16pt
Input height:            44pt (touch-friendly)
Form field gap:          20pt
Form section gap:        32pt
```

#### Buttons
```css
Small button:            32pt height, 8pt 12pt padding
Default button:          36pt height, 12pt 16pt padding
Large button:            44pt height, 14pt 24pt padding
Touch-friendly button:   44pt height (minimum)
Icon button size:        44pt × 44pt
Button gap:              12pt
Border radius:           8pt
```

#### Layout
```css
Device bezel:            20pt (all sides)
Device frame:            1234pt × 874pt (with bezel)
Content area:            1194pt × 834pt (actual screen)
Split view width:        597pt × 834pt (each panel)
Page padding:            24pt
Section spacing:         32pt
Grid gap:                24pt
```

### Touch Target Guidelines
- **Minimum**: 44pt × 44pt for all interactive elements
- **Recommended**: 48pt × 48pt for primary actions
- **Spacing between targets**: Minimum 8pt

---

## Layout & Grid

### iPad Pro 11" Landscape Layout
```
Content Area: 1194 × 834 pt (actual screen)
Device Frame: 1234 × 874 pt (with 20pt bezel)
Split Panel:  597 × 834 pt (each panel)
```

### Grid System

#### Card Grid (Landscape 1194pt wide content area)
```css
Columns: 3-4 (depending on card size)
Gap: 24pt
Card min-width: 280pt
Card typical: ~360pt wide
```

#### Sidebar + Content Layout
```css
Sidebar width:           240pt (expanded), 64pt (collapsed)
Main content:            Remaining width (954pt or 1130pt)
Sidebar padding:         16pt
Content padding:         24pt
```

---

## Components

### Button Component

#### Sizes (all natural numbers)
```css
Small:    h-[32px] px-[12px]         /* 32pt height */
Default:  h-[36px] px-[16px]         /* 36pt height */
Large:    h-[44px] px-[24px]         /* 44pt height (touch-friendly) */
Icon:     w-[44px] h-[44px]          /* 44pt × 44pt */
```

#### Border Radius
```css
Default:  rounded-[8px]              /* 8pt radius */
```

#### Variants
- `default` - Primary background
- `secondary` - Secondary background
- `outline` - Border with transparent background
- `ghost` - Transparent with hover
- `destructive` - Error/delete actions
- `link` - Text link style

### Card Component

```css
Border radius:           rounded-[12px]      /* 12pt */
Border:                  border (1px)
Padding:                 p-[24px]            /* 24pt */
Gap:                     gap-[24px]          /* 24pt between sections */
```

### Input Component

```css
Height:                  h-[44px]            /* 44pt - prevents iOS zoom */
Padding:                 px-[16px] py-[12px]
Border radius:           rounded-[8px]       /* 8pt */
Border:                  border (1px)
Font size:              text-[16px]         /* 16pt */
```

### Table Component

```css
Row height:              56pt (comfortable for touch)
Cell padding:            py-[16px] px-[20px]
Header height:           48pt
Border:                  1pt
```

### Dialog/Modal Component

```css
Max-width:               640pt
Padding:                 24pt
Border-radius:           16pt
Backdrop:                rgba(0, 0, 0, 0.5)
```

### Badge Component

```css
Height:                  24pt
Padding:                 4pt 12pt
Font-size:               13pt
Border-radius:           6pt
```

---

## Icons

### Icon Library
**Lucide React** - Consistent, minimalistic icon set

### Icon Sizes (pt/px units)
```css
Small:      12pt × 12pt    /* Inline text icons */
Default:    16pt × 16pt    /* UI elements, buttons */
Medium:     20pt × 20pt    /* Card headers */
Large:      24pt × 24pt    /* Dashboard stats */
XL:         32pt × 32pt    /* Hero sections */
```

### Icon Usage
- Default button: 16pt icon
- Large button: 20pt icon
- Icon-only button: 16-20pt icon (centered)
- Card header: 20pt icon
- Dashboard stats: 24pt icon

---

## Interaction Patterns

### Touch Gestures

#### Tap
- **Target size**: Minimum 44pt × 44pt
- **Feedback**: Scale 0.97, transition 100ms
- **Response time**: Maximum 100ms

#### Hover (with trackpad/mouse)
```css
Buttons:     opacity 90%, transition 200ms
Cards:       subtle shadow, scale 1.01
Links:       underline, color change
```

#### Focus (keyboard navigation)
```css
Focus ring:  3pt solid ring color
Offset:      2pt
```

### Transitions & Animations

```css
--duration-fast:     150ms
--duration-normal:   200ms
--duration-slow:     300ms

Fade:       opacity, 200ms ease
Scale:      transform scale, 200ms ease-out
Slide:      transform translate, 300ms ease-in-out
```

---

## Responsive Breakpoints

### iPad-Specific Breakpoints (pt/px units)

```css
/* iPad Mini - Portrait */
@media (max-width: 744px) {
  /* Collapsed sidebar, single column */
}

/* iPad Pro 11" - Landscape (Primary target) */
@media (min-width: 1025px) and (max-width: 1194px) {
  /* 3-column grid, 240pt sidebar */
}

/* iPad Pro 12.9" - Landscape */
@media (min-width: 1195px) {
  /* 4-column grid, 280pt sidebar */
}
```

---

## Implementation Notes

### CSS Pixel to Point Mapping

In this design system, **1px = 1pt** for iPad web development:

```css
/* All values use px in CSS but map 1:1 to pt */
.button {
  height: 44px;        /* = 44pt on iPad */
  padding: 12px 16px;  /* = 12pt 16pt on iPad */
  border-radius: 8px;  /* = 8pt on iPad */
}
```

### Natural Numbers Only

All spacing, sizing, and dimensions use **natural numbers** (no decimals):
- ✅ `padding: 24px` (Good)
- ❌ `padding: 24.5px` (Avoid)

### Device Frame

```css
Content area:       1194 × 834 px (actual screen)
Device frame:       1234 × 874 px (with bezel)
Bezel:              20px all sides
Split panel:        597 × 834 px (each)
Home indicator:     140 × 4 px (bottom center)
Border radius:      40px (device), 24px (screen)
```

---

## Quick Reference

### Common Dimensions (px = pt)

**Spacing:**
- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

**Touch Targets:**
- Minimum: 44 × 44
- Comfortable: 48 × 48

**Typography:**
- Display: 32, 28, 24
- Headings: 20, 18, 16
- Body: 16, 14, 12

**Border Radius:**
- Small: 6
- Default: 8
- Large: 12
- XL: 16

**Component Heights:**
- Input: 44
- Button (default): 36
- Button (touch): 44
- Table row: 56
- Card min: 160

---

## Version History

**Version 1.0** - January 2026
- Initial design system for iPad-optimized ERP
- 1px = 1pt mapping
- Natural numbers only
- Landscape-first design (1194 × 834 pt)

**Last Updated:** January 19, 2026
