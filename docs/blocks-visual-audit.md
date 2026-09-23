# Blocks visual audit

Reviewed the original Tailwind sidebar gallery (16 blocks) and StyleX gallery
(11 entries) with Playwright before combining them. The two overlapping sidebar
entries are now part of the complete native StyleX sidebar family.

The combined `/blocks` gallery contains 31 blocks in each renderer: 16 sidebars,
thirteen dashboards and two authentication layouts. `/blocks-stylex` still selects
StyleX; existing `/blocks/sidebar` and `/blocks/sidebar/:id` links still work.
Standalone previews use `/blocks/preview/:renderer--:name`.

## Coverage

Every block below was captured in both renderers at 1440 x 1000 and 390 x 844.
Screenshots were visually reviewed for layout, alignment, missing icons, chart
sizing and containment. Browser assertions cover page overflow, missing icons,
chart canvas dimensions, login input state and mobile sidebar dismissal.

| Blocks | Review result |
| --- | --- |
| dashboard-01 | Responsive metrics, bounded chart, usable document table |
| astryx-executive-summary | Charts stack on mobile; insight rail follows content |
| astryx-cohort-funnel | Funnel, chart and retention table remain readable |
| astryx-project-status | Progress, trend and workstream sections retain hierarchy |
| astryx-service-monitoring | Charts stack; alert rail follows content |
| astryx-incident-console | Dense table scrolls locally on narrow screens |
| chart-analytics-dashboard | All six chart families render with bounded dimensions |
| sidebar-01, sidebar-02, sidebar-03, sidebar-04 | Documentation navigation and mobile drawers checked |
| sidebar-05, sidebar-06 | Disclosure and popover navigation checked |
| sidebar-07, sidebar-08 | Application navigation, collapsed state and action spacing checked |
| sidebar-09 | Mail navigation icons, list and narrow layout checked |
| sidebar-10 | Workspace navigation, truncation and page action popover checked |
| sidebar-11 | File tree indentation and icons checked |
| sidebar-12 | Calendar selection and five-column preview on mobile checked |
| sidebar-13 | Dialog spacing, focus, Escape, closing and reopening checked |
| sidebar-14 | Right-side navigation and mobile drawer checked |
| sidebar-15 | Dual sidebars, calendar and narrow layout checked |
| sidebar-16 | Sticky header and sidebar offset checked |
| login-03, login-04 | Mobile padding, input state and brand artwork checked |

## Corrections

- Chart pairs now stack on narrow screens. Dashboard chart hosts have a bounded
  height, including the Tailwind canvas inside its adapter wrapper.
- Login inputs retain entered values; GitHub icons align with button text.
  The split layout uses the existing crease mark as its artwork.
- Sidebar action menus no longer insert extra empty rows. Mobile controls open
  and dismiss their drawer independently of desktop collapse state.
- Icon generation includes names stored in data, fixing blank navigation icons.
- Settings previews run the normal dialog open lifecycle on mount so focus and
  Escape handling are installed. Panels retain mobile margins and header padding.
- The calendar preview keeps its five-column arrangement on mobile.
- Mail drawers use the shared mobile width and show navigation labels while open.
- The gallery uses one renderer switch, category filters, named live iframes and
  working standalone links. Theme changes refresh previews in both renderers.

## Reproduce

Run the development server on port 4173, then in PowerShell:

```powershell
$env:BLOCKS_VISUAL_AUDIT = '1'
npx playwright test e2e/blocks.spec.ts e2e/stylex-template-system.spec.ts --workers=2
```

Optional audit captures are written to the ignored
`test-results/blocks-audit/{tailwind,stylex}/{desktop,mobile}` directories.
The template tests also check serious/critical axe violations and responsive
containment after chart resize observers settle. Other browser checks cover
renderer/category persistence, old URLs, disclosure/calendar/dialog interactions
and light/dark iframe updates. Original audit captures remain in `test-results`.
