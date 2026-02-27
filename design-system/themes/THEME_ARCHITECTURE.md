# Theme Architecture

## Overview

The Senior Interview Mentor design system supports 4 themes via `[data-theme]` CSS attribute selectors on `<html>`. Only color, shadow, glass, and glow tokens change per theme — typography, spacing, radius, z-index, layout, and animation tokens are theme-invariant.

## Themes

| Theme | Attribute | Description |
|-------|-----------|-------------|
| Midnight | (default / `data-theme="midnight"`) | Original neo-terminal dark theme |
| Daylight | `data-theme="daylight"` | Professional light mode |
| OLED Black | `data-theme="oled"` | True #000 for OLED screens |
| Warm Night | `data-theme="warm"` | Reduced blue-light for night |

## Switching Mechanism

```css
/* tokens.css — :root holds Midnight defaults (unchanged) */
:root {
  --bg-void: #030305;
  /* ... all existing tokens ... */
}

/* Theme overrides — loaded after tokens.css */
[data-theme="daylight"] { --bg-void: #f8f9fc; /* ... */ }
[data-theme="oled"]     { --bg-void: #000000; /* ... */ }
[data-theme="warm"]     { --bg-void: #08060a; /* ... */ }
```

The `[data-theme]` attribute selector has higher specificity than `:root`, so overrides apply automatically. Midnight is the implicit default when no `data-theme` attribute is present.

## Token Override Map (~55 properties)

Each theme overrides **only** these groups:

| Group | Count | Tokens |
|-------|-------|--------|
| Backgrounds | 7 | `--bg-void` through `--bg-overlay` |
| Glass | 4 | `--glass-surface`, `--glass-elevated`, `--glass-blur`, `--glass-border` |
| Borders | 4 | `--border-subtle`, `--border-default`, `--border-strong`, `--border-focus` |
| Neon accents | 24 | 6 colors x 4 variants (base, dim, glow, subtle) |
| Text | 5 | `--text-bright` through `--text-disabled` |
| Shadows | 5 | `--shadow-sm` through `--shadow-inner` |
| Glows | 6 | `--glow-cyan` through `--glow-purple` |

**NOT overridden** (stable across all themes):
- Typography: `--font-*`, `--text-*` sizes, `--leading-*`, `--tracking-*`
- Spacing: `--space-*`
- Radius: `--radius-*`
- Z-index: `--z-*`
- Layout: `--sidebar-width`, `--topnav-height`, etc.
- Durations: `--duration-*`
- Easings: `--ease-*`
- Border widths: `--border-width-*`

## Integration Steps

### 1. Settings — add theme property

```typescript
// In settings type / localStorage schema
interface Settings {
  theme: 'midnight' | 'daylight' | 'oled' | 'warm';
  // ... existing settings
}
```

### 2. Apply theme — useEffect in App or root component

```typescript
useEffect(() => {
  if (settings.theme === 'midnight') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }
}, [settings.theme]);
```

### 3. Import theme CSS files

```typescript
// main.tsx or App.tsx — import after tokens.css
import '../design-system/themes/theme-daylight.css';
import '../design-system/themes/theme-oled.css';
import '../design-system/themes/theme-warm-night.css';
```

### 4. localStorage persistence

```typescript
// On load, restore theme before React render to prevent flash
const saved = localStorage.getItem('sim-settings');
if (saved) {
  const { theme } = JSON.parse(saved);
  if (theme && theme !== 'midnight') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
```

Place this in a `<script>` tag in `index.html` (before app bundle) to avoid FOUC (flash of unstyled content).

### 5. Monaco editor theme mapping

```typescript
const MONACO_THEME_MAP: Record<string, string> = {
  midnight: 'vs-dark',
  daylight: 'vs',       // light Monaco theme
  oled: 'vs-dark',
  warm: 'vs-dark',
};

// When theme changes:
monaco.editor.setTheme(MONACO_THEME_MAP[settings.theme]);
```

### 6. Auto-detection with prefers-color-scheme

```typescript
// Optional: detect OS preference on first visit
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const defaultTheme = prefersDark ? 'midnight' : 'daylight';

// Listen for changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (settings.theme === 'auto') {
      const theme = e.matches ? 'midnight' : 'daylight';
      document.documentElement.setAttribute('data-theme', theme);
    }
  });
```

## CSS Transition for Theme Switching

Add a smooth transition when themes change:

```css
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Opt specific elements into smooth transitions */
html[data-theme-transitioning] * {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease,
              box-shadow 0.3s ease !important;
}
```

Apply `data-theme-transitioning` briefly during switch, then remove to avoid interfering with component animations.

## Contrast Requirements

All themes maintain WCAG AA contrast ratios:
- **Normal text**: minimum 4.5:1 against background
- **Large text / UI elements**: minimum 3:1
- **Difficulty badges**: remain visually distinguishable (Easy/Medium/Hard)
- **Mode badges**: remain distinct (Teacher/Interviewer/Reviewer)

The Daylight theme uses significantly darkened accent colors since neon values are unreadable on white backgrounds.

## File Structure

```
design-system/
  themes/
    THEME_ARCHITECTURE.md    ← this file
    theme-midnight.css       ← baseline reference (documents :root defaults)
    theme-daylight.css       ← [data-theme="daylight"] overrides
    theme-oled.css           ← [data-theme="oled"] overrides
    theme-warm-night.css     ← [data-theme="warm"] overrides
  pages/
    themes.html              ← interactive preview with live switching
```
