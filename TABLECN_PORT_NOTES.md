## Follow-up 2 (in progress) — StyleX hover + overflow audit + component swaps

4 workstreams from Lukas:

1. StyleX block shows unwanted gray hover on close button/dropdowns — diagnose.
2. Audit EVERY dialog/popover in block for overflow/offscreen, LTR + RTL.
3. Created-at filter: replace 2 native `h.Type('date')` inputs → creaseui DateRangeInput.
4. Pagination rows-per-page: native `h.select` → creaseui Select.

### Wiring facts (verified)

- Both renderers share `TableState.Model` (src/lib/tablecn-table.ts); update is `update()` → `updateModel()` pure switch; `update` handles RequestedExport w/ commands.
- Select: `Listbox.create<string,string>().update` from '@foldkit/ui' (flat exports init/create/Model/Message/OutMessage). Model field `pageSizeSelect: Listbox.Model`. init `{id, isAnimated:true}`. OutMessage `Selected({value})`. View: `Select.select({model, maybeSelectedValue: Option.some(v), toParentMessage, items, itemToValue, itemToLabel, triggerClass}, h)`.
- DateRangeInput (lib/date-range-input.ts): Model/init/update/OutMessage shared by both renderers. init `{id, today: Calendar.fromDateInZone(new Date(),'UTC'), value?}`. OutMessage `ChangedValue({value: Option<Range>})`; Range={start,end: CalendarDate}; `dateToISO`/`dateFromISO` exports. View: `DateRangeInput.dateRangeInput({model, toParentMessage, label, size:'sm', hasClear, placeholder}, h)`. `next.commands ?? []` map via Command.mapMessages.
- Update return shape: {model, commands?, outMessage?}.
- dateRangeFilter panel: tailwind tablecn-page.ts L819-908 (`PANEL_CLASS,'left-0 w-56 p-3'`), stylex L1763-1842. Trigger label derives from createdFrom/createdTo strings (keep synced).
- Pagination native select: tailwind L1721-1744; updateSheet also has native h.select (L1293) but NOT in scope.
- ChangedCreatedFrom/ChangedCreatedTo messages: keep (harmless) but view stops emitting them.
- Dev servers: `setsid npx vite --port 5173 &` and `--mode stylex --port 5174`; probes in scripts/*.tmp.cjs (playwright resolves relative to script path).

### Progress update

- Component swaps DONE in both renderers: TableState.Model gained `createdRange: DateRangeInput.Model` + `pageSizeSelect: Listbox.Model` (Listbox.create<string,string>() module const in tablecn-table.ts); messages GotCreatedRangeMessage/GotPageSizeSelectMessage; update() handles them w/ outMessage→createdFrom/createdTo (dateToISO from '@/lib/date-parse') and Selected→pageSize; ClearedFilters clears createdRange.value. Views: tailwind blocks/tablecn-page.ts uses '@/ui/date-range-input' dateRangeInput({model,toParentMessage,label:'Created',size:'sm',hasClear,placeholder}) + '@/ui/select' select({model,maybeSelectedValue,items:[10..50],itemToValue/Label:String,triggerClass:'h-8 w-18'}); stylex blocks-stylex/tablecn-page.ts uses '@/stylex/date-range-input' + '@/stylex/select' w/ `size:'sm'`, `ariaLabel`, `triggerLayoutStyle: tablecnStyles.pageSizeTrigger` ({width:'4.5rem'}). tsc clean.
- GRAY HOVER ROOT CAUSE FOUND+FIXED: stylex block file never applied `reset.button`/`reset.input` → Chrome UA stylesheet paints buttons rgb(239,239,239). Injected `reset.button`/`reset.input` into first `h.Class(className(` of every h.button/h.input (31 sites, import added). ALSO `backgroundColor: {default: null}` in stylex UNSETS reset's transparent in props merge → changed all 7 `backgroundColor:{default:null`→`default:'transparent'` in that file. st.c1 (MENU_ITEM) lacked `:hover` accent (tailwind has hover:bg-accent) → added. Verified: items bg rgba(0,0,0,0), hover oklch(0.97), all aria-labeled buttons transparent.
- Overflow audit + RTL pending. Control menu trigger = button aria-label 'Toggle control menu' (has Direction LTR/RTL segments → SetDirection). Panels: filter-status/priority/hours/created, sort-menu, view-options, control-menu, filter-menu, command-filter; header menus; row ⋯ menus; update sheet; delete dialog; action bar submenus. Panels use TRIGGER_PANEL (relative wrapper + fixed scrim + absolute panel `left-0`/`right-0`).
- Probes in scripts/*.tmp.cjs; tablecn ref dev running :3000 (pnpm dev), vite :5173/:5174.
- Vite HMR mid-probe causes transient crashes (getOrThrow None) — retry probes.

### Progress update 2 (grid fixes applied)

- Grid StyleX: reset.button/reset.input injected on all buttons/inputs; menuItemL + st.c4 default:'transparent' + :hover accent; panels anchor via align param on TRIGGER_PANEL/toolbarButtonPanel ('end' for height+view); toolPanel/colPanel now borderColor:tokens.border + outlineStyle:none + width:auto+minWidth (shell hugs content); filter panel 18rem/w-72 + input minWidth:0; floating pill + icon insets logical.
- Tailwind grid: PANEL_CLASS w-fit min-w-48, filter w-72 + input min-w-0, left-2->start-2, top-2 right-2->top-2 end-2.

### NEW TASK (in progress): full-height + separate blocks

Lukas wants: (a) table AND grid full-height w/ sticky footer (empty gap when few rows, scroll when many), (b) table: REMOVE Server/Client+Filter segs + the ⋯ control-menu entirely, direct LTR/RTL toggle button in right toolbar group instead (pattern: grid's toolButton — border-input h-8 gap-1.5 border px-2.5 text-sm, 'languages' icon, label='LTR'/'RTL', SetDirection toggle), (c) remove 'Tasks' title row, (d) TWO catalog blocks: tablecn stays as data-table, add 'tablecn-grid' — featured-page needs tablecnGrid slot + GotTablecnGridMessage + init('data-grid') + blocks entry. Preview routes auto via resolveBlock(<renderer>--<name>).
Layout today (tailwind tablecn-page.ts ~L1766): tasksTable root 'flex w-full flex-col gap-2.5 overflow-auto' -> make 'flex h-dvh w-full flex-col gap-2.5'; header row (Tasks+controlMenu ~L1776) DELETE; bordered table wrapper 'isolate overflow-hidden rounded-md border' -> 'isolate min-h-0 flex-1 overflow-auto rounded-md border'; footer (pagination+actionBar) stays last. view() ~L1923: remove tablist, dispatch on model.view. init(view='data-table').
Grid (tablecn-grid-view.ts ~L691 gridView): root add h-dvh; grid scroll area add flex-1 min-h-0 (maxHeight viewHeight already viewport-measured, converges via GridViewportHeight observer). StyleX mirrors.

### Progress update 3

- Tailwind DONE: init(view='data-table'); tasksTable root h-dvh w-full flex-col gap-2.5 p-1; Tasks+controlMenu row deleted; controlMenu fn deleted (Mode/Filter segs gone); dirToggle fn added (languages icon + 'LTR'/'RTL', SetDirection toggle) in right toolbar group; table wrapper isolate min-h-0 flex-1 overflow-auto; view() returns tasksTable|gridView directly (no tablist); grid-view root h-dvh w-full flex-col gap-2 p-1 + grid area min-h-0 flex-1.
- REMAINING: featured-page.ts (tailwind + blocks-stylex twin): add tablecnGrid slot (Model field, init TablecnPage.init('data-grid'), GotTablecnGridMessage routing, blocks[] entry 'tablecn-grid' with slotId 'tablecn-grid'); catalog.ts add tablecn-grid entry + update tablecn desc; stylex mirrors of everything (blocks-stylex/tablecn-page.ts + tablecn-grid-view.ts + featured-page.ts); check 'Tasks'/control-menu equivalents in stylex page (segmented controls use 'Mode/Filter/Direction' labels + languages icon); then tsc/eslint, live-verify heights + toggles + both new preview routes (tailwind--tablecn, tailwind--tablecn-grid), commit+push.

### Progress update 4 (select freeze fix)

- User report: page-size select froze page. Root causes: (1) formatDate(task.createdAt) crashed when createdAt arrives as string (model serialization — same reason createdAtMs exists) → defensive Date.parse fallback, both renderers. (2) foldkit Listbox with isAnimated:true never completes LeaveAnimating on the Selected path (DetectMovementOrAnimationEnd race never resolves; only affects option-select close, backdrop close works) → pageSizeSelect now isAnimated:false. NOTE: same latent freeze exists in ALL creaseui Selects with isAnimated:true (docs page repros it) — foldkit-level bug, out of scope.
- Verified tw+sx: select opens, option click closes listbox, value+rows update, page stays clickable.

### Progress update 7 — ROOT CAUSE FOUND (creaseui, not foldkit)

- Freeze: option click during enter → SelectedItem → LeaveStart + commands [FocusButton, WaitForPaint] — returned to outer update but NEVER forked (__cmdLog showed only InspectLatest/ScrollToTop).
- Root cause: src/main.ts GotBlocksTailwindMessage + GotBlocksStyleXMessage destructured `.model` only — dropped ALL child commands. Leave stuck LeaveStart; backdrop has no OnClick while isLeaving → dead page. Model preservation kept broken state across reloads.
- Fix bfcbfd9d: map child commands + restore isAnimated:true. Verified TW+SX fast/slow: stuck=false. No foldkit bug — no upstream PR needed.
- foldkit work branch: devin/listbox-select-leave-freeze + f63 repro page exist if ever needed. Debug patches remain in node_modules dists (harmless). Probes: scripts/*.tmp.cjs.
