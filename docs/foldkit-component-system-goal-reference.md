# Foldkit component-system migration reference

Status: implementation handoff  
Reference implementation: Accordion  
Registry inventory: 65 UI artifacts  
Compatibility baseline at the time of writing: Foldkit `0.148.2`, `@foldkit/ui` `0.148.2`, Effect `4.0.0-rc.109`, Foldkit Vite plugin `0.16.1`, StyleX `^0.19.0`

## Copy-ready goal assignment

> Convert all Crease UI registry artifacts to the Foldkit-native component-system forms defined in this document. Use Accordion as the reference vertical slice. Work one bounded component at a time, preserve unrelated worktree changes, and complete behavior, both skins, documentation, registry distribution, tests, accessibility, and browser verification before moving to the next component. Do not reproduce React component APIs mechanically. Keep application domain values in the parent Model, reusable interaction state in Schema-defined child Models, and per-render content in typed view inputs. Stateful views must be branded with `defineView`, embedded with `h.submodel`, and delegated through the supported child-update API. Tailwind and StyleX must import one shared behavior implementation; neither skin may own a duplicate state machine. Do not weaken architecture, accessibility, or StyleX boundary tests to make a migration pass. Continue through the ordered inventory below until all 65 artifacts satisfy their target form or a documented stop condition requires a maintainer decision.

## Intended outcome

Crease UI should not imitate React's idea that every named component is an isolated stateful object. Foldkit's useful unit is an explicit architecture bundle:

```text
parent domain Model and update
  -> controlled helper, interaction Submodel, lifecycle adapter, or feature recipe
    -> @foldkit/ui behavior primitive where one exists
      -> semantic slots and states
        -> Tailwind renderer or StyleX renderer
```

The component name is a distribution and documentation boundary. Its implementation form must follow the state and lifecycle it actually owns.

Success means:

- stateless artifacts remain small render helpers;
- durable values remain parent-owned;
- reusable interaction state becomes a real Foldkit Submodel;
- imperative browser or third-party resources use Foldkit lifecycle facilities;
- domain-adjacent assemblies are honestly distributed as recipes;
- Tailwind and StyleX share behavior and accessibility semantics;
- installed source makes integration requirements visible;
- every stability claim is backed by tests and rendered evidence.

## Accordion: the canonical reference

Accordion establishes the implementation shape for reusable interaction components.

### Reference files

- `src/lib/accordion-state.ts`: skin-neutral `Model`, `Message`, `OutMessage`, `init`, `reflect`, and `update`.
- `src/ui/accordion.ts`: Tailwind renderer, semantic slots, controlled Disclosure composition, branded `view`, and temporary compatibility helper.
- `src/stylex/accordion.ts`: StyleX renderer importing the same state module and exposing only bounded layout overrides.
- `src/docs/components/pages/accordion.ts`: complete parent Model, `Update.foldChild`, OutMessage folding, and `h.submodel` examples.
- `test/accordion.test.ts`: state invariants and stable-value behavior.
- `scene/accordion.scene.test.ts`: rendered semantics, reordering, interaction, and renderer parity.
- `test/stylex-contract.test.ts`: enforcement that StyleX imports skin-neutral behavior and exposes no arbitrary styling escape hatch.
- `src/lib/registry.json` and `src/ui/registry.json`: separate installable state artifact and renderer dependency.

### Decisions proven by Accordion

1. Store open item values, not item positions. View order is a per-render concern.
2. Normalize invalid state in `init`, `reflect`, and `update`; single mode can never contain more than one open value.
3. The child emits `ChangedValue` with the complete next value, the toggled value, and the new open state. The parent decides what that fact means.
4. The behavior layer contains no Tailwind or StyleX imports.
5. Both renderers re-export the same behavior API and expose a branded `view` for `h.submodel`.
6. The renderer delegates ARIA, IDs, button/panel linkage, and panel animation to the controlled Foldkit Disclosure primitive.
7. Semantic identity comes from stable configured IDs and values, never array indexes or random IDs.
8. Styling affects presentation only. It does not redefine state, Messages, accessibility, or structure.
9. Compatibility exports may remain during migration, but documentation must teach the canonical Submodel path.
10. Registry installation must include every shared behavior file automatically.

### Canonical interaction Submodel API

```ts
// src/lib/<name>-state.ts
export const Model = Schema.Struct({ /* serializable interaction state */ })
export type Model = typeof Model.Type

export const Message = Schema.Union([/* internal interaction events */])
export type Message = typeof Message.Type

export const OutMessage = Schema.Union([/* parent-relevant facts */])
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<{ id: string /* true initialization only */ }>
export const init = (config: InitConfig): Model => /* normalized state */

export type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
  Option.Option<OutMessage>,
]

export const update = (model: Model, message: Message): UpdateReturn => /* pure transition */
export const reflect = (model: Model, controlledInput: unknown): Model => /* optional */
```

```ts
// src/ui/<name>.ts and src/stylex/<name>.ts
export * from '@/lib/<name>-state'

export type ViewInputs = Readonly<{
  /* per-render labels, items, content, domain values, and bounded layout inputs */
}>

export const view = defineView<Model, Message, ViewInputs>(
  (model, viewInputs, h) => /* semantic renderer */,
)
```

```ts
// parent integration
const foldChild = Update.foldChild({
  update: Child.update,
  read: (model: Model) => Option.some(model.child),
  write: (model: Model, child: Child.Model) => evo(model, { child: () => child }),
  toParentMessage: message => GotChildMessage({ message }),
  foldOutMessage,
})

h.submodel({
  slotId: model.child.id,
  model: model.child,
  view: Child.view,
  viewInputs,
  toParentMessage: message => GotChildMessage({ message }),
})
```

## Artifact decision rules

Use the first matching form.

### 1. Render helper

Use when the artifact owns no interaction state and only renders semantic HTML. Export typed configuration and `view(config, h)`. Do not create empty Models or Messages for symmetry. Examples: Card, Badge, Separator.

### 2. Controlled helper

Use when a durable value belongs to the application and the artifact only converts browser interaction into a parent Message. Accept `value` or `isChecked` and an `onChange` translator. Do not hide the committed value in a child Model. A Foldkit primitive may provide behavior without requiring a Crease-owned Submodel. Examples: Input, Checkbox, Switch, Toggle.

### 3. Interaction Submodel

Use when reusable interaction owns transient state such as overlay visibility, focus bookkeeping, active descendant, query buffer, drag position, animation phase, or dismissal timers. Put that state in a skin-neutral Schema Model and render it through a branded view. Examples: Accordion, Dialog, Combobox.

### 4. Lifecycle adapter

Use when an imperative browser or third-party runtime owns resources. Use `Mount` for DOM-bound runtimes and cleanup, Commands for finite async work, Subscriptions for continuing external event streams, and managed resources for acquired handles. Never instantiate a runtime or attach global listeners from a view. Examples: Chart, possibly Carousel.

### 5. Feature recipe

Use when the artifact combines domain-adjacent state, multiple controls, application policy, or effects. A recipe may contain several modules and must state which fields consumers replace. Do not pretend it is a universal primitive. Examples: Data Table, Sidebar, Date Picker.

### 6. Styling and support artifact

Theme, icons, tokens, and tooling do not need UI Models. Keep them declarative, generated where appropriate, and independently installable.

## State placement checklist

Before implementing a field, classify it:

| State kind | Owner | Examples |
|---|---|---|
| Durable domain value | Parent application | submitted field value, selected account, route, saved filters, chosen date |
| Reusable transient interaction | Child Submodel | open state, active item, query buffer, drag position, animation phase |
| Per-render input | `ViewInputs` | items, labels, render callbacks, current domain selection, variants, placement |
| Browser/third-party resource | Foldkit lifecycle primitive | ECharts instance, ResizeObserver, document event stream, timer |
| Pure presentation | Skin | color, border, spacing, typography, transform-only transitions |

Never copy item arrays, labels, render functions, or application records into a child Model merely to make them available to the view. Never let a parent spread or mutate fields inside a child Model.

## Shared behavior and skin contract

For every migrated artifact:

- put behavior in `src/lib/<name>-state.ts`, `src/lib/<name>-behavior.ts`, or a clearly named recipe module;
- make `src/ui/<name>.ts` and `src/stylex/<name>.ts` thin semantic renderers;
- expose the same semantic `data-slot` names in both skins;
- preserve primitive-provided ARIA, event, ID, positioning, focus, and state attributes;
- represent open, selected, active, disabled, invalid, orientation, and transition states consistently;
- keep StyleX public overrides limited to the existing constrained layout contract;
- do not expose `class`, `className`, arbitrary `style`, or unrestricted `StaticStyles` from StyleX APIs;
- use semantic tokens for color, border, radius, shadow, typography, and motion;
- animate only transform and opacity by default; direct manipulation must not animate layout properties;
- support reduced motion, dark mode, RTL where applicable, and deterministic server output.

## Required vertical-slice workflow

Complete these steps for one component before starting the next:

1. Inspect its current UI source, StyleX source, docs page, registry entry, tests, consumers, and exact installed Foldkit primitive.
2. Record its current public exports and decide its target artifact form.
3. Write the state-ownership table: parent-owned, child-owned, per-render, lifecycle-owned.
4. Define invariants, public events, OutMessages, parent entry points, semantic slots, and SSR policy.
5. Add failing behavior and architecture-contract tests.
6. Extract or implement one skin-neutral behavior layer.
7. Implement the Tailwind renderer and StyleX renderer against the same behavior.
8. Migrate all in-repository consumers to the canonical API; keep a deprecated adapter only when needed for compatibility.
9. Update the complete Foldkit documentation example, API metadata, registry dependencies, and migration notes.
10. Build the registry and verify the generated item includes all behavior and support files.
11. Run focused unit, Scene, type, lint, StyleX-boundary, browser, keyboard, accessibility, and visual checks.
12. Install the item into a clean consumer, compile it, build it, and exercise one real interaction.
13. Review the diff for generated noise and unrelated user changes.
14. Update evidence-backed quality status only after the evidence exists.

## Ordered component inventory and required form

The following tables contain every item in `src/ui/registry.json` exactly once. “Target form” is the intended architecture, not necessarily the current implementation.

### Reference slice

| Component | Target form | Required modification | Minimum evidence |
|---|---|---|---|
| Accordion | Interaction Submodel — complete reference | Keep stable value-based state in `accordion-state`; keep items and order in `ViewInputs`; share behavior across skins; use controlled Disclosure; embed with `h.submodel`; retain compatibility aliases only as deprecated migration aids. | Existing behavior tests, Scene interaction/reordering tests, StyleX boundary test, Tailwind/StyleX browser pass, registry dependency build. |

### Wave 1: foundation and forms

| Component | Target form | Required modification | Minimum evidence |
|---|---|---|---|
| Button | Render helper | Keep native button semantics and Foldkit button attributes; separate button and link APIs; define icon, loading-content, disabled, and size slots without a Model; align variants and tokens across skins. | Native disabled and keyboard activation; focus-visible; loading name stability; all variants in both skins. |
| Input | Controlled helper | Keep the string value in the parent; accept native input attributes plus typed change/input translators; preserve autocomplete, input mode, disabled, read-only, invalid, described-by, and form naming. | Typing and external value reflection; label/error linkage; autofill-safe markup; dark/high-contrast states. |
| Textarea | Controlled helper | Mirror Input ownership; keep value parent-owned; support resize policy as a finite variant; preserve native rows, form, read-only, invalid, and description semantics. | Typing, multiline submission, external reflection, disabled/read-only, overflow and resize snapshots. |
| Field | Feature composition helper | Own no submitted value. Generate deterministic label/description/error IDs and typed parts; render validation states supplied by the parent; make required structure difficult to omit. | All validation states, label and description linkage, async example with stale-result handling, both skins. |
| Form | Feature recipe | Compose fields and parent validation/update policy; preserve native form submission and browser behavior; keep async validation in Commands; expose an error-summary/focus recipe rather than hidden form state. | Native submission, async stale response, error summary focus, autofill/password-manager-compatible example. |
| Checkbox | Controlled helper | Keep checked/indeterminate value parent-owned; use the Foldkit primitive; expose typed change translation, label linkage, disabled and read-only behavior; no local durable Model. | Space toggle, indeterminate transition, form value, disabled/read-only, external reflection. |
| Switch | Controlled helper | Keep boolean state in the parent; use switch semantics rather than checkbox styling alone; standardize thumb/track slots and RTL behavior; no local durable Model. | Space/click toggle, accessible name and checked state, form behavior if supported, disabled/read-only, RTL. |
| Radio Group | Controlled helper or thin interaction Submodel after primitive audit | Keep selected domain value in the parent. If roving focus is primitive-owned, expose a controlled helper; otherwise isolate only roving-focus interaction in shared state. Bind literal/generic value types once at module scope. | Arrow-key matrix, one checked item, disabled items, external selection, form submission, RTL. |
| Dialog | Interaction Submodel | Extract open/transition/focus interaction to shared state or directly wrap the Foldkit Dialog Submodel; expose open/close entry points and typed OutMessages; provide semantic trigger/content/title/description/action parts. | Initial focus, Tab trap, Escape/outside policy, focus restore, nested dialogs, reduced motion, deterministic IDs. |
| Popover | Interaction Submodel | Share open, anchor, dismissal, and transition behavior; keep domain content in `ViewInputs`; preserve primitive positioning attributes; expose open/close and dismissal facts without leaking geometry into domain state. | Pointer/keyboard trigger, Escape/outside dismissal, focus restore, collision/viewport, nested overlay, RTL. |

### Wave 2: selection and navigation

| Component | Target form | Required modification | Minimum evidence |
|---|---|---|---|
| Select | Interaction Submodel with parent-owned selection | Bind value type once with a module-scoped factory; child owns open, highlight, typeahead, and focus; parent owns committed selection; emit `Selected` OutMessage and support external reflection. | Keyboard traversal, typeahead, disabled options, external value, form integration, RTL, both skins. |
| Combobox | Interaction Submodel with parent-owned selection/query policy | Child owns overlay, active descendant, and transient query when configured; parent owns committed selection and remote results. Put async fetching in parent Commands; keep item renderers in `ViewInputs`. | Typing, filtering, async stale results, active descendant, selection, empty/loading states, screen-reader semantics. |
| Dropdown Menu | Interaction Submodel | Extract open, active item, typeahead, and submenu routing into shared behavior; emit selected action facts; keep application consequences in parent update; use module-scoped typed item values. | Arrow/Home/End/typeahead, submenu, disabled items, Escape, outside click, focus restore, RTL. |
| Context Menu | Interaction Submodel | Reuse Menu behavior but add pointer-coordinate/open-trigger input through Messages; avoid storing domain menu items in Model; keep viewport collision in primitive/view layer. | Secondary click, keyboard context-menu key, coordinates, collision, selection, dismissal, repeated open. |
| Tabs | Controlled helper unless focus behavior requires a Submodel | Keep active tab value parent/route-owned; bind tab value type once; let the primitive own roving focus where possible; expose activation mode and orientation as finite inputs. | Arrow/Home/End, manual/automatic activation, external route change, disabled tabs, RTL, deterministic panel IDs. |
| Toggle | Controlled helper | Keep pressed value parent-owned; share Button-like visual contract; expose `aria-pressed`, disabled, size, and variant without a child Model. | Pointer/Space/Enter, external reflection, disabled, focus, both skins. |
| Toggle Group | Controlled helper or thin roving-focus Submodel | Keep selected value(s) parent-owned; isolate only roving focus if the primitive requires it; normalize single/multiple invariants and bind value types once. | Single/multiple, arrow navigation, disabled items, external changes, form policy, RTL. |
| Slider | Interaction Submodel with parent-owned committed value | Child owns drag/keyboard interaction and temporary pointer state; parent owns committed value or receives continuous value facts by explicit policy; normalize min/max/step and orientation. | Mouse/touch/keyboard, cancellation, min/max/step, multiple thumbs, RTL, accessible value text, no layout animation. |
| Command | Feature recipe | Separate reusable listbox/search behavior from application command data and actions; keep query/results policy explicit; use typed action OutMessages; compose Input, list, empty, and optional Dialog/Popover. | Query, active descendant, keyboard selection, empty/loading, large list behavior, overlay and standalone recipes. |
| Navigation Menu | Feature recipe over controlled navigation helpers | Keep route/current item in the parent; isolate only transient open/focus state; provide typed semantic parts and responsive fallback; document deliberate differences from Radix/shadcn behavior. | Keyboard navigation, pointer intent, focus restore, route changes, responsive/mobile, RTL, overflow. |
| Menubar | Interaction Submodel | Implement shared roving focus, menu switching, submenu, typeahead, and dismissal; actions leave as OutMessages; bind menu/item types once and preserve native shortcuts in labels only. | Left/right and submenu keys, typeahead, disabled items, Escape, focus restoration, RTL. |
| Pagination | Controlled navigation recipe | Keep page/cursor and URL in parent state; render links when navigation is addressable and buttons when it is an in-place action; expose finite sibling/boundary configuration. | Link semantics, current-page announcement, disabled boundaries, small viewport truncation, keyboard focus. |
| Breadcrumb | Render/composition helper | Render semantic navigation and ordered list; keep route data per-render; expose typed item/separator/ellipsis parts; never invent navigation state. | Accessible nav label, current page semantics, overflow/ellipsis, long labels, RTL separator. |

### Wave 3: feedback, motion, and overlays

| Component | Target form | Required modification | Minimum evidence |
|---|---|---|---|
| Alert | Render helper | Keep severity and content per-render; map variants to semantic tokens and optional live-region policy; require consumers to choose whether an alert is static status or announced. | Role/status policy, icon/title/description alignment, long content, all severities, both skins. |
| Alert Dialog | Interaction Submodel | Reuse Dialog behavior but enforce required title/description and explicit cancel/confirm facts; parent owns destructive action and async consequence; prevent accidental outside dismissal when policy requires. | Initial focus on safe action, Escape policy, confirm/cancel OutMessages, focus restore, async pending example. |
| Toast | Feature recipe backed by notification Submodel | Replace imperative/global patterns with a normal child Model and explicit add/update/dismiss entry points; use Command timers with IDs so stale completions are ignored; define live-region priority. | Multiple toasts, timed/manual dismissal, stale timer, action, pause policy, live announcements, reduced motion. |
| Sonner | Feature recipe or compatibility skin over the notification Submodel | Do not maintain a second notification state machine. Map Sonner-style configuration onto the canonical toast behavior and semantic slots; document unsupported imperative React conventions. | Behavior identity with Toast, stacking, promise/async recipe, live region, both skins, migration example. |
| Tooltip | Interaction Submodel | Share open delay, close delay, pointer/focus ownership, and stale-timer protection; timers must be Commands; content remains per-render; preserve trigger description semantics. | Hover and focus, delay races, Escape, disabled trigger policy, touch behavior, reduced motion, multiple instances. |
| Hover Card | Interaction Submodel | Share hover/focus delay and stale-completion behavior; keep richer nonessential content per-render; do not trap focus or masquerade as a Dialog. | Pointer enter/leave races, focus behavior, Escape/outside policy, collision, touch fallback, reduced motion. |
| Sheet | Dialog behavior with a distinct skin | Import the canonical Dialog state and focus behavior; add side/size variants only in view inputs and tokens; avoid duplicating overlay logic. | Behavior identity with Dialog, all sides, focus matrix, mobile viewport, reduced motion, both skins. |
| Drawer | Interaction Submodel, optionally sharing Dialog overlay behavior | Share overlay/focus/dismissal behavior and isolate drag progress/velocity as transient child state; keep snap policy finite; never animate layout during drag. | Touch/mouse drag, threshold and cancellation, Escape, focus restore, mobile viewport, reduced motion. |
| Collapsible | Controlled helper | Keep open value parent-owned unless an animation phase genuinely needs a child; use controlled Disclosure; expose trigger/content semantic parts and deterministic IDs. | Button-panel linkage, keyboard toggle, external open change, disabled, interrupted/reduced motion. |
| Progress | Render helper | Accept bounded current/max or indeterminate state; normalize ARIA values and expose accessible label/value text; style via semantic tokens without a Model. | Determinate bounds, indeterminate semantics, contrast, reduced motion, narrow widths. |
| Skeleton | Render helper | Keep purely presentational; require nearby accessible loading context rather than announcing each skeleton; use a finite shape/size vocabulary and reduced-motion-safe animation. | Hidden decorative semantics, loading-context example, reduced motion, responsive containment. |
| Spinner | Render helper | Keep purely presentational; require accessible labeling through the surrounding status or an explicit label; use finite size and tone tokens. | Status naming, decorative mode, reduced motion, contrast, inline alignment. |
| Empty | Feature composition helper | Compose icon, title, description, and actions with no internal state; document when to use empty, no-results, error, or permission-denied content; actions remain parent Messages. | Heading structure, action focus order, responsive text, long content, both skins. |
| Message | Feature composition helper | Keep message data and delivery status parent-owned; expose semantic author/content/metadata/action parts; remove any Message type that does not represent reusable interaction state. | Long content, status announcements, action keyboard use, inbound/outbound variants, responsive containment. |

### Wave 4: data, layout, and lifecycle

| Component | Target form | Required modification | Minimum evidence |
|---|---|---|---|
| Table | Render/composition helper | Own no row state; expose semantic table/header/body/row/cell/caption helpers and responsive containment; preserve native table markup. | Screen-reader table structure, captions/headers, overflow, dense and empty states, both skins. |
| Data Table | Feature recipe | Keep records, server queries, filters, sorting policy, pagination policy, and selection in the feature/parent Model; reuse the shared TanStack state adapter only for deterministic table mechanics; compose Table and controls. | Sorting/filtering/pagination/selection, external/server updates, large data performance, clean recipe installation. |
| Chart | Lifecycle adapter | Mount ECharts through Foldkit `Mount`, update through explicit lifecycle messages/configuration, and dispose reliably; keep data/config serializable where stored; provide an accessible table or summary. | Mount/update/dispose, resize cleanup, empty/error/loading, keyboard tooltip policy, accessible data alternative, SSR fallback. |
| Carousel | Lifecycle adapter or interaction Submodel—choose one | If Embla owns mechanics, wrap it exclusively as a mounted resource with cleanup. If Crease owns mechanics, remove Embla ownership and use a pure Submodel. Parent owns slide data; view inputs carry slide renderers. | Prev/next bounds, keyboard, touch, autoplay timer policy, cleanup, reduced motion, SSR, multiple instances. |
| Calendar | Interaction Submodel with parent-owned selected date | Child owns displayed month, focus grid, and navigation; parent owns committed date/range; use a typed date representation and explicit locale/time-zone policy. | Grid keyboard matrix, month navigation, disabled dates, external selection, locale, range, RTL. |
| Date Picker | Feature recipe | Compose controlled date value, Calendar Submodel, Input/Button, and Popover/Dialog; parent owns committed date and parsing policy; distinguish transient displayed month/query from domain value. | Typing and calendar selection, parsing errors, external update, locale/time zone, mobile dialog path, form submission. |
| Resizable | Interaction Submodel | Keep panel proportions and drag/keyboard interaction in shared state when reusable; normalize totals/min/max in one update path; expose orientation and deterministic handle IDs. | Pointer/touch/keyboard, cancellation, total invariant, min/max, RTL, cleanup, no layout animation during drag. |
| Scroll Area | Native render helper by default | Prefer native overflow and scrollbar styling. Introduce a lifecycle adapter only for measured custom-scroll requirements; never mirror scroll position into a Model on every frame without need. | Keyboard/native scrolling, touch, nested areas, RTL, high contrast, performance, SSR. |
| Sidebar | Feature recipe | Treat responsive navigation, persistence, route state, and application layout as a recipe; extract only reusable sidebar interaction state; use flags for initialization and Commands for persistence writes. | Desktop/mobile transitions, persistence, route focus, overlay dismissal, keyboard, SSR initialization, clean recipe install. |
| Message Scroller | Lifecycle adapter plus controlled data | Parent owns messages; adapter owns DOM observation and scroll-follow policy through Mount/Subscriptions; distinguish user-scrolled-away state from new-message facts; clean up observers. | Initial scroll, append, user interruption, resume, resize, cleanup, large history performance, reduced motion. |
| Aspect Ratio | Render helper | Use deterministic CSS ratio with typed finite or numeric ratio input; own no Model; preserve child semantics and containment. | Ratio accuracy, responsive resize, media content, overflow, SSR. |
| Avatar | Render helper or tiny interaction Submodel after audit | Prefer native image/fallback events translated to parent Messages. Use a child Model only if load/error transition state must be reusable and observable; deterministic initials and IDs only. | Success/error/fallback, slow load, accessible name, decorative mode, image sizing, SSR. |

### Wave 5: presentational and compound helpers

| Component | Target form | Required modification | Minimum evidence |
|---|---|---|---|
| Card | Render/composition helper | Expose semantic header/title/description/content/footer/action parts; no Model; keep structure flexible without raw styling escape hatches in StyleX. | Heading/action order, long content, responsive containment, interactive-card guidance, both skins. |
| Badge | Render helper | Keep variants finite; distinguish status text from interactive controls and links; no Model. | Contrast, compact/long text, icon alignment, link/badge semantic examples. |
| Item | Render/composition helper | Provide media/content/title/description/actions parts and finite density/alignment variants; keep actions as real controls and avoid whole-row ambiguity. | Focus order, truncation, multi-action rows, responsive stacking, both skins. |
| Attachment | Render/composition helper | Keep file metadata and upload state parent-owned; render name, type, size, progress/status, preview, and actions semantically; do not hide upload effects. | Long names, progress/error/complete, remove/download actions, keyboard and screen-reader labels. |
| Bubble | Render/composition helper | Keep content and conversational ownership parent-owned; expose side/tone/tail metadata as finite presentation inputs; no Model. | Long/unbroken text, RTL, grouping, contrast, responsive width. |
| Kbd | Render helper | Render keyboard input semantics with platform-aware display supplied by the caller; no keyboard listener or state; support shortcut groups compositionally. | Screen-reader text, multi-key shortcuts, wrapping, contrast, platform examples. |
| Label | Render helper | Preserve native `for` linkage and optional required/disabled presentation; do not invent field state; align with Field deterministic IDs. | Click-to-focus, required text, disabled styling, nested-control misuse guard. |
| Marker | Render helper | Define its semantic purpose explicitly—visual marker, status, or annotation—and choose markup accordingly; keep tone/size finite and no Model. | Accessible naming/decorative mode, contrast, inline alignment, long adjacent text. |
| Native Select | Controlled helper | Keep selected value parent-owned and preserve the native select element, options, form name, disabled/read-only policy, and platform behavior; style only the wrapper/indicator. | Keyboard/native picker, form submission, external reflection, disabled options, mobile behavior. |
| Separator | Render helper | Preserve decorative versus semantic separator roles; expose orientation as a finite input; no Model. | Horizontal/vertical role, decorative hiding, contrast, sizing. |
| Typography | Helper set or recipe, not one component | Publish semantic text/heading/prose helpers and editorial recipes; avoid pretending Typography has one stateful API; keep element choice closed and hierarchy the caller's responsibility. | Heading hierarchy examples, prose elements, links/code/lists, responsive scale, both skins. |
| Button Group | Render/composition helper | Compose Buttons with group orientation, adjacency, labels, and separators; do not own pressed values; distinguish visual grouping from toolbar/radio semantics. | Focus order, disabled members, toolbar labeling where used, wrapping/overflow, RTL. |
| Input Group | Render/composition helper | Compose Input with prefix/suffix/buttons while preserving one accessible field name and correct focus behavior; field value remains parent-owned; prevent decorative adornments from becoming noisy. | Label/error linkage, prefix/suffix, embedded action, disabled/read-only, narrow width. |
| Input OTP | Controlled helper, optionally with transient focus Submodel | Keep OTP string parent-owned; isolate only slot focus/paste interaction if the primitive does not own it; preserve autocomplete and password-manager behavior; never log the value. | Typing, paste, backspace/arrows, external reset, autocomplete, invalid/disabled, privacy review. |
| Direction | Render/context helper | Supply explicit LTR/RTL attributes or typed direction inputs without hidden global mutable state; allow direction to be application- or subtree-owned. | Nested direction, directional icons, selection/navigation arrow behavior, SSR consistency. |

## Cross-component dependency rules

Migrate dependencies before dependents when an API change would otherwise be repeated:

```text
Button -> Button Group, Input Group, Dialog actions, Date Picker
Input + Label -> Field -> Form and Input Group
Dialog behavior -> Alert Dialog, Sheet, mobile Date Picker
Popover behavior -> Combobox, Date Picker, Hover Card where applicable
Menu behavior -> Dropdown Menu -> Context Menu and Menubar
Table helper -> Data Table recipe
Calendar -> Date Picker recipe
Toast state -> Sonner compatibility recipe
Accordion behavior pattern -> Collapsible and other Disclosure-based artifacts
```

Do not add a registry dependency merely because a source file imports a demo or docs helper. Registry dependencies must represent installed runtime source requirements only.

## Required test matrices

### Every artifact

- public API typecheck against the pinned compatibility baseline;
- Tailwind and StyleX semantic slot/state parity;
- deterministic IDs and SSR classification;
- disabled, focus-visible, dark mode, reduced motion, and RTL where applicable;
- registry build and clean-consumer install;
- complete documentation example compilation;
- no arbitrary StyleX visual escape hatch;
- no duplicated behavior import from `@/ui` into `src/stylex`.

### Interaction Submodels

- `init` normalization and update invariants;
- irrelevant/stale Message behavior;
- parent entry points and external reflection;
- exhaustive OutMessage contents;
- `h.submodel` identity and multiple-instance isolation;
- pointer and keyboard behavior;
- interrupted animation and reduced motion;
- Commands, Subscriptions, and cleanup where applicable.

### Overlays

- pointer and keyboard trigger;
- initial focus, Tab/Shift+Tab, Escape, outside interaction policy, and focus restoration;
- nested/repeated overlays and multiple instances;
- viewport collision, mobile viewport, scroll lock, and virtual keyboard;
- animation and reduced motion.

### Selection controls

- controlled empty/preselected/external values;
- disabled control and items;
- arrow/Home/End/Page navigation where applicable;
- wrapping, typeahead, duplicate labels, unique values, and multiple selection;
- form submission, read-only policy, and RTL directional keys.

### Lifecycle adapters

- acquire, update, and release;
- cleanup after unmount and interruption;
- no resource creation in view;
- SSR fallback and hydration behavior;
- resize/observer/subscription cleanup;
- multiple-instance isolation and performance evidence.

## Verification commands

Run focused commands while iterating and the complete supported suite at wave boundaries:

```sh
npm run docs:encoding
npm run docs:metadata
npm run icons:adapters
npm run parity:check
npm run lint:composition
npm run lint:stylex-templates
npm run lint:stylex-contracts
npm run lint:stylex-governance
npm run stylex:adoption
npm run lint
npm run typecheck
npm run test:unit
npm run test:scene
npm run registry:build
npm run test:registry
npm run build
npm run test:e2e
```

Do not regenerate a failing fixture until the diff has been inspected and the source of truth is known. Do not weaken a contract test because a current implementation violates the architecture.

## Definition of done for one component

A component is complete only when all applicable boxes are true:

- [ ] Target artifact form is explicit and justified.
- [ ] Parent, child, per-render, lifecycle, and skin-owned state are documented.
- [ ] Public API follows that form and has a migration path.
- [ ] Behavior is shared by Tailwind and StyleX.
- [ ] Semantic slots, states, IDs, and primitive attributes match across skins.
- [ ] Effects and resources use the correct Foldkit lifecycle mechanism.
- [ ] Complete parent integration example compiles.
- [ ] Focused unit and Scene tests pass.
- [ ] Keyboard and accessibility behavior is rendered and verified.
- [ ] Dark, RTL, reduced-motion, responsive, and relevant interaction states have visual evidence.
- [ ] Registry output includes every required source file and dependency.
- [ ] A clean consumer installs, typechecks, builds, and exercises the artifact.
- [ ] SSR policy and intentional differences are documented.
- [ ] Quality metadata links to actual evidence.
- [ ] Unrelated worktree changes remain untouched.

## Goal-agent reporting format

After each component, report:

```md
## <Component> completion report

Target form:
Compatibility baseline:

State ownership:
- Parent:
- Child:
- Per-render:
- Lifecycle:

Public API changes:
Migration/compatibility:
Semantic slots and states:

Evidence:
- Typecheck:
- Unit:
- Scene:
- Browser/keyboard:
- Accessibility:
- Visual states:
- Registry build:
- Clean consumer:
- Production build:

Intentional differences:
Known limitations:
Files changed:
Next component:
```

## Stop conditions

Stop the current component and request a maintainer decision when:

- the pinned Foldkit version lacks the required primitive or its actual source contradicts this reference;
- it is ambiguous whether a value is domain-owned or reusable interaction state;
- shadcn behavior conflicts with platform or Foldkit accessibility behavior;
- a component must change from helper to recipe or from pure Submodel to third-party lifecycle ownership;
- a public breaking change has no safe migration path;
- clean installation would require overwriting consumer-owned source;
- exact upstream or compatibility information is unavailable;
- an unrelated dirty-worktree change overlaps the required edit.

When stopped, provide the exact evidence, viable options, consequences, and recommended decision. Do not improvise a hidden state owner, opaque runtime, or React-shaped workaround.

