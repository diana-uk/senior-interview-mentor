# Senior Interview Mentor - Design System

## Design Philosophy: "Neo-Terminal Elite"

A sophisticated dark interface that combines the precision of terminal aesthetics with modern glassmorphism and strategic pops of neon color. This design targets senior engineers who appreciate both form and function.

### Core Principles
1. **Precision over decoration** - Every element serves a purpose
2. **Strategic color bursts** - Neon accents on near-black canvas
3. **Depth through glass** - Layered translucency creates hierarchy
4. **Typography as interface** - Monospace meets editorial
5. **Micro-interactions matter** - Subtle animations reward attention

---

## Files Included

| File | Description |
|------|-------------|
| `tokens.css` | CSS custom properties (colors, typography, spacing, shadows) |
| `components.css` | Component styles (buttons, cards, badges, inputs) |
| `layout.css` | Layout system (grid, sidebar, panels, workspace) |
| `pages/dashboard.html` | Dashboard page prototype |
| `pages/workspace.html` | Problem solving workspace prototype |
| `pages/interview.html` | Mock interview mode prototype |
| `pages/patterns.html` | Pattern library prototype |
| `pages/review.html` | Code review interface prototype |
| `animations.css` | Motion and micro-interactions |

---

## Implementation Guide

### Step 1: Install Fonts
Add to your HTML `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Step 2: Import CSS
```css
@import 'design-system/tokens.css';
@import 'design-system/components.css';
@import 'design-system/layout.css';
@import 'design-system/animations.css';
```

### Step 3: Apply Root Theme
The `tokens.css` file sets up all CSS variables on `:root`.

---

## Color Palette

### Backgrounds (Layered Depth)
- `--bg-void`: #050508 - The deepest black
- `--bg-abyss`: #0a0a0f - Primary background
- `--bg-surface`: #12121a - Card/panel backgrounds
- `--bg-elevated`: #1a1a24 - Elevated elements
- `--bg-glass`: rgba(18, 18, 26, 0.7) - Glass effect base

### Accent Colors (Neon Spectrum)
- `--neon-cyan`: #00f0ff - Primary actions, active states
- `--neon-magenta`: #ff00aa - Warnings, hints
- `--neon-lime`: #a3ff00 - Success, completion
- `--neon-amber`: #ffaa00 - Caution, medium priority
- `--neon-red`: #ff3366 - Errors, hard difficulty

### Text
- `--text-bright`: #ffffff
- `--text-primary`: #e4e4eb
- `--text-secondary`: #8888a0
- `--text-muted`: #555566

---

## Typography

### Font Families
- **Display/Headings**: Outfit (geometric, modern, distinctive)
- **Body**: Outfit (same family for cohesion)
- **Code/Mono**: JetBrains Mono (excellent for code)

### Scale
```
--text-xxs: 10px
--text-xs: 11px
--text-sm: 12px
--text-base: 14px
--text-lg: 16px
--text-xl: 20px
--text-2xl: 24px
--text-3xl: 32px
--text-4xl: 40px
```

---

## Component Library

### Buttons
- `.btn-primary` - Neon cyan, glowing hover
- `.btn-secondary` - Ghost with border
- `.btn-danger` - Red accent
- `.btn-ghost` - Minimal, icon-suitable

### Cards
- `.card` - Glass background, subtle border
- `.card-elevated` - Higher contrast, shadow
- `.card-interactive` - Hover lift effect

### Badges
- `.badge-difficulty-easy` - Lime glow
- `.badge-difficulty-medium` - Amber glow
- `.badge-difficulty-hard` - Red glow
- `.badge-mode-teacher` - Cyan
- `.badge-mode-interviewer` - Magenta
- `.badge-mode-reviewer` - Purple

### Progress Indicators
- `.progress-ring` - Circular progress with glow
- `.progress-bar` - Linear with gradient
- `.progress-steps` - Numbered milestone tracker

---

## Layout Zones

```
+------------------------------------------------------------------+
|  TOPNAV (fixed, glass blur)                                       |
+--------+---------------------------------------------------------+
|        |  WORKSPACE                                               |
| SIDE   |  +-------------------------+---------------------------+ |
| BAR    |  |  CHAT PANEL            |  EDITOR PANEL             | |
| (48px) |  |  (40%)                 |  (60%)                    | |
|        |  |                        |                           | |
|        |  +-------------------------+---------------------------+ |
|        |                                                         |
+--------+---------------------------------------------------------+
```

---

## Unique Features

### 1. Commitment Gate Rings
Circular progress rings that fill as users complete each gate item. Stacked vertically with connecting lines.

### 2. Hint Ladder Visualization
Three-step ladder with glowing rungs. Each hint level illuminates as unlocked.

### 3. Pattern Cards
Algorithm pattern cards with iconic symbols, gradient backgrounds, and category tags.

### 4. Interview Timer
Dramatic countdown with color transitions (green -> amber -> red) and subtle pulse animation.

### 5. Mistake Heatmap
Grid visualization of weak patterns with color intensity indicating frequency.

---

## Animation Tokens

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

---

## Accessibility

- All interactive elements have `:focus-visible` states
- Color contrasts meet WCAG AA standards
- Reduced motion media query support
- Keyboard navigation fully supported
