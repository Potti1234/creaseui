# Installable consumer source lint delivery plan

Date: 2026-10-13. Work packages: L1 and L2. Status: proposed implementation.

Deliver an optional `@creaseui/lint` add-on that requires approved Crease controls,
layout and text in application code while keeping raw rendering available inside
exact registered implementations. Make it work in ordinary consumer projects,
independently of this repository's aliases, directories and browser tooling.

The [consumer lint plan](consumer-ui-lint-plan.md) defines product policy. The
[source implementation brief](consumer-ui-lint-implementation-brief.md) defines
the proposed configuration API, receipt, rule behavior and detailed source test
matrix. This delivery plan adds bounded implementation order, integration with
the theme work and release proof. Reuse those contracts rather than inventing a
second configuration or ownership format.

## Scope and existing foundation

Preserve the existing default plugin, `tailwind`, `stylex`, `constrainedStylex`,
`pleat` and `./rendered` exports. Inspect current `packages/lint/index.js`,
declarations, rules, `lib/foldkit-sites.js`, `lib/pleat-sites.js`, tests and package
metadata. Existing local rules and upstream Tailwind/StyleX plugins are useful
analysis inputs; none is by itself the complete strict consumer boundary.

Proposed new public APIs remain `creaseui(options)` and the companion
`creaseui-lint init` / `creaseui-lint doctor`. The optional `audit` command belongs
to [A1](rendered-ui-audit-delivery-plan.md). Document actual exports and supported
versions only after implementing and testing them.

## Shared contracts and file ownership

Use R1's versioned semantic policy and R2's component/export inventory. The
installer generates ownership records at consumer destinations in the proposed
`crease.lock.json`; explicit manual registrations use the same validated schema.
Do not infer trusted implementations from names such as `components`, `Button`
or `layout`, or from an import of Crease.

Resolve exact files, aliases, relative imports, public exports and re-exports
through the consumer TypeScript project. Normalize Windows case/separators and
real symlink targets. Reject ambiguous ownership, traversal/outside-root paths,
missing records and incompatible renderer/policy/schema declarations. Changes
to installed source hashes mark local modifications for upgrades; they do not
remove ownership or disable checks.

| File role                    | Allowed operations and checks                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Application                  | Approved components/composition, typed finite variants and placement; raw rendering and ad hoc appearance are errors   |
| Renderer implementation      | Raw construction necessary for its contract; selected renderer syntax, semantic roles and finite variants stay checked |
| Shared behavior              | Necessary structural rendering and primitive attributes; no appearance authoring                                       |
| Theme/token                  | Brand values and semantic definitions under theme validation; no automatic raw-rendering grant                         |
| Registered adapter           | Its declared integration output/dynamic properties and lifecycle; applicable labeling/behavior checks remain active    |
| Framework setup/model/update | Normal state/types/effects and declared setup entries; no blanket rendering exception                                  |

Application feature helpers may return Html by composing approved components;
they do not need registry registration solely for returning Html. Check their
callback bodies. Specialized third-party rendering requires an adapter contract.
Registration is reviewable project configuration, not a security boundary or
proof of visual quality.

## Package L1 source analysis and rules

### Slice 1 configuration and resolver

Implement the validated factory and one shared cached type/binding resolver.
Resolve renderer/manifest/project configuration precedence once, then emit named
flat-config entries for each role. Missing strict type information is an
actionable setup failure, not a fallback to matching identifier spellings.

Support namespace/named aliases, local immutable aliases, destructuring,
constant computed members, HtmlBuilder type aliases, inferred view parameters,
inert builders and re-exports. Respect lexical shadowing and import cycles.
Include a small three-renderer consumer receipt fixture before connecting the
full registry generator. Record supported analysis paths explicitly.

### Slice 2 complete strict rule set

| Proposed rule            | Required boundary                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `no-raw-controls`        | Native controls and mapped headless rendering are rejected in application code                                                             |
| `no-raw-composition`     | Native regions, text, links, lists, forms, tables and other rendering require approved replacements/adapters                               |
| `no-unapproved-renderer` | External Html producers and implementation-only render exports cannot bypass ownership                                                     |
| `no-application-styles`  | Application class/style APIs, appearance attributes, unregistered CSS, known DOM styling escapes and renderer style factories are rejected |
| `component-contract`     | Component variants, content and placement satisfy the installed finite contract                                                            |
| `no-unverifiable-ui`     | Contracted UI operations with unresolved dynamic access or opaque/forged styling cannot silently pass                                      |

Inventory native builders and headless render exports from the exact installed
Foldkit baseline. Include keyed/inert/custom-element constructors and mapped
render callbacks. Preserve types, Messages, init/update and non-rendering helpers;
a blanket `@foldkit/ui` import ban is incorrect. Preserve empty, lazy and Submodel
transports while checking the rendering inside their callbacks.

Resolve known object spreads, branch choices and overwrite order. Permit typed
finite runtime variants and business data. Inspect contracted UI fields rather
than treating every model value as style data. `any`, unknown keys, mutation and
assertions hiding appearance require a precise unresolved/violation diagnostic.
General whole-program taint analysis is outside scope; supported unresolved UI
paths must stay visible.

Keep raw rendering legal only in the exact registered files. Enable existing
renderer/token policies there and check appearance ownership and component calls.
Allow primitive-owned ARIA/events/positioning through explicit behavior contracts.
Dynamic chart coordinates or slider progress need narrowly declared adapter
properties; they do not authorize arbitrary CSS.

### Slice 3 authoring policy and diagnostic quality

Use the shared semantic roles for property limits, token references, typography,
spacing, motion and surface choices. Match Tailwind utilities, StyleX references
and Pleat declarations to that same policy. Components can use documented
structural constants such as zero or a border hairline; brand values belong in
theme modules. Runtime state styling must target actual Foldkit states.

Every diagnostic includes the offending operation/field, stable rule and contract
ID, actual installed replacement/import or installation instruction, and permitted
customization route. Avoid duplicate diagnostics with legacy helper presets.
Do not autofix stateful controls or invent Foldkit wiring. Any safe stateless
suggestion needs a proven equivalent and focused tests.

## Package L2 consumer setup and packaging

`init` reads existing ESLint/project configuration and produces a minimal
reviewable integration or a standalone config fragment. It never replaces an
arbitrary existing config. Setup defaults to strict. Migration warnings are an
explicit legacy-file policy using the same rules; new strict files remain errors.

`doctor` validates effective ESLint scope, parser/type services, aliases,
renderer, receipt/contracts, registered files, installed replacements and
compatibility. Detect representative UI files that have no effective policy.
Report exceptions and suppressions; enable unused-disable reporting and require
specific reasons for Crease suppressions. Avoid broad generated/vendor excludes
that accidentally hide installed source-owned components.

Reuse the registry/setup configuration reader. Document how custom components,
themes and adapters are registered, checked and upgraded. Installation examples
must use actual rewritten consumer paths rather than hard-coded `@/pleat`.

Pack the package and install the tarball in fresh consumer directories. Verify
public exports, declaration files, included rule/lib files, binary entries and
tested Node/ESLint/parser/TypeScript compatibility. Source-only import and lint
must work with no LintApple, Playwright or browser binary installed, and must not
eagerly import rendered code. Inspect optional dependency/license provenance when
updating the rendered engine; retain the pinned tested baseline until verified.

## Required consumer proof

For each renderer, install components through the local registry/receipt path
and the lint tarball into a fresh Foldkit/Vite consumer. Use alternate source
directories and aliases, an existing flat config, npm and pnpm. Include one
typed-JavaScript configuration or declare its exact supported parser requirements.

The settings and dashboard examples must contain complete Model/Message/update/
view/runtime wiring, use only approved ordinary composition, pass source lint,
compile, build, load actual CSS and complete representative interactions. The
source add-on itself remains browser-independent; these are release tests of the
components it recommends.

| Positive case                                     | Required negative counterpart                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Approved Button/region/Text/Link/Form             | Raw control/layout/text/link/form fails with a real replacement                               |
| Exact implementation can render raw elements      | Neighboring unregistered wrapper fails; implementation raw color/restyle still fails          |
| Aliased/re-exported installed component           | Aliased/destructured/keyed/headless raw rendering still fails                                 |
| Unrelated shadowed object named h/Button          | No false diagnostic from spelling                                                             |
| Finite runtime variant and valid spread           | Appearance field, unknown UI spread, forged placement or hidden assertion fails               |
| Registered theme/component/adapter customization  | Unregistered style factory/CSS/Html provider fails                                            |
| Normal state/types, empty/lazy/Submodel transport | Mapped headless view or raw rendering in its callback fails                                   |
| Full valid parser/receipt/config setup            | Missing types, conflicting roles, outside-root path or uncovered UI module is a setup failure |

Use the full detailed matrix in the source brief, including overwrite order,
mutation, cycles and malformed configuration. Assert rule IDs, source locations,
contract IDs and guidance, not only finding counts. Test source modifications
and upgrade receipts without silently overwriting consumer files.

## Work item and completion contract

**Objective:** an independently installed strict lint package with real
replacements and actionable boundaries for all three renderers.

**Scope:** lint internals/rules/types, shared policy integration, generated
ownership metadata, setup/doctor, package docs and consumer fixtures. Component
replacement work remains in R2; coordinate contracts rather than rewriting state.

**Inputs:** R0/R1/R2 contracts, existing lower-level helpers and source brief.

**State ownership:** no new UI state. Resolver caches are tooling internals with
project-scoped lifetime, not application services.

**Public API:** proposed `creaseui()` factory, versioned configuration/receipts,
rule IDs and init/doctor; preserve existing exports.

**Behavior contract:** strict controls/layout/text from day one, precise raw
exceptions, finite customization, no bypass through supported aliases/spreads,
and explicit setup failures for unresolved prerequisites.

**Evidence:** full positive/negative matrix, packed package/type checks, npm/pnpm
consumer setup, all three strict recipe consumers, effective-scope doctor output,
source-only dependency proof and customization/upgrade fixtures.

**Migration:** existing low-level helpers remain usable; strict factory is an
optional opt-in addition. Severity/schema compatibility changes are versioned.

**Stop conditions:** missing ordinary replacements block the release, not rule
development; report them against R2. Do not weaken strict policy to ship early.

## First source release acceptance

- [ ] Strict bans cover raw controls, all ordinary layout/text and appearance escapes.
- [ ] Exact implementations can render primitives while authoring checks remain active.
- [ ] Supported aliases/re-exports/spreads cannot bypass the boundary.
- [ ] Ordinary replacements and strict settings/dashboard programs work in three renderers.
- [ ] Packed consumer installs preserve existing config and source ownership.
- [ ] Source lint works without browser/rendered dependencies.
- [ ] Diagnostics, setup failures, suppressions and compatibility are documented.
- [ ] The optional browser audit is described as a separate delivery.
