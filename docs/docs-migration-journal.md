# Documentation migration journal

This journal tracks problems discovered while moving every component route to an
individually authored Foldkit documentation page. An item is closed only after
the implementation and an automated contract agree.

## Scope

- 65 component routes.
- 420 live examples at the start of the migration.
- Shared presentation primitives remain reusable.
- Page content, preview composition, and runnable application source belong to
  the individual component page module.

## Open problems

### DOC-005 — Shared catalog state couples unrelated pages

Every shared page allocates the large `catalog-state` model, including state for
components that are not on the active route. This obscures ownership, increases
patch cost, and makes examples less representative of consumer applications.

Resolution target: each component documentation page owns only the state and
messages used by its examples.

Browser verification now shows the cost directly: each example receives a full
copy of the catalog model, and fresh authored routes trigger Foldkit slow-patch
warnings around 60 ms while logging enormous duplicated model payloads.

### DOC-006 — Registry state labels and docs architecture can disagree

Registry metadata classifies the source file mechanically. Toast is labeled
stateless even though it re-exports the stateful Sonner Model/update API. Recipes
also need a category distinct from helper/submodel.

Resolution target: define one canonical documentation kind contract and verify
registry-facing descriptions against intentional recipe aliases.

### DOC-007 — API signatures lack member-level explanations

Generated API rows expose declaration signatures, but configuration fields,
defaults, return tuples, styling hooks, and output semantics are often only
discoverable by reading source.

Resolution target: authored page sections explain integration and important
fields; generated declarations remain a supplement, not the primary teaching
surface.

### DOC-008 — Page completeness is measured by example count

Coverage currently accepts a page when it has two examples, regardless of
whether their source is executable, their preview is distinct, or the important
states and accessibility behavior are documented.

Resolution target: validate authored ownership, complete application sections,
unique example intent, architecture kind, accessibility content, and reference
links.

### DOC-009 — Canonical Foldkit source is not vendored

The Foldkit skill expects `repos/foldkit/` as the canonical local reference, but
this repository does not currently contain it. The installed pinned packages
remain available for API verification, but examples cannot be compared against
the full framework applications offline.

Resolution target: use the pinned package source during this migration and decide
whether the Foldkit subtree belongs in this repository without silently adding a
large unrelated vendor commit.

### DOC-010 — Browser suite has unrelated concurrency flakiness

The full Playwright suite can fail under eight-worker parallelism through route
or interaction timing, while serial documentation runs pass. The mobile Create
icon picker also failed once independently of documentation changes.

Resolution target: keep a deterministic documentation matrix and separately
identify whether shared runtime state or test assumptions cause parallel flakes.

## Closed problems

### DOC-001 — Grouped definition files hid page ownership

Closed in `0f4e857`: all 65 routes are registered from individual authored page
modules, and the three 7,700-line grouped definition files were deleted.

### DOC-002 — Example source was reconstructed from preview syntax

Closed in `0f4e857`: the AST inference script and generated source registry were
deleted. Every authored example now owns explicit source beside its preview.

### DOC-003 / DOC-013 — Displayed applications were not proven runnable

Closed by the copyable-application compiler contract. All 130 displayed modules
are compiled together with the repository tsconfig and real Foldkit/Crease UI
sources. The first run caught invalid Menubar generic inference and an obsolete
Sidebar subscription shape; both were repaired before the contract passed.

### DOC-004 — Generic example wrapping invented unrelated behavior

Closed in `0f4e857`: `complete-example.ts` was deleted. Shared helpers format the
application boundary only; each component page authors its actual Model,
Message, update, subscriptions, view, and runtime content.

### DOC-021 — Repeated Date Picker examples shared nested popover ids

Closed in the authored Calendar and Date Picker slice: `withExampleIds` changed
the Date Picker root and nested Calendar ids but left its nested Popover and
animation ids unchanged. Rendering two examples therefore produced duplicate
trigger ids and ambiguous ARIA relationships. The example-local identity pass
now updates every nested child id; desktop and mobile Playwright coverage opens
the picker, selects a date, and confirms the parent-owned value changes.

### DOC-011 — Generated source silently overrides authored source

Closed in `92ce514`: the catalog bypasses legacy generated source for every
registered authored page. Unit tests inspect complete lifecycle sections and
Playwright verifies the expanded application source in the rendered page.

### DOC-012 — Inert examples still need a closed Message boundary

Closed in `dfd31b4`: `staticComponentApplication` emits an explicit NoOp schema
and identity update, while `statelessComponentApplication` uses a real click
Message for interactive controls.

### DOC-014 — Form control IDs could not be applied to Input

Closed in the authored Form slice: Input now exposes `describedBy`, the complete
Form applications connect description and error IDs, generated API metadata is
updated, and Playwright verifies the rendered `aria-describedby` relationship.

### DOC-015 — Alert Dialog actions could not report confirmation

Closed in the authored Alert Dialog slice: `onAction` lets the primary action
emit a domain Message instead of silently reusing cancel behavior. The parent
branch updates domain state, calls `AlertDialog.close`, maps focus/animation
Commands, and Playwright verifies the status change, closure, and focus return.

### DOC-016 — Anchored overlays escape their example article in the DOM

Closed in the authored Popover slice: Foldkit's anchor layer portals the
positioned panel outside the documentation example article. The first browser
contract incorrectly searched inside that article even though the accessibility
snapshot proved the panel was open. The contract now scopes the trigger and
source to the example, but locates the portalled panel at page level; desktop
and mobile runs verify visibility, Escape dismissal, and focus restoration.

### DOC-017 — Optional example configuration was authored as explicit undefined

Closed in the authored Command slice: the first preview returned
`shortcut: string | undefined`, which violates the repository's exact optional
property contract and would teach consumers the wrong construction. Both the
live preview and complete application now conditionally spread the shortcut
field only when it exists. Typecheck protects the preview; compile-oriented
example verification remains part of DOC-003's final closure.

### DOC-018 — Context-opened menus ignored Escape on their trigger

Closed in the authored Context Menu slice: a secondary click opened the menu
while focus remained on its trigger, but the trigger's key handler accepted only
ArrowDown, Enter, and Space. Escape therefore could not dismiss the visible
menu until focus was moved manually. The trigger now delegates every recognized
open-menu key through the same `menuKey` state machine and also accepts ArrowUp
as an opening key. Desktop and mobile browser tests exercise immediate Escape
dismissal after a secondary click.

### DOC-019 — Standalone route precedence hid an authored page

Closed in the authored Accordion slice: Accordion and Calendar were hard-coded
to legacy standalone page models before the catalog was consulted. Registering
an authored Accordion definition therefore passed unit contracts but could not
change the rendered route. Page initialization now gives explicitly authored
pages precedence while retaining standalone fallbacks until their migrations
land. Playwright verifies the authored example id and its single-open behavior.

### DOC-020 — A shared docs primitive erased recipe identity

Closed in the Sonner/Toast slice: the first shared notification definition
hard-coded `submodel`, causing Toast to contradict its intentional registry
classification as a recipe alias over Sonner. The reusable definition now takes
an explicit kind; Sonner owns the submodel while Toast documents the compatible
recipe surface. The architecture-kind unit contract caught the regression.

### DOC-022 — Partial legacy schemas break child-message routing

Closed in the typed preview-boundary slice: each authored page retains its exact
Model and Message schema inside a real `h.submodel` boundary. The heterogeneous
catalog transports one `RoutedDocsPreviewMessage` envelope instead of attempting
to decode a growing union of unrelated child messages. Commands and
subscriptions are lifted through the same boundary, so page-local behavior is
preserved without rebuilding a global application model.

### DOC-024 — Inactive page subscriptions read the active page model

Closed in the typed preview-boundary slice: aggregating all route-local
subscriptions initially passed the current route's example model to every page
program. Opening Dialog therefore caused Sidebar's drag subscription to read a
missing `dragState` and abort the update loop. Each lifted subscription now uses
the active model only when its owning slug matches and otherwise receives its
own inert initial model. Focused Playwright coverage exercises menus, overlays,
notifications, and Sidebar together to protect the isolation contract.

### DOC-023 — Date Picker can report an undelivered ResizeObserver loop

Open: the focused Calendar/Date Picker Playwright run passes its interaction
contracts but Vite reports `ResizeObserver loop completed with undelivered
notifications` after the portalled picker is measured. Audit the anchor-layer
measurement scheduling during the final browser pass and either remove the
feedback loop or prove that the browser notification is benign and suppress it
at the correct integration boundary rather than hiding all page errors.
