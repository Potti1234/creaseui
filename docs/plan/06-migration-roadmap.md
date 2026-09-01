# Migration roadmap

## Operating strategy

Migrate in narrow vertical slices. Each slice must include architecture, implementation,
documentation, tests, registry output, consumer installation, and visual proof. Do not
perform a broad mechanical API rewrite followed by a later testing phase.

Only one component wave should be in architectural migration at a time unless separate
owners are assigned and the shared contracts are already stable.

## Phase 0: baseline and inventory

### Goal

Create one reliable source of truth before changing public component APIs.

### Tasks

1. Select the target Foldkit, `@foldkit/ui`, Effect, and Vite plugin versions.
2. Read release notes and source differences from the current baseline.
3. Create one canonical compatibility source file.
4. Generate `compatibility.json`, package assertions, docs labels, and test fixtures from it.
5. Add CI that fails on version drift.
6. Inventory all registry items and classify each under the new taxonomy.
7. Inventory every exported Model, Message, init, update, view helper, Submodel embedding,
   factory, Command, Subscription, Mount, and browser-global access.
8. Identify Tailwind and StyleX behavioral duplication.
9. Record current public APIs and clean-consumer install outputs as migration fixtures.
10. Recalculate quality statuses using evidence-backed rules.
11. Add a generated check that assigns every registry item to exactly one migration wave.

### Required deliverables

- compatibility baseline file and generator;
- artifact inventory JSON and schema;
- architecture audit report;
- corrected quality summary;
- list of breaking baseline changes;
- frozen snapshot fixtures for current consumer APIs.

### Exit criteria

- package, compatibility metadata, prose, and examples agree;
- all 65 existing items have an artifact classification;
- every `verified` status has valid evidence;
- no new components are added during the phase.

## Phase 1: shared contracts and generators

### Goal

Build the infrastructure required to migrate components consistently.

### Tasks

1. Define artifact metadata Schema.
2. Define semantic slot and state Schema.
3. Define stability and evidence Schema.
4. Update component scaffolding to generate the correct files for each classification.
5. Add architecture contract tests.
6. Add complete-example compilation for the target Foldkit baseline.
7. Introduce canonical behavior versus skin boundaries.
8. Create Tailwind and StyleX generation or thin-adapter conventions.
9. Add `crease.json` Schema and parser.
10. Expand doctor to validate exact compatibility and aliases.

### Exit criteria

- a generated experimental render helper passes its classification contract;
- a generated experimental Submodel passes its classification contract;
- Tailwind and StyleX variants import shared behavior;
- a deliberately invalid artifact fails CI with a useful error;
- doctor detects at least version, alias, styling, and generated-output mismatches.

## Phase 2: flagship foundation wave

### Components

- Button
- Input
- Textarea
- Field
- Form
- Checkbox
- Switch
- Radio Group
- Dialog
- Popover

### Why this wave

These artifacts establish helper APIs, controlled state, validation, compound parts,
Submodel embedding, focus management, overlays, and styling contracts. Most later
components depend on these patterns.

### Component-specific outcomes

#### Button

- canonical `view` helper;
- native disabled semantics or documented primitive semantics;
- loading composition contract;
- button-link separation;
- icon slot behavior;
- all variants verified in both skins.

#### Input, Textarea, Field, Form

- connect Foldkit field-validation states to visible and semantic UI;
- generate label, description, and error IDs deterministically;
- support async validation and stale completions in examples;
- preserve native form and autofill behavior;
- remove generic layout patterns that conflict with Field composition.

#### Checkbox, Switch, Radio Group

- confirm classification against the selected Foldkit version;
- keep durable checked or selected value parent-owned;
- prove keyboard, read-only, disabled, label, and form semantics;
- provide literal-union typed examples.

#### Dialog and Popover

- expose branded views and explicit parent embedding;
- preserve Foldkit-provided native dialog, focus, backdrop, and anchor attributes;
- standardize semantic part builders;
- provide open and close entry points;
- prove focus restoration, nested behavior, animation, reduced motion, and SSR policy.

### Exit criteria

- every component in the wave reaches stable status;
- both skins pass focused visual snapshots;
- complete examples compile and run;
- clean consumer installation passes;
- architecture APIs are accepted as the template for later waves.

## Phase 3: selection and navigation wave

### Components

- Select
- Combobox
- Dropdown Menu
- Context Menu
- Tabs
- Toggle
- Toggle Group
- Slider
- Command
- Navigation Menu
- Menubar
- Pagination
- Breadcrumb

### Key work

- use module-scoped typed factories;
- separate domain selection from transient UI state;
- standardize `Selected` OutMessages;
- prove active descendant, roving focus, wrapping, typeahead, and disabled items;
- use route-driven controlled state for navigation where appropriate;
- classify Command as a feature recipe if it combines filtering, selection, and overlay
  behavior beyond one primitive;
- document intentional simplifications for complex menubar and navigation behavior.

### Exit criteria

- no selection factory is created during rendering;
- all selection examples keep committed values in the parent Model;
- keyboard matrices pass in supported browsers;
- focus and selection behavior are verified independently of visual parity.

## Phase 4: feedback, motion, and overlays wave

### Components

- Alert
- Alert Dialog
- Toast
- Sonner
- Tooltip
- Hover Card
- Sheet
- Drawer
- Collapsible
- Accordion
- Progress
- Skeleton
- Spinner
- Empty
- Message

### Key work

- model notifications as a normal child Model, not an imperative global singleton;
- use Commands for dismissal timers with stale-completion protection;
- define live-region priority and announcement behavior;
- standardize animation phases on Foldkit-native attributes;
- prove reduced-motion equivalence;
- separate Sheet visual treatment from Dialog behavior where appropriate;
- use Disclosure primitives for controlled collapsible content;
- ensure loading and empty states communicate task context.

### Exit criteria

- notification APIs are explicit update entry points;
- all timers are Commands;
- overlay focus and dismissal matrix passes;
- feedback components pass live-region and reduced-motion tests.

## Phase 5: data, layout, and lifecycle wave

### Components

- Table
- Data Table
- Chart
- Carousel
- Calendar
- Date Picker
- Resizable
- Scroll Area
- Sidebar
- Message Scroller
- Aspect Ratio
- Avatar

### Required classification decisions

- Data Table should normally be a feature recipe with application-owned row data,
  filter, sorting policy, pagination policy, and server effects.
- Chart should be a lifecycle adapter using Mount for ECharts and a separate accessible
  data representation.
- Carousel must choose between a Crease-owned Submodel and a mounted third-party runtime;
  do not mix ownership models.
- Scroll Area should remain native unless custom behavior has a demonstrated need.
- Sidebar is a feature recipe, not a universal primitive, when it includes persistence,
  responsive navigation, and application layout state.
- Avatar needs a state machine only if image loading state must be observable in update;
  otherwise use native image events mapped to parent Messages or a controlled helper.

### Exit criteria

- every component has the correct lifecycle primitive;
- no third-party runtime is created from view;
- cleanup is verified;
- large-data behavior has measured performance evidence;
- Data Table and Sidebar installation includes full feature integration rather than a
  misleading single-file component API.

## Phase 6: remaining presentational components and blocks

### Components

- Card
- Badge
- Item
- Attachment
- Bubble
- Kbd
- Label
- Marker
- Native Select
- Separator
- Typography
- Button Group
- Input Group
- Input OTP
- Direction
- remaining blocks and examples.

### Key work

- remove artificial Models;
- normalize canonical `view` naming with compatibility aliases;
- finish semantic slot inventory;
- verify responsive containment and text overflow;
- ensure blocks use stable migrated APIs;
- classify Typography as a recipe or helper set rather than upstream parity.

## Phase 7: CLI, migration, and release hardening

### Tasks

1. Complete `crease init`, `list`, `inspect`, `add`, `diff`, `upgrade`, and strict doctor.
2. Generate parent integration capsules.
3. Add installed artifact lock and source hashes.
4. Add three-way upgrade support or a documented safe merge workflow.
5. Publish migration guides from the old 0.1 API.
6. Test clean consumers for SPA, SSG, SSR, and embedded modes as supported.
7. Publish a release candidate.
8. Run manual keyboard, screen reader, touch, and high-contrast review on flagships.
9. Resolve P0 and P1 defects.
10. Release with an honest stable and preview catalog.

## Prioritization rules

When work competes, prioritize in this order:

1. incorrect state ownership;
2. accessibility or keyboard defects;
3. lost Commands, OutMessages, cleanup, or child invariants;
4. version and generated-document drift;
5. SSR and hydration correctness;
6. consumer installation and upgrade safety;
7. visual fidelity;
8. additional variants;
9. additional components.

## Stop conditions

Stop and report rather than improvising when:

- the supported Foldkit version lacks a required primitive and a new behavior design is
  not approved;
- a change would overwrite unrelated or consumer-owned work;
- the chosen state owner is ambiguous;
- a shadcn behavior conflicts with Foldkit or platform accessibility;
- exact upstream source or version information is unavailable;
- a component cannot meet stable requirements and must be reclassified;
- the migration requires a product choice not made in this plan.
