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

### DOC-001 — Grouped definition files hide page ownership

Three alphabetical definition files currently contain about 7,700 lines and
nearly every component page. A change to one page requires navigating imports,
helpers, and state shared by dozens of unrelated components.

Resolution target: one authored module per component slug under
`src/docs/components/pages/`, with an explicit catalog registry.

### DOC-002 — Example source is reconstructed from preview syntax

`scripts/generate-doc-example-sources.mjs` parses the documentation source AST
and attempts to infer display code. This has already produced malformed imports
and allows the displayed preview and copyable code to drift apart.

Resolution target: delete the inference pipeline. Each example owns explicit,
reviewable application source next to its preview.

### DOC-003 — Most snippets are fragments, not runnable Foldkit programs

Many examples contain one expression, an ellipsis, or prose. They omit Model,
Message, init, update, subscriptions, view, and runtime wiring, so copying the
snippet cannot reproduce the preview.

Resolution target: every example exposes a complete application module and the
test suite rejects fragment-only source.

### DOC-004 — A generic complete-example wrapper invents unrelated behavior

The current `completeExample` helper wraps a view fragment in an `exampleRuns`
counter regardless of what the component does. Stateful components therefore do
not demonstrate their actual child Model, Message, Commands, or OutMessage.

Resolution target: shared example primitives may format common Foldkit sections,
but component pages must author their real state and update integration.

### DOC-005 — Shared catalog state couples unrelated pages

Every shared page allocates the large `catalog-state` model, including state for
components that are not on the active route. This obscures ownership, increases
patch cost, and makes examples less representative of consumer applications.

Resolution target: each component documentation page owns only the state and
messages used by its examples.

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

### DOC-013 — Lifecycle-complete examples can still depend on missing locals

The first authored-page contract verifies Model, Message, init, update, view,
subscriptions, and runtime sections, but it does not prove that identifiers used
inside the view are declared. The Table and horizontal Scroll Area applications
both passed that contract while referring to demo collections that were absent
from the copyable module.

Resolution target: keep example data inside the complete module (or explicitly
support declarations in the source formatter), repair every discovered missing
identifier, and add compile-oriented source verification before closing DOC-003.

## Closed problems

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
