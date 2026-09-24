---
name: testing-creaseui-blocks
description: How to e2e-test creaseui (/blocks gallery + preview pages) on this box, incl. exact mobile/desktop viewports via DevTools device emulation, the client<->tool click-coordinate transform, and foldkit input focus-race workarounds
---

# Testing creaseui (foldkit/Effect-TS Vite SPA)

## Dev server
- `npm run dev -- --host 127.0.0.1 --port 4173` (playwright.config expects 4173). node_modules already installed.
- Routes: `/blocks` gallery (31 `[data-block]` sections, each an iframe `src=/blocks/preview/{renderer}--{name}`); `/blocks/preview/{tailwind|stylex}--{name}` renders full-viewport WITHOUT site header.

## Exact viewport sizes on this box
Chrome clamps window width >= ~532px, so window resizing cannot reach 390px mobile. Instead:
1. Maximize the Chrome window FIRST (device emulation viewport cramps if the window is narrow).
2. Open DevTools (F12), toggle device toolbar (Ctrl+Shift+M), set Dimensions: Responsive → width/height fields (e.g. 390x844, 1440x844). Height field may refuse 1000 on small screens — width is what matters for overflow assertions (`scrollWidth <= innerWidth`); the repo's `npx playwright test e2e/blocks.spec.ts` corroborates exact 1440x1000.
3. At 50% auto-fit zoom, real mouse clicks inside the emulated viewport need a coordinate transform (empirically calibrated on this box):
   `client_x ~= 3.125 * tool_x - 327.5`, `client_y ~= 3.12 * tool_y - 308`
   (i.e. tool_x = (client_x + 327.5)/3.125; tool_y = (client_y + 308)/3.12)
   Get element client coords with `browser_console` (`getBoundingClientRect()`), then invert to tool coords. Verify calibration once per session by clicking a known element and reading `window.__clicks` from an injected capture-phase recorder.

## foldkit input focus race (real behavior, not a bug)
Typing immediately after clicking a focused input can lose the first keystrokes (the click lands but the controlled-input re-render races the key events). Workarounds:
- Click the INPUT element itself (not its <label> — label->input focus-forwarding drops ~5 fast keystrokes), then `wait 1s`, then type.
- If a first `type` produces `value===""` while `document.activeElement` is the input, just type again — focus is already established.
- Verify landed text via `browser_console` reading `input.value`, not screenshots.

## console/error inspection
- `browser_console` returns only your script's eval result, NOT page console history. Inject `window.__errs` hooks per page (`error` + `unhandledrejection` listeners) and read them back; load-time pageerrors are covered by `npx playwright test e2e/blocks.spec.ts`.
- Benign noise: foldkit perf WARNINGS ("Slow view/patch ... budget"), ECharts `grid.containLabel` deprecation notes. `No Issues` in the DevTools issues pane is a good quick signal.

## Block-specific click targets
- `astryx-inbox-table`: mail rows select via the SUBJECT-cell `<button>` (the row/cell itself is inert). Two different buttons are labeled "Starred" — one in the left sidebar nav (~client x 120) and the real filter tab in the toolbar (~client x 414, same cy as All/Unread ~176). Filter by cy to disambiguate. Tabs: All=5, Unread=3, Starred=2 rows.
- `astryx-card-grid`: kind tabs (All/Templates/Icon sets/Fonts/Presets) filter the grid; counts Templates=3, Icon sets=2, Fonts=2, Presets=1. Empty-state "Clear search" resets query AND kind to all.

## Show-code feature (PR #2) quirks
- Only ONE code panel can be open at a time (single `codeBlock` in model) — opening block B's code closes block A's.
- Source fetches are dynamic `import('?raw')` with NO error handling: a failed fetch (DevTools → device toolbar → throttling dropdown → "Offline") crashes the WHOLE app to foldkit's crash view ("Failed to fetch dynamically imported module") — only recovery is full Reload. Repro: open any unopened block's Code while offline.
- Verify clipboard writes without clipboard-read permission: click copy, then Ctrl+L + Ctrl+V into the omnibox — pasted text proves the write; dismiss the permission prompt. `navigator.clipboard.readText()` throws NotAllowedError without a gesture.
- DevTools throttling dropdown rows are ~28px apart and easy to mis-hit ("Offline" is below "Low-tier mobile") — verify the toolbar label after selecting.

## Mobile/emulated-viewport click pitfalls on this box
- DevTools "inspect element" mode (cursor icon ~tool(672,71) in the device toolbar) intercepts page clicks — they select DOM nodes instead of dispatching events. Toggle it off (Ctrl+Shift+C) before clicking page controls.
- At 100%-zoom 390×844 emulation the transform is `tool_x ≈ 211 + client_x·0.62`, `tool_y ≈ 104.5 + client_y·0.62` (viewport origin ~tool(211,104.5), scale ~0.62). Scrolling/hovering must stay inside x∈[211,453] — outside that you're hitting DevTools chrome.
- Page background for scrolling: hover the gray page margin at tool x≈216 (inside viewport, outside cards/iframes — iframes swallow wheel events).
- Clicks at client y≲60 land on the page's STICKY site header, not the target — scroll target buttons to mid-viewport (y 300–600) before clicking.
- Arm a capture-phase click recorder to debug dead clicks: `document.addEventListener('click', e => __clicks.push({x:e.clientX,y:e.clientY,t:e.target.textContent}), true)`.

## Gallery specifics
- `/blocks` header has "Blocks renderer" group (Tailwind/StyleX, aria-pressed) + theme toggle (`aria-label="Switch to dark mode"` toggles `html.dark` + localStorage `creaseui-theme`); iframe keys re-mount on theme change.
- Theme toggle re-mounts ALL 31 iframes at once -> transient `net::ERR_INSUFFICIENT_RESOURCES` burst in dev mode kills offscreen iframe loads; they lazily reload when scrolled into view. Check `iframe.contentDocument.body.children.length` to count loaded previews.
- Per-block preview assertions from e2e/blocks.spec.ts: `data-icon-missing` count == 0, `document.documentElement.scrollWidth <= innerWidth`, echart hosts `[data-slot="echart"]` contain a visible canvas; `data-size="spark"` hosts are ~56px tall (>=40px floor), others >=150px, width >150.

## foldkit-0.163 migration additions
- **Restart the dev server after a dependency upgrade** — a Vite process started BEFORE `node_modules` changed keeps serving the OLD cached modules. Check `stat node_modules/foldkit/package.json` vs `ps -o etime` on the vite PID; kill + restart (`npm run dev -- --host 127.0.0.1 --port 4173`, log shows "Re-optimizing dependencies because lockfile has changed").
- **0.163 API surface (visible in generated snippets)**: `update/init` return `{model, commands, outMessage}` records (was tuples); `import { type Update } from 'foldkit'` + `Update.Return<Model,Message>` type; `defineMessageUnion` from 'foldkit/message'. Any missed site renders undefined state — the crash view is the red flag.
- **hasDescription/hasOptionDescription seams verified**: describedby emitted ONLY when a description exists — checkbox `docs-checkbox-N-description`, switch `docs-switch-N-description`, dialog `docs-dialog-N-dialog-description`, native-select `docs-native-select-N-description`, radio OPTIONS `docs-radio-F-option-O-description`, form inputs `docs-form-<name>-description`. Verify by reading `getAttribute('aria-describedby')` + resolving the id to visible text.
- **Header theme toggle needs precise aim**: the sun/moon button is at DOM top≈8-28 — tool clicks below y≈55 land on the Chrome address bar/toolbar (pointerdown never reaches the page, `__hit` stays empty). The page content starts ~tool_y 60+; the toggle's true tool position is ~(919,79) NOT the raw DOM-mapped y.
- **diffs-container shadow DOM confirmed on /blocks too** — code panels + snippets all live in `.shadowRoot`; file rail clicks + multi-panel open work normally via tool clicks.

## Docs page hero previews (PR #11 pattern)
Every docs page renders a heading-less "hero" = the FIRST example, as the 2nd child of `main > div` (after the header block, before "How it fits Foldkit"). It has no h2, its own trigger + own `example-code-*` View Code checkbox, and is an INDEPENDENT foldkit instance — verify by interacting with the hero then checking the first section's status text/state is unchanged (and vice versa). Both directions must stay independent.

## View Code toggle mechanics
The "View Code"/"Hide Code" control is a `<label for>` bound to a hidden `input[type=checkbox]#example-code-<slug>`. A real label `.click()` toggles it (fires foldkit change) — `.click()` on the input directly does NOT. The label's DOM rect may sit below the visible "View Code" text; if a tool click on the text doesn't toggle, call `label.click()` via console. All code text is inside `diffs-container.shadowRoot` (light-DOM textContent finds nothing). Generated code is a complete standalone program: imports → Model → tagged messages → `Update.Return` init/update w/ outMessage→lastAction → view w/ the fixture's items verbatim (labels, icons, submenu arrays, direction, trigger text) → Runtime.run.

## dropdown-menu fixture map (12 sections)
Basic "Open" | Submenu "Open" (Invite users›) | Shortcuts "Open" (kbd-hint spans + "Name window" isDisabled inside More-tools submenu) | Icons "Open" | Checkboxes "View options" (Status Bar/Activity Bar checked) | Checkboxes Icons "Notifications" | Radio Group "Open" (Top/Bottom/Right) | Radio Icons "Payment Method" | Destructive "Actions" (red Delete) | Avatar "LP" round trigger | Complex "Complex Menu" (kitchen-sink) | RTL "افتح القائمة" dir=rtl.
Checkbox/radio state PERSISTS across close+reopen (submodel keeps it) — toggle one, reopen, assert aria-checked flipped. RTL: submenu `right:anchor(left)`+flip-inline flies LEFT; `forwardKey=ArrowLeft` (src/lib/dropdown-menu-behavior.ts:154) opens the submenu — verify data-active lands on the submenu-parent first, then ArrowLeft; keys pressed too fast or before focus settles are dropped.
