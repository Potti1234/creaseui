# Executable tutorial for a consumer design system

Date: 2026-10-15. Status: tutorial implementation specification.

First local checkpoint: issue list and quick editing, Tailwind, light theme close
to Linear, desktop first, English and a small software/product team. Crease Tasks
is the accepted working name. The sibling creaseui-demo prototype is pinned to
reviewed PR 28 commit 244b4c79cf901a28f7e2e8d57a9b4dd59aaee390. Review and iterate
on this one slice before building the wider product or freezing tutorial branches.
See [first-slice handoff](linear-first-slice-implementation-brief.md).

The first slice has a known architectural failure: component styling was placed
in global CSS and available foundations, including Sidebar, were rebuilt. Follow
the [architecture repair plan](tutorial-architecture-enforcement-plan.md) before
using that source as a teaching checkpoint. Component implementation permissions
must retain authoring checks; feature-only lint is insufficient.

Build a real task-management frontend as the executable companion to the
[guide series](design-system-guide-series-plan.md), in a separate application Git
repository with a runnable branch for each taught version. Use Linear as the
confirmed reference for clean presentation, consistency, usability and interaction
details. Tailwind is the confirmed first renderer. Persist realistic sample data
on the client; no backend is required.

The [discovery and repository plan](tutorial-product-discovery-and-repository-plan.md)
records confirmed answers and the remaining decisions. The
[Linear research](linear-task-manager-design-research.md) connects documented
patterns to product proposals and verification. The user will create the
application repository named creaseui-demo. Its visible product name, remote URL
and remaining review/device choices are recorded in the discovery brief.

Use real registry-installed components and the packed lint package. The app
demonstrates consumer-owned source customization, AI use and continuous maintenance.
Handwritten stand-ins cannot establish that the tutorial works.

The first implementation task records the current merged compatibility baseline,
actual commands, and public APIs. Paths and consumer component names in this
specification describe the proposed tutorial project, not existing Crease exports.

## Scope and finished application

The app centers on a few coherent issue/task-management screens
and workflows. A first proposed slice is the issue list and issue detail, with
quick creation, assignment/status/priority editing, and navigation/search. Personal
work, a project view or board can follow within the agreed scope. These concrete
screens are proposals for the brief, not a requirement to reproduce all of Linear.

Use realistic task data and long-content variants, explicit browser persistence,
a schema/seed version and a reset path. Keep loading/failure simulation deterministic
for teaching and tests. Do not add a backend, real authentication or an external API
as a prerequisite. The actual frontend must perform the promised local operations.

Every visible control in the accepted scope must work against the same persisted
dataset. List, detail, search results and any approved board/personal views must
agree after edits and refresh. A reset is a deliberate demo utility, not a
substitute for persistence or working task flows.

## Proposed product decisions

| Decision                                                        | Consequence                                                                  | How it is checked                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| Dense issue content has clear hierarchy                         | Shared issue rows and headers own alignment, spacing and emphasis            | Pattern contract and reviewed real-content states  |
| Small issue properties edit in context                          | Approved property pickers preserve the collection position                   | Component boundary plus focus and state assertions |
| Multi-field creation has an explicit commit boundary            | Composer draft and stored issue are separate                                 | Types, state scenarios and browser interaction     |
| One primary action is allowed in a declared action group        | The action-group API controls the primary slot                               | API/contract; no whole-page primary-button ban     |
| Regular buttons have one normal height and finite named intents | Feature code does not choose arbitrary sizes or appearance                   | Public type, runtime mapping and lint              |
| Navigation does not discard the current task context            | Filters, selected issue and relevant scroll position have explicit ownership | Back/close and route scenarios                     |
| Narrow layouts retain the same task vocabulary                  | Layout changes belong to shared product patterns                             | Narrow/container and long-content fixtures         |

These choices apply to the task manager. The brief and first reviewed slice settle
their exact values and scope. Explain why different tasks use menus, inline
editing, a composer or a full detail view. Do not encode a universal no-dialog
rule or make these product choices global Crease requirements.

## Source organization

The proposed consumer layout is:

```text
creaseui-demo/
  package.json
  <selected package manager lockfile>
  tsconfig.json
  vite.config.ts
  eslint.config.js
  crease.lock.json
  AGENTS.md
  design-system/
    principles.md
    patterns.md
    changes/
    exceptions/
  src/
    design/
      <installed or directly adapted components>
      internal/
        <broader implementations when demonstrating the facade approach>
      patterns/
        page-heading.ts
        action-group.ts
        issue-row.ts
        issue-property-picker.ts
        issue-composer.ts
        issue-detail.ts
      theme/
      policy/
    features/
      issues/
      issue-detail/
    services/
      issue-store.ts
    main.ts
  tooling/
    eslint-plugin-product/
  test/
  e2e/
```

Reconcile the receipt filename with the delivered installer. The semantic policy
is consumer-authored input; installation provenance and exact ownership remain
in the existing receipt mechanism. Do not create a second ownership manifest.

The exact structure may change to match existing tooling. Preserve the separation
of feature code, system implementation, policy, and integration setup. Directory
names alone never grant raw rendering.

The separate application repository owns canonical runtime source, its local
design system, realistic sample data, policy, tests and version history. Crease
owns reusable foundation source and guide prose. Integration fixtures may clone
the app's exact reviewed revisions; they cannot replace the maintained app.

Keep common behavior and lesson data authored once in the application, with
renderer-specific implementations where needed. Start with the Tailwind product
and expand the companion tracks deliberately. A clean app clone must run without
the Crease checkout, local links, private aliases or a parent node_modules.

## Renderer tracks

Tailwind, StyleX, and Pleat tracks share:

- The product decisions, domain models, messages, services and state transitions.
- The same product-facing component and pattern vocabulary.
- Equivalent state scenarios and meaningful rendered expectations.
- The same chapter progression and complete project downloads.

Renderer-specific files cover installation/build setup, styling, token bindings,
and approved placement translation. Use the canonical tested source and dependency
delivery for that renderer, including vendored sources if that is the actual
supported installation method.

A track must build with only its own styling dependencies. Do not require a user
to install three engines, or claim identical bundles/class strings. Compare
semantic DOM, behavior, structure, accessibility, and meaningful computed styles.

## Product Button adaptation

Start with the real installed Button and retain the applicable behavior. The
consumer's regular Button exposes primary and secondary intent, with a fixed
normal height. It retains the required content, naming, disabled/loading,
event-message, and native button/submission semantics.

Remove per-call appearance inputs and regular size selection from the public API.
If the direct-edit approach removes a variant, remove its implementation branch,
runtime forwarding, exported type choice, and contract entry together.

The main tutorial follows the direct-edit approach. A focused comparison implements
a narrower public facade over an internal broader component. The facade maps
approved inputs explicitly; it does not forward arbitrary props wholesale.
Feature code cannot reach the broader implementation through another import.

Keep two deliberate failing fixtures: a fresh literal passing a removed prop,
and a variable/spread carrying it. Explain what TypeScript catches and what needs
contract lint or explicit runtime mapping. Assertions or any must not silently
establish a verified UI contract.

For Button, caller height and icon dimensions are component-owned size decisions.
Test that a Tailwind height/size utility or equivalent layoutStyle cannot override
them through a generic placement allowance. Other components can legitimately
expose different placement dimensions under their own contracts.

The later AI system-change exercise introduces ToolbarAction with a named compact
context. This is an illustrative consumer component, not an existing Crease export.
It does not restore arbitrary size selection to every regular Button.

## Product pattern responsibilities

| Proposed product pattern | Responsibility                                                         | Important boundary                                                |
| ------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| PageHeading              | Page title, description, allowed action region                         | No feature-authored heading spacing                               |
| ActionGroup              | Primary/secondary arrangement and responsive wrapping                  | Primary cardinality is local to the group                         |
| IssueRow                 | Issue identity/content, metadata, focus/selection, contextual controls | No nested conflicting interactive targets or per-call row styling |
| IssuePropertyPicker      | Approved in-context property selection and dismissal                   | Shared vocabulary and reliable focus restoration                  |
| IssueComposer            | Draft, field layout, explicit creation action and dismissal policy     | Stored issue is created only through the feature's commit path    |
| IssueDetail              | Issue content, metadata, related actions and return navigation         | Same issue data and property components as the collection         |

Use existing Crease composition components and state primitives where appropriate.
Product patterns can be stateless views, controlled helpers, or a small integration
of existing Submodels. Choose the category from actual state/lifecycle needs.
Avoid manufacturing a new stateful wrapper around every render helper.

When order is a product invariant, prefer a structured input with named regions
that the pattern assembles. If a region permits arbitrary approved Html, document
which assertions are deferred to runtime or review. A type named IssueRowChildren
does not itself prove the children conform.

## Foldkit behavior and state ownership

Keep durable values such as issues, their properties and view preferences in the
feature's parent Model. The draft, dirty state, request status, errors, and request
identity must have explicit ownership. Use the installed Foldkit/Effect schema
and message APIs rather than illustrative React-style callbacks.

Views remain pure. Event translators produce Messages. Updates transition state,
and the supported Commands/Subscriptions/services perform effects. Do not perform
persistence, async validation, or document event registration in a view.

An existing Dialog Submodel owns transient interaction according to its primitive
contract. Route child messages and OutMessages through the parent. Preserve
primitive ARIA, focus, keyboard, positioning, and dismissal attributes when styling.

The issue creation and editing workflow must define:

1. How draft fields differ from the saved baseline.
2. Which validation blocks submission and how field/storage errors are associated.
3. Whether edits remain possible during a request and what happens to the draft.
4. How request identity prevents a late response from replacing newer state.
5. How Save, Cancel, pending, failure, retry, and success interact.
6. What route changes/unmounting do to applicable subscriptions or pending work.

The property-picker and context-preservation workflow must define:

1. Triggering through pointer and keyboard, initial focus and accessible naming.
2. Selection, commit, Escape/outside dismissal and focus restoration.
3. Updating list, detail and other visible projections from one canonical issue.
4. Retaining filtering, grouping, relevant selection and scroll through navigation.
5. Draft retention and recovery when switching views or when storage fails.

If deleting/archiving issues enters the accepted scope, define confirmation versus
undo, pending/error behavior and resulting selection. Workspace deletion is not
a required tutorial feature.

Choose exact cancellation and concurrency behavior during the implementation
brief, then demonstrate it with deterministic scenarios. Do not claim request
cancellation when the implementation only ignores a stale result.

## Chapter checkpoints

Each G01-G15 chapter has a starting and resulting checkpoint keyed to the chapter
catalog. A prose-oriented chapter may retain the same application source while
adding a policy or change artifact. Document that explicitly.

| Checkpoint stage | Required result                                                                        |
| ---------------- | -------------------------------------------------------------------------------------- |
| G01-G02          | Minimal independently installed app, complete program, strict source configuration     |
| G03-G04          | Product principles, theme and theme-state preview                                      |
| G05-G06          | Adapted Button, local contract, scoped implementation access, deliberate lint failures |
| G07-G08          | Issue collection/detail patterns, creation, in-context edits and persistence           |
| G09              | Complete declared verification workflow and meaningful broken counterparts             |
| G10-G11          | Consumer policy configuration and local custom rule plugin                             |
| G12-G13          | Scoped AI feature task and separately authorized system change                         |
| G14              | Actual API migration and bounded exception exercise                                    |
| G15              | Upstream update rehearsal and installation into a second consumer                      |

Maintain cumulative version branches in the separate app repository. The proposed
names are tutorial/v01 through tutorial/v15, subject to the user's choice of chapter
versus product-milestone granularity. Every taught version has a runnable branch;
an exact accepted commit and revision tag pin the source used by the docs.

Use the shared version index defined in the discovery/repository plan. Downloads
and temporary test projects derive from these actual revisions. Generators may
prepare derived artifacts, but a tarball or disposable fixture does not satisfy
the separate-repository/version-branch requirement. Verify clean clones with each
version's real lockfile and dependency baseline.

Every download includes all required runtime, configuration, stylesheet, and test
files. No unpublished branch name, local absolute path, parent node_modules, or
live development server may be necessary.

## Displayed code and previews

Generate code disclosures from the verified checkpoint source, with an explicit
file map. Excerpts used in prose must map to that source through maintained ranges
or identifiers. Avoid separate hand-authored examples that drift.

Resolve the source from the separate application's accepted tag/commit, and show
the matching branch, predecessor diff and runnable instructions. Prepare/cache
source artifacts through verified tooling rather than reading a developer's
mutable local checkout during a docs build.

The Button chapter includes a complete Foldkit program. Stateful chapters include
their full Model, Message, init, update, services/effects, subscriptions and runtime
entry files, with file navigation when too large for one pane.

All renderer sites use the existing code viewer, syntax highlighting, copy behavior,
source download, and code presentation style. Link a live isolated preview to its
chapter/checkpoint. Scope its model and messages so another preview cannot mutate
it. Avoid embedding a second unrelated demonstration state machine in the docs.

## Verification contract

Each meaningful claim maps to an executable assertion or a clearly named review
decision. A list of evaluation task strings is an inventory, not execution proof.

| Area          | Positive proof                                                        | Deliberate negative or failure path                           |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| Installation  | Real registry installation and packed lint package load               | Missing dependency/alias or wrong scope produces a diagnostic |
| Composition   | Approved layout, text, field and controls                             | Raw ordinary layout/text/control fails                        |
| Customization | Edited Button and new approved pattern pass                           | Removed prop/variant or forbidden size override fails         |
| Ownership     | Exact implementation can compose primitives                           | Neighboring feature or barrel to internals fails              |
| Rules         | Custom rule finds actual component symbols                            | Shadowed names and non-UI business objects remain valid       |
| Saving        | Valid save updates the saved baseline                                 | Invalid input, service failure and stale response are handled |
| Context       | Property edits and detail navigation preserve the relevant collection | Lost focus, stale detail or discarded draft is detected       |
| Accessibility | Naming, associations, keyboard, focus and applicable contrast         | Broken label or focus assertion actually fails                |
| Rendering     | Readable narrow layout and owned overflow                             | Oversized field/table or clipped overlay is detected          |
| Maintenance   | Local API survives upstream repair                                    | Restored removed prop or overwritten local policy is detected |

Run strict source lint and typecheck in the normal chapter workflow. Run behavior
checks at the chapters introducing behavior and the series release gate. Use the
project's supported browser matrix for release verification, with light/dark and
representative mobile/desktop widths plus applicable RTL/reduced motion.

Use actual computed styles and reviewed screenshots for the chosen representative
states. Do not auto-accept visual diffs or require all three engines to emit the
same classes. Class changes without semantic/rendered changes are not design drift.

Deliberately invalid source lives in isolated negative fixtures excluded from the
normal application through explicit test configuration. The negative harness must
assert the intended diagnostic/rule, not only that some error happened.

No new broad warning budget, skipped renderer, swallowed exception, or handmade
Button makes an unfinished checkpoint pass. Source-only lint and custom rule use
must remain independent of Playwright or a running browser.

## Maintenance exercises

Use actual, reproducible changes:

- Add a priority filter through an AI feature task using the existing pattern.
- Authorize a compact toolbar action through an AI system-change task.
- Remove a deprecated choice; migrate callers and update guidance/metadata.
- Integrate a real upstream fix against a pinned earlier base while retaining the
  local two-intent/fixed-height Button API.

Choose an upstream revision pair during implementation, record source provenance,
and make the exercise deterministic. A fabricated upstream diff can illustrate
mechanics but cannot satisfy the real-upgrade acceptance claim.

Demonstrate both local source sharing and an optional product registry/package.
If a new distribution mechanism is required, label it as a dependency until it is
implemented. Shared contracts, renderer requirements, theme setup and examples must
travel with the installed system, not rely on the demo's original directory names.

## Delivery evidence

For each checkpoint record the tested source revision, compatibility versions,
renderer, installation provenance, commands, expected negative diagnostics, and
runtime evidence. Store machine-readable results with the existing test artifacts;
keep prose concise and link to the relevant records.

For the final release, reconstruct the series as a new reader would. Follow the
published steps without local repository shortcuts, open each complete program,
run the promised commands, exercise the accepted task flows, and complete the change/upgrade
lessons. Report any unsupported capability as unfinished work rather than silently
substituting a simpler exercise.

## Essay and visual guide integration

The audience is experienced developers. Link basic setup references and keep the
main articles focused on the problem, new concepts, concrete examples and tradeoffs.
Use Matt Rothenberg's explanatory design-system essays and
[Logging Sucks](https://loggingsucks.com/) as editorial references.

Produce one pilot article alongside the first task-manager slice. Show a real
failure, its improved UI/API/contract, a meaningful visual explanation and the
working source diff. All interactive examples and annotated screenshots come
from the corresponding accepted app revision. Complete programs stay accessible
even when the article concentrates on a small decisive part of the code.
