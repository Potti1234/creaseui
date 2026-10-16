# Guide series for building and maintaining a design system with Crease

Date: 2026-10-15. Status: implementation plan for documentation and its executable examples.

Crease provides source-owned building blocks and tools for teams to create their
own design systems. This series teaches the complete process: choose principles,
adapt components, create product patterns, enforce the resulting contracts, work
with AI, and maintain those decisions as the product and upstream sources change.

The tutorial produces a real task-management frontend in a separate application
repository. Linear is the confirmed baseline for clarity, consistency, usability
and small interaction details. Start with Tailwind and client-side persisted
sample data; no backend is required. The user will create the separate repository
named creaseui-demo.

The first local implementation now follows the confirmed issue-list/quick-editing,
light-theme, desktop-first brief. Its foundation is reviewed PR 28 commit
244b4c79cf901a28f7e2e8d57a9b4dd59aaee390, with explicit local source adaptations.
The sibling creaseui-demo app includes a pilot essay and working interactions.
See [the first-slice handoff](linear-first-slice-implementation-brief.md).
Keep its visual acceptance and chapter/tag freezing pending user review; do not
report this first prototype as completion of D2 or the full series.

Before a teaching checkpoint is accepted, complete the
[architecture repair and enforcement plan](tutorial-architecture-enforcement-plan.md).
The first implementation put component styling in global CSS and rebuilt available
foundations, including Sidebar. Closed APIs and feature-only lint did not prevent
that failure; the series must teach and verify component authoring as well.

Readers own the app's theme, public APIs, patterns, policy, and changes. Product
choices must not become universal Crease requirements. Preserve a runnable branch
for each taught version and exact accepted source references for the documentation.

## Start here

Implement this plan with these companion specifications:

- [Tutorial project and checkpoints](design-system-tutorial-spec.md): the app,
  component adaptations, state ownership, source delivery, and executable evidence.
- [Product policy and AI workflows](design-system-policy-and-ai-plan.md): consumer
  contracts, rule authoring support, editing permissions, change control, and upgrades.
- [Product discovery and repository versions](tutorial-product-discovery-and-repository-plan.md):
  confirmed answers, remaining questions, separate repository, branches and design review.
- [Linear design research](linear-task-manager-design-research.md): sourced
  principles, their task-manager adaptations, and proposed verification.

Continue to follow the existing [architecture](02-architecture-contract.md),
[authoring](03-component-authoring-contract.md), and
[agent execution](07-agent-execution-protocol.md) plans.
Reuse the [source lint delivery](consumer-ui-lint-delivery-plan.md),
[source implementation brief](consumer-ui-lint-implementation-brief.md), and
[rendered audit delivery](rendered-ui-audit-delivery-plan.md) work.

This plan clarifies their product boundary: approved application components may
be locally adapted or newly authored product components. Crease does not require
an upstream approval process for a consumer to change their own source. Existing
runtime, accessibility, strict source, and packaging acceptance requirements
remain applicable. This documentation work does not automatically expand an
implementation agent's current repair assignment.

## Outcomes for the reader

After completing the series, a reader can:

1. Install a minimal working Foldkit application using one renderer.
2. Translate product principles into tokens, finite component APIs, and patterns.
3. Edit installed source, remove unwanted props, and add useful named variants.
4. Make implementation details unavailable to ordinary feature code.
5. Configure common restrictions without writing an ESLint plugin.
6. Write and test a product-specific rule when existing configuration is insufficient.
7. Give an AI agent a bounded feature task or a deliberate design system change.
8. Verify source contracts, actual interaction, accessibility, and rendered output.
9. Evolve APIs, migrate callers, and incorporate upstream fixes without losing local decisions.

## Product ownership model

| Layer          | Crease supplies                                                                                          | Consumer owns                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Foundation     | Components, accessible behavior, composition, renderer adapters, reference patterns, lint infrastructure | Selection of installed artifacts and renderer                             |
| Product system | Customization examples, supported contract tools, rule authoring guidance                                | Themes, public APIs, product patterns, policy and exceptions              |
| Application    | Enforcement mechanisms and complete integration examples                                                 | Domain state, content, feature behavior and composition within its policy |

Under the strict consumer policy, all application controls, layout, and text use
approved components from the first chapter that enables lint. Exact registered
implementations may render raw elements while their applicable authoring checks
remain active. An application helper that only composes approved components does
not need a raw-rendering grant.

Distinguish a component's runtime responsibilities from its visual choices.
Consumers may replace a visual default or narrow a variant union while preserving
the semantics, keyboard behavior, and state wiring required by that component.
Changes to those responsibilities require corresponding design and behavior work.

## Documentation structure

Create one series with an overview, fifteen sequential chapters, and reference
pages. Proposed public URLs are /docs/design-systems and
/docs/design-systems/<chapter-slug>. Confirm their integration with the actual
documentation router before implementation; these routes do not yet exist.

Keep authored prose and chapter metadata in the existing documentation content
architecture. Proposed planning locations for authored material are
docs/guides/design-systems and a matching shared chapter catalog. Resolve the
exact source module layout in the initial implementation brief. Use the current
site renderer, navigation, source viewer, and search rather than a second docs app.

The overview gives readers two paths: follow the complete task-manager tutorial, or
open a focused guide with its prerequisite checkpoint. Include a maintenance
entry path for teams that already installed Crease.

### Depth and the resulting product

The separate app repository is the canonical source for the tutorial's working
frontend and its version history. Crease owns the guides and reusable foundation.
The documentation consumes verified app revisions rather than maintaining a
second implementation inside this repository.

Teach the reasoning, alternatives, complete implementation, meaningful errors,
verification, and maintenance implications of each change. Show before/after
screens and source diffs, with a runnable branch and exact tag/commit.
The final app must be useful for a few coherent task-management workflows and
visually refined across its screens; successful component demos alone do not
satisfy the product outcome.

Map the learning objectives to real issue workflows. A few coherent screens are
enough; unrelated dashboards/settings or the full Linear feature set are outside
the initial brief.

### Editorial direction for experienced readers

Assume readers can develop web applications and read TypeScript. Skip elementary
language, package-manager and general frontend explanations. Go deeply into the
problems and new concepts introduced here: ownership, finite APIs, semantic roles,
Foldkit state boundaries, context-preserving interaction, lint contracts, AI scope
and maintenance.

Write a connected series of technical essays with an argument and working
examples. Matt Rothenberg's design-system articles and
[Logging Sucks](https://loggingsucks.com/) are the requested editorial references.
Use a concrete failure to motivate the concept, demonstrate an initially plausible
approach and its limit, then develop and verify the better design. Explain the
tradeoffs. Use original prose rather than copying their wording or mannerisms.

Keep setup commands and exhaustive API details in linked references when they
interrupt the argument. Every essay still links its exact runnable version,
complete source, diff and verification. Depth comes from explaining consequential
decisions, not repeating generic setup steps.

Develop the first pilot essay with the first reviewed frontend slice before
writing the full series. Review its narrative, technical depth, visuals and
source integration, then apply the accepted format to subsequent chapters.

### Visual explanations

Each essay includes the visual evidence that helps explain its central concept:
an annotated real screen, a before/after comparison, a small interactive example,
a source/result comparison, or a state/ownership diagram as appropriate.

Examples include the same issue row with conflicting overrides, a picker showing
focus returning to its trigger, a Message/update sequence for a property change,
and a version diff showing an API restriction and migrated callers.
Use shared fixtures and actual source, and make examples usable with keyboard
and reduced motion. Visuals must explain an observable decision; decorative
diagrams and unrelated interactive effects do not satisfy this requirement.

## Chapter contract

Every chapter contains:

- The product problem, the intended decision, and why it helps the task manager.
- Prerequisites and the exact downloadable starting checkpoint.
- A short inventory of files changed and responsibilities affected.
- Ordered instructions with complete source where source is the lesson.
- A live result and links to the complete runnable program and project.
- Its version branch, exact accepted tag/commit, predecessor, and before/after diff.
- Product-specific rationale and reviewed visual/interaction evidence.
- A passing example and a deliberate failing example when enforcement is taught.
- Commands that exist in the tested release and the expected meaningful result.
- What the compiler proves, what lint proves, and what still needs a runtime check.
- A completion checklist, troubleshooting, and links to the next chapter and references.

State whether a step edits a component implementation, theme, policy, or feature.
Explain why that edit is appropriate instead of teaching readers to suppress a
rule until an example works.

## Chapter curriculum

### G01 Choose your foundation

Slug: choose-your-foundation.

Explain source ownership, Foldkit's explicit state model, the three layers above,
and the roles of Tailwind, StyleX, and Pleat. Describe the difference between
adopting the reference appearance and creating a product system from it.

The reader chooses one renderer and a supported package manager. They see the
same finished task-manager screen in the delivered renderer tracks and learn which files are
shared behavior and which files provide styling.

Deliver a renderer decision table, prerequisite versions read from compatibility
metadata, the finished project preview, and an honest capability inventory.
Completion: the reader can identify what they own and select a supported track
without installing all three styling engines.

### G02 Install and run the smallest real application

Slug: install-and-run.

Create a consumer outside the Crease repository. Install real registry components,
the chosen renderer's setup, the theme, and the lint add-on. Show aliases in
TypeScript, the bundler, tests, and the installation transport where applicable.

Run a complete Foldkit program with a Button, approved layout, and approved text.
Enable strict controls, composition, and typography. Explain ownership metadata,
setup scope, and the doctor result using actual supported commands.

Deliver the first runnable checkpoint and a package/lockfile baseline.
Completion: lint, typecheck, production build, and a real button interaction pass
without the documentation site's stylesheet, aliases, or node_modules.

### G03 Turn product principles into decisions

Slug: define-your-principles.

Use the sourced Linear task-management study to define predictable actions,
context-preserving edits, restrained surfaces, and useful density. For each principle, show its
scope, rationale, API implication, verification method, and possible exceptions.

Teach the difference between a general aspiration and a decision a builder can
apply. Explain that card, tab, save, and confirmation conventions depend on the
product and workflow. Include a bounded alternative policy to demonstrate this.

Deliver a short product policy and a decision record.
Completion: another builder can choose the intended property-editing pattern and action
placement from the written decisions without inspecting an arbitrary old page.

### G04 Create a coherent theme

Slug: theme-and-tokens.

Customize semantic colors, typography, spacing, density, radius, elevation, focus,
and motion. Show their relationships across Button, Field, surfaces, and page
regions. Keep raw brand definitions in the intended theme files.

Exercise light/dark themes, nested scope, overlay scope, narrow widths, long
content, and reduced motion where applicable. Explain why approved tokens alone
do not define a consistent component or page.

Deliver the product theme and a shared representative preview.
Completion: the selected renderer supplies real CSS in a standalone build and
the declared theme checks and state examples pass.

### G05 Adapt a component and reduce its API

Slug: customize-a-component.

Customize Button by removing unnecessary sizes and appearance escape props,
renaming visual choices to product intent where useful, and retaining needed
behavioral and native semantics. Demonstrate editing installed source directly
and the alternative of exposing a narrower facade over an internal component.

Change the public type, runtime handling, variant definition, local contract,
examples, and relevant tests together. Explain structural typing, props spreads,
and why narrowing a type alone does not remove runtime forwarding.

Deliver a source-owned product Button with two intents and a fixed normal height.
Completion: valid feature usage passes, removed props and values fail, and the
button still supports the required loading, disabled, submission, and naming behavior.

### G06 Register local contracts and component boundaries

Slug: contracts-and-boundaries.

Explain public and implementation-only exports, exact file roles, local component
registration, and component-specific placement. Show why changing height can be
an appearance override for Button while region sizing may be legitimate.

If a facade is used, prohibit application access to its broader implementation
through direct imports, aliases, and re-exports. Preserve legitimate non-rendering
imports and component implementation composition.

Deliver a checked local contract and a boundary diagram.
Completion: source edits retain ownership, stale contracts are reported, neighboring
feature files do not gain raw privileges, and internal source remains checked.

### G07 Compose named product patterns

Slug: compose-product-patterns.

Build the product's shared header, issue row, property pickers, filter bar and
detail presentation from approved foundations. Give each pattern a purpose,
use-when and avoid-when guidance, required regions, and explicit layout and
interaction responsibilities.

Prefer structured slots or finite data when that makes ordering and ownership
unambiguous. Do not imply arbitrary Html children can always be statically
classified. Keep the public pattern vocabulary independent of renderer details.

Deliver issue collection and detail layouts with one known inset owner per region.
Completion: the API inherits the intended hierarchy and responsive arrangements;
it still permits different domain content without appearance overrides.

### G08 Model saving validation and destructive workflows

Slug: state-and-workflows.

Implement issue creation, inline/property edits and browser persistence. Make draft,
committed value, validation, pending state, failure and recovery observable.
Choose confirmation or undo for any destructive task according to its consequence
and the product policy. Do not add workspace deletion as a tutorial requirement.

Show complete Model, Message, init, update, effects, OutMessages, subscriptions,
view, and runtime wiring required by the installed Foldkit baseline. Keep durable
domain values in the parent and transient dialog interaction in its intended
Submodel. Explain why a quick property selection and a multi-field issue composer
have different commit/dismissal behavior.

Deliver functioning workflows using a deterministic local service.
Completion: validation, failed persistence, retry, duplicate creation, draft
retention, applicable stale-result handling and focus behavior have scenario/browser proof.

### G09 Verify the whole system

Slug: verify-your-system.

Teach a small test pyramid: types and contracts, lint positives/negatives,
Foldkit scenarios, then meaningful browser and visual checks. Include empty,
loading, failure, success, long content, narrow layout, light/dark, keyboard,
RTL, and reduced-motion cases where they apply.

Use representative fixtures instead of claiming every combination has been
exhaustively verified. Explain reviewed visual baselines and the difference
between an accepted exception, unsupported execution, and a passing check.

Deliver a reproducible check workflow and an evidence record.
Completion: deliberate regressions fail their intended checks, the normal app
passes, and source-only lint does not require browser tooling.

### G10 Configure your product policy

Slug: configure-product-policy.

Configure common choices through supported contracts: public exports, allowed
variants, forbidden props, placement, and supported pattern requirements.
Explain precedence between Crease defaults and consumer-owned component policy.

Show one safe narrowing and one deliberate replacement of a visual default.
Validation of the configuration and relevant behavior remains active. Do not
present global Crease aesthetic choices as immutable product decisions.

Deliver a reusable local configuration and effective-policy explanation.
Completion: the same policy applies through the chosen renderer adapter and
reports unsupported or conflicting declarations instead of silently ignoring them.

### G11 Write a custom design system lint rule

Slug: write-a-custom-rule.

Build a real local ESLint plugin. The first rule prevents feature code from using
a broader base component when the product facade is required. The companion
example checks an explicitly declared issue-property slot against its approved picker pattern.

Use supported public Crease analysis helpers for symbol/contract resolution.
Teach configuration schemas, diagnostic messages, unresolved cases, tests,
performance, and safe suggestions. Include aliases, destructuring, barrels,
spreads, shadows, and unrelated business objects in the examples.

Deliver the working plugin, configuration, documentation, and test fixture project.
Completion: positive and negative tests prove the intended product policy, imported
names alone never establish component identity, and no private Crease paths are imported.

### G12 Use AI for feature work within the system

Slug: ai-feature-workflow.

Prepare a concise agent entry document linking principles, public components,
patterns, complete examples, and check commands. Define the task's edit scope,
available tools, expected evidence, and what to do when the vocabulary is insufficient.

Run a realistic task: add a priority filter using the established filter pattern.
Show the task, files inspected, implementation, failed diagnostic and correction,
checks, and final review. Include a negative example that tries raw layout or a
direct base-component import.

Deliver reusable feature-task instructions and a successful task transcript.
Completion: the task uses existing public APIs without modifying the system or
weakening checks, and reports a genuine missing capability as a separate design need.

### G13 Use AI to change the design system deliberately

Slug: ai-system-changes.

Give a separate task authorizing an actual system change: add a compact toolbar
button option only to a named context. Update source, policy, examples, diagnostics,
and affected callers together while preserving the regular button contract.

Explain how existing task authorization and project policy determine the edit
scope. Avoid a permission prompt for every routine implementation step. Demonstrate
how the same edit is outside an ordinary feature task but valid in this task.

Deliver the system-change task template and a reviewed change record.
Completion: the feature boundary is still enforced, the new context is explicit,
and checks have been extended rather than weakened to accommodate the change.

### G14 Evolve APIs and migrate callers continuously

Slug: evolve-and-migrate.

Teach a recurring change loop: observe repeated requests, decide whether the cause
is a bug or missing concept, change the system, migrate callers, verify, and update
guidance. Include a real breaking change that removes a deprecated visual option.

Record bounded exceptions with reason, owner or responsible team, scope, and a
review trigger. A date is optional unless the product needs expiration. Explain
why exceptions and local edits are useful maintenance evidence.

Deliver a small migration, an exception example, and a change checklist.
Completion: affected call sites are found, an outdated example fails verification,
an exception cannot grant a whole directory raw rendering, and the migration is reviewable.

### G15 Incorporate upstream changes and share your system

Slug: upgrade-and-share.

Compare an installed base, the locally adapted component, and a newer upstream
version. Preserve intentional local API decisions while integrating a real upstream
behavior or accessibility fix. Show dependency and compatibility checks.

Demonstrate distribution within one repository and an optional separate product
registry/package. Explain how contracts, themes, examples, and lint configuration
travel with that system and how consumers pin compatible versions.

Deliver an upgrade rehearsal and a distribution example.
Completion: the local component is not overwritten, removed props stay unavailable,
the upstream fix is verified, and a second clean consumer can use the shared system.

## Shared tutorial and renderer presentation

Use the selected task manager throughout; do not replace it with unrelated toy examples.
Common lessons and state wiring are authored once. Provide Tailwind, StyleX, and
Pleat tabs for renderer-specific installation, implementation, and configuration.

Tailwind is the confirmed first product implementation. Build and review its
complete vertical slice before expanding companion renderer tracks. The series'
existing parity goal remains; staged delivery must not label unbuilt tracks complete.

All three tracks have the same chapter outcomes, interactions, explanatory depth,
source viewer, and complete program download. Consumers only install their selected
renderer. A consumer extending one renderer is not required to maintain three forks.

Generate shown code from the verified tutorial sources. A short excerpt may focus
the explanation, but the complete source and runnable checkpoint must be available
beside it. An isolated Button call does not satisfy the complete-program requirement.

## Reference and task materials

Provide focused references alongside the tutorial:

- Principle-to-enforcement decision table and examples of product-specific choices.
- Public component, export, prop, slot, variant, placement, and ownership vocabulary.
- Customization recipes for removing a prop, adding a variant, changing a token,
  adding an adapter, and introducing a product pattern.
- Rule authoring API, diagnostic format, test matrix, and supported analysis limits.
- Effective permissions matrix and repository enforcement setup.
- AI feature, system-change, migration, and upgrade task templates.
- Exception inventory, change record, and verification report templates.
- Troubleshooting for aliases, stale contracts, style delivery, parser services,
  component boundaries, optional browser tooling, and changed compatibility.

Deliver these through the existing site search and agent discovery outputs.
Generated metadata links the same chapter/example sources used by the site.

### Entry points from the components and lint package

Link the series from Getting Started, component customization documentation,
the lint package README, and rule documentation. A consumer arriving through a
lint diagnostic should find the relevant customization guide and product policy
explanation without following the whole tutorial.

Include the minimal rule-authoring reference and tested integration examples in
the published lint package documentation. Keep the full tutorial on the docs site
with downloadable source. Generate shared example material where it appears in
both locations; avoid maintaining different configuration examples by hand.

The series overview lists each chapter's status, prerequisites, renderer coverage,
checkpoint and tested release. Search and agent discovery use that same catalog.
Changing component APIs or public lint helpers must identify affected chapters
through their declared dependencies.

## Implementation work packages

| Package | Scope and outcome                                                                                                    | Dependencies                                                              | Required evidence                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| D-brief | Consolidate user answers, Linear research, task-manager scope, visual direction and app repository/version decisions | Discovery answers; inspect foundation independently while waiting         | Product brief, references, planned first slice and open decisions                   |
| D0      | Inspect the merged baseline; record real exports, commands, docs structure, compatibility and gaps                   | D-brief for product choices; existing repair work can continue separately | Capability inventory and bounded implementation brief                               |
| D1      | Decide public policy composition and rule helper contracts; implement the smallest tested support slice              | D0 and L1/L2 contracts                                                    | Packed API/type tests, resolver negatives, supported-version record                 |
| D2      | Establish the separate app repository, version index, Tailwind foundation and adapted components; author G01-G06     | D-brief and D1 capabilities needed by those chapters                      | First real reviewed slice, runnable version branch and passing/negative checkpoints |
| D3      | Build approved task-manager patterns and behavior; author G07-G09 and expand equivalent renderer tracks              | D2                                                                        | Real tasks, preserved context, state/focus/responsive/CSS and visual evidence       |
| D4      | Deliver declarative policy, local plugin and G10-G11                                                                 | D1 and D3                                                                 | Actual plugin tests, configuration diagnostics and packed consumer proof            |
| D5      | Run AI feature/system-change exercises; author G12-G13 and permission references                                     | D4                                                                        | Task transcripts, boundary failures, successful scoped changes                      |
| D6      | Rehearse migration, exception handling and upstream update; author G14-G15                                           | D5                                                                        | Before/after source, retained local choices, second consumer                        |
| D7      | Integrate navigation, search, discovery, app branch/tag links, downloads and release checks                          | Each published chapter is already verified                                | Full series traversal and clean clones of the matching app versions                 |

For each package use the existing agent work-item format: objective, scope, inputs,
state ownership, public API, behavior contract, evidence, migration, and stop conditions.
Deliver code, prose, examples, metadata, and proof together in bounded changes.

## Capability and publication gates

At D0 inspect the actual merged source. Historical local lint research, the last
reviewed PR snapshot, and planning documents are different inputs. Do not treat an
illustrative policy field or CLI command from any plan as an installed API.

Record each capability as available, partial, or required before publication, with
an exact export/command, tested version, example, and evidence location. In particular,
verify consumer policy composition, complete component contracts, public rule
helpers, stale-contract reporting, upgrade tooling, and standalone registry installation.

Publish a chapter as executable documentation only when its prerequisites and
APIs work in its downloadable checkpoint. An experimental reference must clearly
identify its requirements. A working early chapter may publish before later ones,
but unfinished chapters must not appear complete in navigation or coverage.

No prose-only completion claim satisfies a chapter that promises a runnable rule,
workflow, command, or project. Existing release blockers remain visible; the guide
series does not conceal them through a simplified fake component.

## Acceptance and verification

The series is complete when:

1. All fifteen chapters have a tested start/result checkpoint and declared prerequisites.
2. All three renderer tracks use actual installed components and complete Foldkit wiring.
3. Reader-visible code comes from compiled or deliberately failing fixtures.
4. Strict source checks reject raw controls, raw layout/text, restyling, broader
   implementation access, and unresolvable supported UI contracts.
5. Consumer source customization, local patterns, and authorized system edits work normally.
6. Public helper and declarative policy capabilities are actually shipped and documented.
7. Behavior and visual checks exercise the declared meaningful state matrix.
8. AI feature work cannot pass the protected integration gate by modifying policy
   or excluding failing files; the configured enforcement boundary is stated precisely.
9. A breaking local change and an upstream update preserve the intended product system.
10. Site navigation, search, links, source display, downloads and agent discovery agree.
11. The app has its own repository, working history, and a runnable branch for each
    taught version, with exact accepted source and Crease dependency references.
12. The frontend meets the agreed task-manager scope and visual/interaction criteria;
    code compilation and lint alone do not establish that the product looks good.
13. Design decisions and user feedback are recorded and carried forward without
    silently changing older teaching versions.

Use focused verification while writing and the appropriate existing release checks
at package gates. Documentation-only planning changes do not require application
test runs. Implemented tutorial behavior and lint tooling require meaningful tests.

## Assignment for the implementation agent

> Implement the guide series from docs/plan/design-system-guide-series-plan.md
> and its tutorial, product-discovery, Linear research and policy/AI companion
> specifications. Consolidate the user's answers in D-brief and inspect the merged
> baseline in D0; report available versus missing public capabilities.
> Crease is a foundation for consumer-owned design systems: local component edits,
> reduced APIs, themes, patterns, and product lint policies are first-class work.
> Build the focused Linear-inspired task manager in the user-created creaseui-demo
> repository. Start with Tailwind and client-side persisted sample data, with no
> backend. Preserve a runnable branch for each taught version and exact reviewed
> tags/commits. Review the first working slice and pilot technical essay before
> expanding the product and companion StyleX/Pleat tracks. Write for experienced
> readers in the requested essay style, using explanatory visuals and complete
> Foldkit programs. Derive displayed source from actual app checkpoints. Implement and test
> required public rule helpers and policy composition before documenting them as
> available. Distinguish lint contracts, AI task scope, and enforced repository or
> execution permissions. Teach both bounded feature work and authorized system
> changes, followed by a migration and an upstream upgrade rehearsal. Preserve the
> existing repair work and user edits. Do not invent working commands, duplicate
> behavior, weaken checks, reset local customization, or call prose-only chapters
> complete. Deliver each work package with its evidence and remaining gaps.
