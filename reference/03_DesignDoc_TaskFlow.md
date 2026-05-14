# TaskFlow — Design Document (Frontend Guidelines)

---

## 1. Tech Stack — Frontend

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic elements) |
| Styling | CSS3 (custom properties, Flexbox, Grid) |
| Interactivity | Vanilla JavaScript (ES6+) |
| Real-Time | Socket.io Client |
| Icons | Lucide Icons (via CDN) or Feather Icons |
| Charts | Chart.js (via CDN) |
| Date Picker | Flatpickr (lightweight, no framework dependency) |

No frontend framework (React, Vue, Angular) is used. The UI is built entirely with HTML, CSS, and JavaScript.

---

## 2. Design Philosophy

TaskFlow uses a **Cinematic Dark-First** design language — deep dark backgrounds with glowing teal/cyan and purple accent colors that give the interface an immersive, high-tech feel. A Light theme is also supported for users who prefer it.

Design principles:
- **Clarity over complexity:** Every UI element serves a function
- **Micro-interactions everywhere:** Hover glows, smooth transitions, progress animations
- **Mobile-first responsive:** Designed at 375px, scaled up to 1440px
- **Glassmorphism accents:** Frosted card surfaces, layered depth
- **Color as communication:** Priority and status are always color-coded — never rely on text alone

---

## 3. Color Palette

### Dark Theme (Default)

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0D1117` | Page/app background |
| `--bg-surface` | `#161B22` | Cards, sidebar, modals |
| `--bg-elevated` | `#1C2128` | Hover states, dropdowns |
| `--accent-cyan` | `#00E5FF` | Primary CTA, active states, glows |
| `--accent-purple` | `#A855F7` | Secondary accent, In Progress column |
| `--accent-blue` | `#3B82F6` | Low priority badge, Completed column |
| `--text-primary` | `#FFFFFF` | Headings, primary text |
| `--text-secondary` | `#8B949E` | Labels, secondary text |
| `--text-muted` | `#484F58` | Placeholders, disabled |
| `--border` | `#30363D` | Card borders, dividers |
| `--success` | `#22C55E` | Completed status badge |
| `--warning` | `#F59E0B` | Medium priority badge |
| `--danger` | `#EF4444` | High priority badge, delete action |

### Light Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#F6F8FA` | Page background |
| `--bg-surface` | `#FFFFFF` | Cards, sidebar |
| `--bg-elevated` | `#F0F4F8` | Hover states |
| `--accent-cyan` | `#0EA5E9` | Primary CTA |
| `--text-primary` | `#0D1117` | Headings |
| `--text-secondary` | `#57606A` | Labels |
| `--border` | `#D0D7DE` | Borders |

Themes are toggled via a `data-theme="light"` or `data-theme="dark"` attribute on the `<html>` element, and all color tokens update automatically via CSS custom properties.

---

## 4. Typography

| Style | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Page Title | Inter | 32px | 700 | H1, hero text |
| Section Heading | Inter | 24px | 600 | H2, card titles |
| Sub-heading | Inter | 18px | 600 | H3, modal titles |
| Body | Inter | 14px | 400 | Body text, descriptions |
| Label | Inter | 12px | 500 | Form labels, tags |
| Micro | Inter | 11px | 400 | Timestamps, captions |

Font stack: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`  
Load via Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`

---

## 5. Layout System

### Grid
- Use CSS Grid for page-level layouts (sidebar + main content + right panel)
- Use Flexbox for component-level layouts (card rows, nav items, button groups)

### Spacing Scale (use multiples of 4px)
`4px / 8px / 12px / 16px / 20px / 24px / 32px / 40px / 48px / 64px`

### Breakpoints
| Name | Min Width | Layout |
|---|---|---|
| Mobile | 0 | Single column, bottom nav |
| Tablet | 768px | Sidebar collapsed, icon-only |
| Desktop | 1024px | Full sidebar (240px wide) |
| Wide | 1280px | 3-panel layout (sidebar + main + activity) |

### App Shell
```
┌─────────────┬────────────────────────────┬──────────────┐
│  Sidebar    │      Main Content Area     │ Right Panel  │
│  (240px)    │      (flexible)            │  (320px)     │
└─────────────┴────────────────────────────┴──────────────┘
```

---

## 6. Component Specifications

### 6.1 Sidebar
- Fixed on left, full height
- Background: `--bg-surface` with a subtle right border
- Logo at top, nav icon links in middle, Logout icon at bottom
- Active page: left border accent (2px solid `--accent-cyan`), icon color becomes cyan
- On mobile: hidden; replaced by bottom tab bar

### 6.2 Stat Cards (Dashboard)
- Grid of 4 cards, equal width
- Background: `--bg-surface`, border: `1px solid --border`, border-radius: `12px`
- Icon at top, metric label below in `--text-secondary`, large number in `--text-primary`
- Pending card uses purple background tint; High Priority uses a subtle red tint

### 6.3 Task Row (List View)
- Full-width row, `--bg-surface`, border-bottom: `1px solid --border`
- Hover: background lightens to `--bg-elevated`
- Left: task title + description truncated. Right: priority badge, date, status badge
- Priority badges: pill shape, colored background + text (red=High, amber=Medium, blue=Low)
- Status badges: Pending (gray), In Progress (cyan glow + pulsing dot), Completed (green)

### 6.4 Kanban Card
- Rounded card (`border-radius: 12px`), `--bg-surface`, soft border
- Top: assignee avatar (32px circle), task title
- Middle: brief description in `--text-secondary`
- Bottom: progress bar (thin, colored by priority) + percentage, priority badge
- Dragging state: card lifts with `box-shadow` glow and slight scale (1.02)

### 6.5 Modal
- Full-screen dark overlay: `rgba(0, 0, 0, 0.6)` backdrop
- Modal card centered: max-width 540px, `--bg-surface`, `border-radius: 16px`
- Close (×) button top-right
- Inputs: dark background (`--bg-elevated`), `--accent-cyan` focus ring, `border-radius: 8px`
- CTA button: `--accent-cyan` background, white text, full-width at bottom
- Opens with a subtle scale-up animation (`transform: scale(0.95) → 1`, 200ms ease)

### 6.6 Buttons
| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | `--accent-cyan` | `#000` | none | Create Task, Save |
| Secondary | transparent | `--text-primary` | `1px solid --border` | Cancel, Back |
| Danger | `--danger` | `#fff` | none | Delete |
| Ghost | transparent | `--accent-cyan` | none | Subtle actions |

- Border-radius: `8px`
- Padding: `10px 20px`
- Hover: `filter: brightness(1.1)`
- Focus: `outline: 2px solid --accent-cyan; outline-offset: 2px`

### 6.7 Form Inputs
- Background: `--bg-elevated`
- Border: `1px solid --border`
- Border-radius: `8px`
- Padding: `10px 14px`
- Focus: border-color changes to `--accent-cyan`, glow: `0 0 0 3px rgba(0,229,255,0.2)`
- Placeholder: `--text-muted`

### 6.8 Charts
- Built with Chart.js
- Weekly Productivity: area chart with gradient fill (cyan to purple)
- Grid lines: `--border` color, no visible axis borders
- Tooltip: dark card style, white text

### 6.9 Toast Notifications
- Bottom-right corner, stack upward
- Background: `--bg-elevated`, left border: 3px solid (green=success, red=error, cyan=info)
- Auto-dismiss after 3 seconds with fade-out animation
- Max 3 toasts visible at once

---

## 7. Micro-Interactions & Animations

| Interaction | Animation |
|---|---|
| Page load | Fade in (`opacity: 0 → 1`, 300ms) |
| Modal open | Scale up (`scale: 0.95 → 1`, 200ms ease-out) |
| Card drag | Lift with glow shadow |
| Button hover | `brightness(1.1)`, 150ms transition |
| Socket update received | Ripple glow on updated task card |
| Kanban drop | Card slides into new position |
| Status badge In Progress | Pulsing cyan dot animation |
| Toast appear/dismiss | Slide in from right, fade out |

---

## 8. Accessibility

- All interactive elements have visible focus states
- Color is never the sole indicator of state — always paired with text or icon
- `aria-label` on icon-only buttons
- Modals trap focus when open and restore focus on close
- Form inputs associated with `<label>` elements via `for`/`id`
- Minimum touch target: 44×44px on mobile
- Contrast ratio: minimum 4.5:1 for body text, 3:1 for large text

---

## 9. File & Folder Structure (Frontend)

```
/public
  /css
    reset.css          ← normalize / box-sizing
    variables.css      ← all CSS custom properties (tokens)
    layout.css         ← app shell, sidebar, grid
    components.css     ← buttons, inputs, cards, badges
    pages/
      dashboard.css
      tasks.css
      board.css
      calendar.css
      settings.css
      auth.css
  /js
    main.js            ← app init, route handling
    api.js             ← fetch wrapper, JWT header injection
    auth.js            ← login, register, logout logic
    socket.js          ← Socket.io client setup and event handlers
    dashboard.js
    tasks.js
    board.js           ← drag-and-drop logic
    calendar.js
    settings.js
    utils.js           ← toast, date formatting, helpers
  /assets
    /icons
    /images
  index.html           ← landing page
  login.html
  register.html
  app.html             ← authenticated app shell (single HTML with JS routing)
```
