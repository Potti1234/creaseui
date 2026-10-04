# Base UI → creaseui parity report

Generated: 2026-09-29. Scope: every creaseui component that maps to a
Base UI suite (30 components), plus a visual comparison of all 62 shared
docs pages against `shadcn/ui` v4 (`/docs/components/base/*`).

## Method

- Each Base UI test suite (`base-ui/packages/react/src/<suite>`) was ported
  to `scene/<comp>-baseui.scene.test.ts` in the `foldkit/scene` DSL and run
  against **both** renderers (`src/ui` Tailwind + `src/stylex`).
- Results: **2,300 cases total — 1,514 pass, 304 expected-fail
  (`it.fails`, asserting the Base UI expectation), 482 `it.todo`**.
- `it.todo` = behaviors the scene DSL cannot express (real DOM events,
  timers, portals, pointer capture, layout-driven focus) or features
  creaseui does not expose.
- `it.fails` = a real behavioral divergence from Base UI. The counts below
  are unique assertions; each `it.fails` is duplicated per renderer, so
  ~155 `it.fails` ≈ ~75 distinct divergences.

## Divergence themes (most frequent first)

1. **`data-*` state hooks missing.** The single largest gap. Base UI stamps
   `data-popup-open` (open trigger), `data-pressed`, `data-checked` /
   `data-unchecked`, `data-complete`, `data-index`, `data-disabled`,
   `data-panel-open`, `data-closed`, `data-invalid`, `data-multiple`,
   `data-filled`, `data-focused`, `data-has-submenu-open`,
   `data-placeholder`, `data-open`. creaseui generally emits `data-open` /
   `data-highlighted` only where already present.
2. **ARIA wiring.** `aria-describedby` not pointed at rendered description
   (dialog, alert-dialog, drawer, toast); `aria-valuetext` absent
   (progress, range slider thumbs); `aria-labelledby` wiring on
   toast/alertdialog; `role` mismatches (popover popup lacks `role=dialog`,
   accordion panel lacks `role=region`, toast root not `role=dialog`,
   dialog popup lacks `role=presentation`); `aria-orientation` emitted
   where Base UI omits it for the default orientation (tabs, select
   listbox); `aria-autocomplete` not flipped to `none` while readOnly;
   `aria-readonly` not set on select trigger; group label not hidden from
   the a11y tree (dropdown-menu).
3. **Disabled semantics.** Base UI uses the native `disabled` attribute
   (removes from tab order, blocks pointer) where creaseui emits
   `aria-disabled` and keeps the element focusable — toggle, button
   (renderButton `<a>`), collapsible, select trigger, accordion items,
   input-otp group, field (`data-disabled` style hook on all parts,
   fieldset `aria-labelledby`, nested-fieldset inheritance, validity-while-
   disabled).
4. **Keyboard behavior.** Accordion toggles on Space _keydown_ instead of
   keyup; combobox opens on focus, doesn't move caret on Home/End, no
   PageUp/PageDown, no highlight reset past last option; select doesn't
   focus the selected item on open, wraps focus at list edges, no
   typeahead on a closed trigger; menubar opens menus on focus/arrow of a
   closed menubar, doesn't close submenus on ArrowRight; dropdown-menu
   skips disabled items during typeahead/arrow nav, lacks multi-char
   typeahead accumulation, Space during typeahead activates items, no
   diacritic matching, submenu doesn't open on click or on third level,
   Escape closes parent, checkbox/radio items close the menu; tabs move
   focus+activate disabled tabs rather than focus-without-activating;
   radio-group doesn't select on arrow landing, no RTL horizontal flip;
   slider no Shift=largeStep, no PageUp largeStep, no tiny-step precision,
   no clamping of out-of-range controlled values.
5. **Popup/tooltip lifecycle.** Context-menu opens on Enter/Space (Base UI
   restricts to the contextmenu gesture); hover-card doesn't reopen after
   Escape, closes incorrectly after externally-opened popup; tooltip
   doesn't close when becoming disabled or on post-delay click, no
   pointer-events handling; navigation-menu doesn't close the previous
   item when a different trigger opens on mouse/touch.
6. **Component-specific gaps.** Avatar mounts `<img>` immediately (Base UI
   keeps it unmounted until `load`, hides from AT on error/re-src);
   combobox clears selection when input emptied, keeps popup open on empty
   result set, missing Empty mount, `data-active` vs `data-highlighted`;
   progress emits no formatted `aria-valuetext`, no complete-at-max;
   switch emits a `value` attribute and misses `data-unchecked` on
   control+thumb; toast no `timeout=0` no-dismiss, no per-toast dismissal
   messages on dismissAll, live region misses `aria-atomic`/`aria-relevant`,
   no Escape close, wrong stacking order; form doesn't set `novalidate`;
   scroll-area keeps non-overflowing viewport in tab order; field misses
   `data-invalid` omission for valid fields; toggle-group reverses DOM in
   RTL+vertical and misses `aria-disabled="false"`/`data-pressed`.
7. **Structural / form integration.** Hidden-input `id` conventions differ
   (Base UI `<id>-hidden-input`); combobox hidden input not `disabled` when
   it should not submit; modal=false still renders an internal backdrop
   (popover, dropdown-menu); submenu trigger doesn't open on click.

## Notable expected-fail highlights per component

| Component       | Key divergences                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accordion       | Space-on-keydown; panel `role=region`/`aria-labelledby`; `data-panel-open`; native disabled                                                                 |
| alert-dialog    | `aria-describedby`, `aria-labelledby` on alertdialog element                                                                                                |
| avatar          | image kept unmounted until load; AT hidden on error/src-change; `<span>` root                                                                               |
| button          | `renderButton` link lacks `role=button`; aria-disabled vs native                                                                                            |
| collapsible     | native disabled + tab-order removal; `data-panel-open`; `data-closed`/`hidden`                                                                              |
| combobox        | no open-on-focus; caret Home/End; PageUp/Down; clear-on-empty; Empty mount; readOnly `aria-autocomplete`                                                    |
| context-menu    | opens via keyboard; backdrop contextmenu block; `data-popup-open`                                                                                           |
| dialog          | popup `role=presentation`                                                                                                                                   |
| drawer          | `aria-describedby`                                                                                                                                          |
| dropdown-menu   | submenu click/third-level; disabled-item nav+typeahead; multi-char/diacritic typeahead; Escape scope; `data-checked`; group label a11y; modal backdrop      |
| field           | `data-disabled` on all parts; invalid-while-disabled; fieldset `aria-labelledby`; nested disable                                                            |
| form            | `novalidate` not set                                                                                                                                        |
| hover-card      | reopen-after-Escape; externally-opened hover-out; `data-popup-open`                                                                                         |
| input-otp       | `data-complete` root+slots; `data-filled`/`data-focused`; disabled guards                                                                                   |
| menubar         | open-on-focus/arrow; submenu click; closeOnClick semantics; `data-has-submenu-open`                                                                         |
| navigation-menu | close-previous on trigger switch; `data-popup-open`                                                                                                         |
| popover         | `role=dialog`; `data-popup-open`/`data-pressed`/`data-open`; modal backdrop                                                                                 |
| progress        | formatted `aria-valuetext`; indeterminate text; complete-at-max                                                                                             |
| radio-group     | arrow-select; RTL flip; group `aria-disabled`                                                                                                               |
| scroll-area     | non-overflow viewport tabIndex                                                                                                                              |
| select          | `role=combobox` trigger; focus-selected-on-open; edge wrap; closed-trigger typeahead; native disabled; `aria-readonly`; hidden-input id; `data-placeholder` |
| slider          | range-thumb `aria-valuenow`/`aria-valuetext`/`aria-orientation`; Shift/PageUp largeStep; tiny-step precision; value clamping; `data-index`                  |
| switch          | stray `value` attr; `data-unchecked` on control+thumb                                                                                                       |
| tabs            | `aria-orientation` default; panel `data-index`; no onValueChange on re-activate; disabled-tab focus-not-activate                                            |
| toast           | `timeout=0`; dismissAll messages; live-region attrs; `role=dialog`; labelled/describedby; Escape close; order                                               |
| toggle          | native `disabled` vs `aria-disabled`                                                                                                                        |
| toggle-group    | `aria-disabled="false"`; `data-multiple`; RTL+vertical DOM order; `data-pressed`                                                                            |
| tooltip         | close-on-disable; pointer-events positioner; post-delay click; `data-popup-open`; resolved-side mirroring                                                   |

## Visual comparison (vs shadcn v4 `base` variant docs)

- All **62 shared component pages** screenshot-compared at 1440×900 plus
  full-page captures (`/docs/components/<name>` on creaseui :4173 vs
  `/docs/components/base/<name>` on shadcn :4000).
- **Verdict: faithful.** Demo content, variant coverage, and styling match
  the shadcn Base UI docs nearly section-for-section (verified on all
  first-fold captures; deep-checked button, checkbox full pages — same
  variant order, same visual treatment).
- Differences are docs-chrome only (sidebar/header, shadcn's deploy promo)
  and demo-content choices — e.g. creaseui's `message-scroller` demo is a
  minimal chat surface vs shadcn's rich mock; `data-table` demo is
  narrower (no filter input/columns dropdown above the table);
  `typography` uses a different story than `typeset` but renders the same
  prose hierarchy.

## Runtime bug found while screenshotting (fixed in this PR)

**Resizing the window on any docs page crashed the app.**
Playwright `fullPage` screenshots resize the viewport to the content
height (~5–16k px), which reliably triggered the "Application Crash"
screen:

```
TypeError: Cannot read properties of undefined (reading '_tag')
  at update (src/lib/dropdown-menu-behavior.ts)
  at updateTyped (src/ui/dropdown-menu.ts)
  at update (src/docs/components/pages/button/tailwind.ts)
  at update (src/docs/components/pages/authored-page.ts → catalog.ts → main.ts GotCatalogDocsMessage)
```

Root cause: `src/docs/components/catalog.ts` lifts **every** page's
preview-program subscriptions for all example slots with no `when` gate,
and `GotExampleMessage` carries no slug — so the drawer page's
`window resize` subscription (`ChangedViewport`) emitted on **every** docs
page and was fed to the _current_ page's preview program. On the button
page, `update` read `message.message` (a `GotMenuMessage` field that a
`ChangedViewport` doesn't have) → `DropdownMenu.update(model.menu,
undefined)` → `undefined._tag` crash.

Fix: `when: model => model.slug === slug` on the lifted subscriptions so a
page's subscriptions only emit while that page is active. Any resize on
any docs page previously crashed the app — not just tall viewports; the
fullPage screenshot was simply an easy trigger.

## Files

- `scene/*-baseui.scene.test.ts` — 30 ported suites (+ checkbox pilot)
- `docs/baseui-test-porting-guide.md` — DSL semantics + porting conventions
- `docs/baseui-parity-report.md` — this report
