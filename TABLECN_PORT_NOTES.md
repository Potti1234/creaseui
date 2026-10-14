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
