# Crease consumer lint implementation brief

Date: 2026-10-13. Status: implementation handoff. New APIs, schemas and rule IDs
below are proposed implementation contracts, not exports already available.

For the complete combined assignment, start with the
[styling reliability and lint handoff](reliability-and-lint-agent-handoff.md).
Use the [source delivery plan](consumer-ui-lint-delivery-plan.md) for L1/L2
packaging and release proof, and the
[rendered audit plan](rendered-ui-audit-delivery-plan.md) for the later optional
browser delivery. This brief remains the detailed source-rule contract.

Ship an optional `@creaseui/lint` add-on whose default preset requires Crease
components for application controls, layout and text immediately. The user
explicitly selected this policy. Complete composition coverage for Tailwind,
StyleX and Pleat belongs in the first source-lint release; a controls-only preset
does not fulfill the task.

The [consumer lint plan](consumer-ui-lint-plan.md) defines the overall workstream.
This brief supplies the implementation decisions and bounded work items. Before
source changes, follow the reading and execution requirements in
[the agent protocol](07-agent-execution-protocol.md). Preserve the dirty worktree
and reconcile the revised Pleat PR with the local experimental work rather
than overwriting either implementation. The last reviewed PR head and remaining
findings are recorded in the combined handoff; verify the actual implementation
baseline instead of assuming the port is still being edited by another agent.

## Product contract

Application authors choose a page recipe, arrange approved composition primitives
and render styled controls with named variants. They can customize a semantic
theme or register a source-owned component. Rendering raw elements and writing
ad hoc styles belong inside those explicitly identified implementations.

Enforce three complementary contracts:

| Contract                        | Purpose                                                                                      | First delivery                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Component and composition APIs  | Provide a usable replacement for ordinary page markup, with finite styling choices           | Required for the first source-lint release, all three renderers |
| Source rules                    | Reject raw rendering, unapproved render providers and appearance escapes in application code | Required for the first source-lint release                      |
| Rendered and interaction checks | Measure overflow, spacing, typography and accessibility in actual states                     | Separate subsequent delivery, reusing the existing rendered SDK |

Passing source lint means the supported source contracts passed. It does not mean
the page is attractive, that every dynamic value was proven, or that keyboard
behavior was exercised. Reports must preserve these distinctions.

Keep aesthetic advice configurable. Raw controls, appearance escapes and invalid
contracts are errors. A generic dislike of cards, gradients, centered headings or
marketing copy is not a universal error rule.

## Default scope and exceptions

| File role                                                     | Raw rendering                             | Styling authority                                                                                |
| ------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Application views, features and render callbacks              | Forbidden                                 | Named variants, composition props and approved placement values                                  |
| Registered renderer implementation                            | Allowed                                   | Selected renderer syntax, semantic tokens and finite component variants                          |
| Registered shared behavior/render helper                      | Allowed where necessary                   | Behavior attributes and explicitly specified structural values; no renderer appearance authoring |
| Registered theme or token module                              | No automatic raw-rendering grant          | Named theme/token definitions under the shared policy                                            |
| Registered icon, chart, canvas, editor or integration adapter | Allowed in its exact implementation files | Declared adapter contract, including dynamic properties and lifecycle                            |
| Models, updates and framework setup                           | No automatic raw-rendering grant          | Normal Foldkit utilities and type imports; setup has an explicit entry contract                  |

Ownership is per resolved source file and export. Never infer an exemption from
a directory name, an import of Crease, a function named `Button`, or a type cast.
Application helpers may return `Html` when their implementation is inside the
linted application scope and composes approved components.

Third-party HTML output requires an adapter registration. A local feature view
does not need to become a registry component just because it returns `Html`.
Documented framework transports such as `h.submodel`, `createLazy` and empty
output remain usable; rendering inside their callbacks is still checked.

Normal string content remains legal in `Text.children`, `Button.children`,
labels and other component-owned content slots. Do not require a Text wrapper
around every label string or lint strings in Messages, URLs or model data.
In strict application scopes, Box/Stack/Inline/Grid children must be approved
`Html` output rather than direct strings; render ordinary text through Text or
typography helpers. Keep any historical string-child types compatible during
migration, but report that usage under the new strict contract. Semantic slots
that already own typography, such as a Section description, may accept strings.

## Proposed consumer API

Add the named export `creaseui(options)` to `@creaseui/lint`. It returns an array
of ESLint flat-config entries. Preserve the existing `tailwind`, `stylex`,
`constrainedStylex`, `pleat`, default plugin and `./rendered` APIs.

The intended consumer configuration is:

```js
import { fileURLToPath } from 'node:url'
import { creaseui } from '@creaseui/lint'

export default [
  // Existing application/TypeScript configuration remains here.
  ...creaseui({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    renderer: 'pleat',
    preset: 'strict',
    files: ['src/**/*.{ts,js}'],
    tsconfig: './tsconfig.json',
    manifest: './crease.lock.json',
    policy: 'crease-default-v1',
  }),
]
```

`rootDir` is explicit; do not resolve ownership relative to an arbitrary shell
working directory. `renderer` may come from the planned `crease.json` when
omitted, but conflicting explicit/project/manifest renderer choices are errors.
`preset` defaults to `strict`. `tsconfig` accepts a path or a list of project
paths. `manifest` accepts a path or a validated in-memory equivalent for manual
installations. `policy` selects a versioned policy; it is not a bag of arbitrary
rule overrides.

Return named entries for application, implementation, theme and adapter scopes.
Resolve scope precedence centrally before configuring rules. Overlapping records
with conflicting roles must produce a configuration error. A raw-rendering grant
must never switch off component contract, renderer validity or token checks.

Use one TypeScript program/resolution service per configured project, shared by
the rules. The factory must provide or validate the supported parser setup and
declare its parser/TypeScript dependencies explicitly. Missing type information
in strict mode produces an actionable setup failure, not disabled checks. Test
JavaScript with `allowJs`/`checkJs` or clearly document the supported typed JS
configuration. Do not silently fall back to matching identifier names.

Support `preset: 'migration'` only when explicitly requested. It uses the same
rules and diagnostics at warning level for selected legacy files. Separate
strict entries cover new files. The setup command and new starters select
strict. Existing low-level helpers retain their historical behavior and are
documented as lower-level configuration rather than the full consumer policy.

## Installed ownership metadata

Extend the planned registry metadata and installation lock, rather than creating
an independent second source of component ownership. Use `crease.lock.json` as
the proposed local receipt. Generate its component records from registry source;
update them through installation and upgrade commands. A parallel generated
Crease manifest is acceptable where transport rejects extended metadata.

Minimum illustrative record:

```json
{
  "schemaVersion": 1,
  "policyVersion": "crease-default-v1",
  "renderer": "pleat",
  "artifacts": [
    {
      "id": "crease/button",
      "version": "0.1.0",
      "files": [
        {
          "path": "src/design-system/button.ts",
          "role": "renderer",
          "rawRendering": true
        },
        {
          "path": "src/design-system/behavior/button.ts",
          "role": "behavior",
          "rawRendering": true
        }
      ],
      "exports": [
        {
          "file": "src/design-system/button.ts",
          "name": "button",
          "renderKind": "helper",
          "visibility": "public",
          "contract": "control.button",
          "propsArgument": 0,
          "builderArgument": 1
        },
        {
          "file": "src/design-system/behavior/button.ts",
          "name": "renderButton",
          "renderKind": "helper",
          "visibility": "implementation",
          "contract": "behavior.button",
          "propsArgument": 0,
          "builderArgument": 2
        }
      ]
    }
  ]
}
```

Include compatibility ranges, registry reference, installed source hash and
dependencies in the full receipt. Derive version ranges from the selected
canonical compatibility baseline; do not copy historical versions from planning
examples. Source hashes support upgrade previews. A local edit does not remove
ownership or exempt that file from lint.

Contract definitions specify allowed semantic/behavior props, content slots,
placement slots, prohibited appearance props, variant values, raw replacements
and any required audit metadata. Distinguish non-rendering exports and branded
Submodel views from ordinary helper calls. Do not treat every export in a
component module as a render function.

Resolve imports using the consumer's TypeScript configuration, including aliases,
relative imports and re-exports. Resolve and normalize filesystem paths before
comparing ownership. Check path case on Windows, traversal, conflicting owners
and symlink targets; registered implementation targets must stay within the
configured project root. Registry paths must be installed destinations, not
this repository's `src/ui` assumptions.

Allow explicit source-owned extensions in consumer configuration. Each registration
names an ID, exact files, public exports, role, contract and reason. Dynamic
adapter properties need a closed declaration such as chart coordinates or a
slider progress variable. Avoid broad path globs or arbitrary style allowances.
Registration is reviewable configuration, not a security boundary or proof of
component quality.

## Source rules and severity

Use `creaseui` as the plugin namespace. The following new IDs are the proposed
public rule contract. Existing overlapping rules may delegate to shared analysis;
avoid duplicate diagnostics when both old and new helpers are configured.

| Rule                          | Strict application behavior                                                                                    | Implementation behavior                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `no-raw-controls`             | Error on native controls and mapped headless render exports                                                    | Off only for registered raw-rendering files          |
| `no-raw-composition`          | Error on raw native layout, text, links, lists, forms and other native render builders                         | Off only for registered raw-rendering files          |
| `no-unapproved-renderer`      | Error on external render providers or implementation-only render exports                                       | Permit declared dependencies; keep module boundaries |
| `no-application-styles`       | Error on ad hoc class/style authoring and styling attributes                                                   | Renderer-specific authoring policy stays active      |
| `component-contract`          | Error on appearance overrides or unverifiable placement/content contracts                                      | Check component calls and variant usage here too     |
| `no-unverifiable-ui`          | Error when supported UI contracts cannot be resolved, including computed render access or opaque style spreads | Same for applicable contracted calls                 |
| Existing renderer/token rules | Active where relevant; native authoring is already forbidden in application scope                              | Active according to renderer or shared behavior role |

### Raw rendering classification

Build a native builder inventory from the installed Foldkit types and maintain
an explicit compatibility mapping. Controls include button, input, textarea,
select and option. Composition includes semantic containers, headings, paragraphs,
spans, lists, links, forms, tables and related content elements. Every native
render constructor must be classified; an unlisted tag must not become allowed.
Media, SVG, canvas, custom elements and third-party DOM belong behind components
or adapters rather than unstyled application exceptions.

Handle `h.keyed('div')(...)` as raw rendering too. Keyed approved components need
a supported public key mechanism. `h.empty` is allowed. `h.submodel` is a framework
transport: reject a mapped headless view passed to it, but allow a local composed
feature view or installed styled view. Lazy/keyed-lazy callbacks follow the same
rules. Include exported inert builders and supported custom-element constructors
in the inventory, not only the view parameter conventionally named `h`.

Reject mapped headless render exports when called, aliased or passed as render
callbacks. Preserve `Model`, Message constructors, init/update functions, schema
types and non-rendering ID helpers. Maintain the mapping from actual primitive
exports for the active baseline; a blanket ban on importing `@foldkit/ui` is wrong.

The full raw-composition ban covers hand-built clickable divs in application
code. In registered components, add a separate semantic-control check only where
a clear role/event violation can be proven. A click handler on a region is not
by itself proof of an incorrectly implemented button.

### Binding and data flow requirements

The shared resolver must recognize namespace and named imports, local aliases,
destructuring, constant computed members, type aliases to HtmlBuilder, inferred
framework view parameters, inert builders and imported re-exports. Use lexical
bindings; unrelated objects named `h`, `Button`, `styles` or `layout` must not be
classified by spelling.

Resolve local immutable objects, object spreads, conditional branches and finite
union choices. Respect property overwrite order. Reject computed keys whose UI
meaning cannot be resolved. Cache import/type resolution and detect cycles.
Do not reinterpret every `MemberExpression` as a static approved style reference.

For component props, inspect only contracted UI fields. An opaque model object
used as business data is normal. A props spread is acceptable when its resolved
fields or closed type prove the UI contract. A value typed `any`, an arbitrary
index signature, mutation or an assertion used to hide forbidden UI fields is
unverifiable and must identify the problematic field/spread. Finite, typed
runtime variants remain allowed without requiring literal values everywhere.

Do not build general whole-program taint analysis. Publish the supported data
flows and limitations. Unknown UI paths must produce a useful diagnostic in
strict scope. An ordinary framework helper that the resolver cannot understand
is a resolver/replacement task, not a reason to exempt its whole directory.

### Styling escape requirements

Application code cannot call `h.Class`, `h.Style` or `h.InnerHTML`, recreate those
through aliases, pass style/class through raw Attribute/Prop construction, call
native renderer authoring APIs, or import an unregistered CSS/style module to
restyle the page. Include known direct DOM construction/style mutation and
alternate VNode constructors where provenance can be identified. Legitimate
imperative integration lives in lifecycle adapters.

Registered global reset/theme CSS is allowed through a declared setup entry.
Approved imports of renderer implementations are allowed. Imports of arbitrary
style factories are not made safe by renaming them `layout`. Arbitrary HTML/MDX
output needs a documented rich-content adapter and policy.

Treat `class`, `className`, `style`, `css`, unrestricted attributes and every
contracted `*LayoutStyle` slot as possible appearance escapes. Native attributes
supplied by headless behavior must have an explicit behavior-attribute contract;
do not remove legitimate ARIA/event wiring to make lint green.

Prefer typed semantic placement props. If compatibility requires existing
Tailwind placement classes or StyleX/Pleat layout objects, validate their complete
resolved property set and values against the placement contract. An unknown
Tailwind utility or arbitrary selector is not automatically layout. Disallow
padding, gap, font, color, border, radius, shadow, opacity and motion on a control's
placement slot. Parents own arrangement; named component variants own appearance.

The existing experimental Pleat `layout()` wrapper accepts general CSS length
values and uses a structural tag. It is a foundation, not proof of the stricter
finite contract. The reviewed full Pleat PR now provides branded
`ComponentLayoutStyle`, property validation through `layoutStyle`, and conditional
`layoutWhen`. Preserve those fixes and evaluate their values against the shared
finite placement policy. Type tests and lint fixtures must reject raw appearance
properties and asserted/forged layout values; branding alone is not source proof.

### Diagnostics and fixes

Each diagnostic identifies the source operation/field, component contract,
replacement import in the consumer's actual installation and permitted next step.
For example: "Raw button rendering is forbidden in application views. Use
button from @app/design/button, or implement a registered component."

Do not suggest a fictional installed replacement. If a replacement is missing,
report its registry item and installation instruction, or the adapter route for
specialized output. Include rule documentation URLs and valid/invalid examples.
Never auto-rewrite a stateful widget, convert a button to a clickable div, or
invent event/model wiring. Safe suggestions may insert imports for a proven
stateless equivalent; they still need focused tests.

## Required composition and customization coverage

Audit existing Tailwind/StyleX APIs before changing them. Their current shared
prop types do not prove behavioral parity: Tailwind Text does not implement the
accent tone as StyleX does, and several Box/Inline choices need equivalent
handling. Move shared public contracts out of the StyleX directory where doing
so improves renderer independence; preserve consumer migration paths.

| Need                                       | Required public replacement                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Page regions and semantic layout           | Box, Stack, Inline, Grid, Section, shell/header/content/footer and existing page recipes         |
| Text and headings                          | Existing Text/typography helpers with semantic element, role, tone and finite typography choices |
| Links and form submission                  | Styled Link and Form with normal native semantics and Foldkit message translation                |
| Lists and description content              | Semantic list/item/description variants or focused helpers, preserving list semantics            |
| Tables and numeric content                 | Existing Table helpers plus numeric text/column contracts                                        |
| Actions                                    | ActionGroup or an audited equivalent distinguishing normal, joined and dense groups              |
| Icons, images, separators and rich content | Styled components or declared adapters with dimensions, labels and content policy                |
| Specialized output                         | Named lifecycle adapters for charts, canvas, maps, editors and custom elements                   |

Do not create a wrapper for every HTML tag by default. Extend an existing semantic
API where it preserves meaning, and add a helper when behavior or accessibility
needs a distinct contract. Publish a complete replacement table for the installed
baseline. Specialized features need adapters when used; the first release does
not need to implement every third-party integration in advance.

The renderer registry must supply the ordinary replacement vocabulary. Consumers
install only the components they use and their dependencies; they do not need to
install the entire catalog to lint a Button page. A missing replacement matters
when lint reports its forbidden operation or a declared recipe needs it. Starter
recipes install their required composition dependencies automatically.

Shared finite choices cover spacing, density, widths, responsive arrangement,
typography, surface, radius and alignment. Keep recipe-specific choices such as
`createBoard`, `chartTitle` or documentation preview heights scoped to the recipe
that needs them. They should not become generic recommended page defaults simply
because they already exist in composition types.

Customization remains possible at three levels:

1. Application: choose semantic props, variants, density and responsive recipes.
2. Theme: change named brand colors, fonts, spacing/radius scales and motion tokens
   in a registered theme definition. New values require rendered validation.
3. Component: add a named variant or a registered source-owned component/adapter,
   then test its contract. Do not use a per-call appearance override as the default
   customization mechanism.

Keep one shared behavior/state implementation. Renderer modules translate the
same semantic styling contract into Tailwind, StyleX or Pleat. Tests compare
semantic DOM, meaningful computed styles and behavior; engine class strings need
not match. Validate isolated installations without relying on the documentation
shell's reset or stylesheet.

## Shared policy and later rendered checks

Create a versioned shared policy module used by source rules and renderer
adapters. It defines typography roles, semantic token references, spacing and
density scales, allowed placement properties, surfaces, radius/shadow/layer
choices, motion properties and contract IDs. Avoid three independent policy
lists that drift by renderer.

Keep raw brand values in registered theme/token definitions. Components reference
semantic tokens. Permit documented structural constants such as zero, one-pixel
borders or `display: contents` in the relevant implementation contract; don't
create broad arbitrary-value exceptions. The shared Button behavior currently
uses `display: contents`, which needs explicit treatment or a safe refactor.

| Common generated UI problem                                  | Enforcement                                              |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| Raw or hand-built ordinary controls                          | Source rendering boundary                                |
| Random spacing, sizes, radii or one-off styles               | Finite props, token rules and implementation contracts   |
| Restyled controls with inconsistent appearance               | Placement/appearance separation                          |
| Every region decorated as a card                             | Surface roles and recipes; optional contextual warning   |
| Broad transitions or excessive motion                        | Explicit allowed property lists and named motion choices |
| Clipped text, horizontal page overflow or offscreen overlays | Rendered checks in declared states                       |
| Unlabeled controls or broken keyboard/focus behavior         | Component contracts plus browser interaction assertions  |
| Unstable numeric columns                                     | Opt-in tabular/alignment contracts                       |

Reuse `@creaseui/lint/rendered`, its minimal host-page interface, pinned optional
engine and existing report semantics. Listed interaction rule IDs are not proof
that keyboard flows already ran. Add actual assertions for applicable focus,
navigation, dismissal, validation and state updates.

Components emit versioned metadata automatically. Reuse meaningful `data-ui-*`
attributes and add Crease contract IDs/region IDs where needed. Consumers should
not decorate every node manually. ActionGroup spacing, nested radius, numeric
alignment and overflow ownership are relationship contracts, not global guesses.
Missing/malformed required metadata produces a finding.

Move the generic runner into the package with configurable URLs, readiness,
themes, viewports and named state callbacks. Suggested binary:
`creaseui-lint audit --config creaseui-lint.config.mjs`. Reuse reports with exit
0 for a complete passing run, 1 for findings, and 2 for setup or incomplete
execution. A report-only option may change finding severity, never incomplete
coverage into success.

Start with isolated Button, form controls, Combobox and an overlay, then settings
and dashboard recipes. Cover light/dark, narrow/desktop, long content, loading,
disabled, invalid and applicable open/focused states. Include RTL/reduced motion
where relevant. Broken fixtures must prove every enabled measurement can fail.
Document unchecked frames, shadow roots, unvisited states and unresolved
measurements; do not claim complete coverage from a main-document audit.

The documentation catalog has known findings and intentional variants. Keep its
classified baseline separate from clean consumer fixtures. Do not raise warning
caps, disable contrast globally or allow zero gaps everywhere to produce green.

## Packaging and setup

Ship source lint with no browser startup/download and no eager import of rendered
dependencies. Preserve optional rendered tooling. Declare tested ESLint/parser,
TypeScript, Node, Playwright and engine compatibility instead of relying on this
checkout's dependencies. A consumer already using Playwright should use its host
installation; audit setup failures must explain missing tooling/browser binaries.

Add `creaseui-lint init` and `creaseui-lint doctor` alongside the later audit
command. Integrate with planned Crease setup/doctor through a shared configuration
reader rather than duplicating component installation logic. `init` produces a
minimal diff or a standalone config fragment when arbitrary existing ESLint code
cannot be safely amended. It must never replace the consumer's configuration.

`doctor` validates receipt schema, compatibility, renderer, aliases, parser/type
coverage, implementation paths, replacement coverage and effective config for
representative files. Report unknown or uncovered UI source modules. Inventory
exceptions and disables. Use ESLint's unused-disable reporting; require specific
reasons for Crease suppressions. Do not add a broad generated-files exclusion
that includes installed renderer source.

Test the npm tarball from a fresh directory for each renderer, with alternate
aliases and installed directories, an existing flat config and both npm and a
second package manager. Check public exports and type declarations, custom
component/theme registration and upgrade receipts. Consumer examples must be
complete Foldkit programs with identical behavior and displayed code across
renderers. Compile extracted documentation programs, not just the site build.

## Required source test matrix

| Case                                                                                       | Expected result                                              |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Raw control, container, heading, text, list, link or form in application                   | Error with the actual replacement or install instruction     |
| Renamed builder, alias, destructuring, constant computed member                            | Same error as the direct call                                |
| `h.keyed('button')`, inert builder or mapped headless view reference                       | Rendering-boundary error                                     |
| Unrelated object named h/Button/layout, including lexical shadowing                        | No false component/builder diagnostic                        |
| Styled component imported via alias, relative path or re-export                            | Allowed and component contract checked                       |
| Local feature helper using approved composition                                            | Allowed without registry registration                        |
| External Html producer or internal raw behavior renderer in application                    | Unapproved-renderer error                                    |
| Raw call inside its registered implementation                                              | Allowed; token/style violations there still fail             |
| Same call in a nearby unregistered wrapper                                                 | Error                                                        |
| Unknown tag access, forged placement or opaque UI props spread                             | Unverifiable-contract error                                  |
| Typed finite runtime variant, business data, valid resolved spread                         | Allowed                                                      |
| Direct string children in Box/Stack/Inline/Grid                                            | Content-contract error; Text or a typography helper passes   |
| Component appearance props, selector classes or renamed style factory                      | Error                                                        |
| Layout contract tries padding/background/font/shadow/motion                                | Error in all renderers                                       |
| Raw HTML, generic class/style attributes, unregistered CSS or alternate VNode construction | Styling/rendering escape error where provenance is supported |
| Html types, Messages, init/update, IDs, empty/lazy/Submodel transport                      | Allowed; render callback bodies remain checked               |
| Registered chart/icon adapter and named theme customization                                | Allowed under its specific contract                          |
| Missing type service, wrong renderer, bad/outside-root ownership or conflicting records    | Setup/configuration failure rather than a clean result       |

For conditional/spread analysis, include overwrite order, nested scopes,
re-exports, cycles, mutation, `any`, assertions and unknown computed keys. Include
negative examples that preserve raw styling violations inside exempt files.
Assert diagnostic rule IDs, locations and replacement guidance, not only counts.

## Ordered implementation work items

Every item follows the objective/scope/input/state/API/behavior/evidence/migration
format in the agent protocol. The following boundaries keep commits reviewable.

### Work item 1 Shared resolver and ownership configuration

Objective: resolve real component/builder identities and exact file ownership in
a standalone consumer. Scope: lint package internals, proposed config/receipt
schemas, focused tests and package documentation. Inspect existing
`lib/foldkit-sites.js` and `lib/pleat-sites.js`; keep exported helpers compatible.

Add `creaseui()`, configuration validation, lexical/type resolution and cached
contract lookup. Implement a minimal fixture receipt first; then connect it to
registry metadata generation and install destinations. No UI behavior/state change.
Evidence: aliases, re-exports, shadowing, exact exceptions, schema/path failures
and a packed-package fixture. A missing resolver feature must remain visible.

### Work item 2 Full source rendering and appearance boundary

Objective: enforce all strict application rules, including layout and text.
Scope: lint rules, shared contract policy, tests and rule documentation. Add the
new rule IDs with compatibility adapters for overlapping existing rules.

Use real baseline Foldkit/headless exports. Separate rendering from state/type
utilities. Support finite runtime props and useful unresolved diagnostics.
Evidence: the complete source test matrix above, TypeScript declarations and
three renderer fixtures. Do not publish a weakened preset while replacements
are incomplete; mark the replacement dependencies explicitly.

### Work item 3 Composition parity and installable replacements

Objective: a realistic settings page and dashboard/data page can use strict
composition entirely in all three renderers. Scope: shared composition contracts,
missing renderer adapters, necessary controls, recipes, registry generators and
complete consumer/documentation programs.

Audit existing choices; avoid duplicating state behavior. Coordinate Pleat against
the revised PR. Evidence: shared type/variant tests, semantic DOM and selected
computed-style parity, keyboard/interaction tests for affected controls, extracted
example compilation and clean registry installations. Missing specialized
integrations remain documented adapter requirements.

### Work item 4 Consumer setup and first source release gate

Objective: install the optional add-on and enable full strict lint without
repository-specific assumptions. Scope: init/doctor, dependency/export/package
metadata, consumer fixtures, setup docs and CI.

Items 1 through 4 together form the first source-lint delivery. It must work for
Tailwind, StyleX and Pleat with complete ordinary replacements. Verify tarball
installation, existing config preservation, both package managers, effective
scope coverage and customization. Do not publish or merge as part of planning;
leave the implementation concrete and reviewable.

### Work item 5 Rendered contracts and portable audit runner

Objective: clean isolated components/recipes pass a declared browser matrix and
broken fixtures fail. Scope: component metadata, shared rendered policy, optional
CLI and browser/interaction fixtures. Reuse the current SDK and report format.

Evidence includes real measurements, engine/policy provenance, coverage outcomes,
interaction assertions and exit-code tests. Report unresolved/unsupported states
and preserve the separate docs baseline.

### Work item 6 Broader guidance and adoption

Objective: strengthen common UI defaults using classified evidence. Scope:
contextual advisory rules, documented theme policies, baseline cleanup and
migration guides. Avoid arbitrary universal decoration/copy bans.

Evidence: each new rule has valid and broken fixtures, limitations, meaningful
diagnostics and measured false-positive review. Tighten warning budgets by
fixing categories; do not raise them to hide new failures.

## First assignment to give the implementation agent

This is the first source-lint assignment after R0 and agreement on the shared
policy/ownership contracts. For the complete styling and lint assignment, use
the starting prompt in the combined handoff, which begins with theme reliability.

Implement work items 1 and 2 as the first bounded PR. Read the existing planning
and architecture contracts first. Deliver the proposed `creaseui()` factory,
validated exact-file ownership, shared binding/type resolver and the full strict
source rule set. Include raw controls, layout and text immediately. Preserve
existing renderer helpers and optional rendered exports. Provide packed consumer
fixtures for all three renderers, with explicit missing replacement dependencies.

Preserve the revised Pleat port and existing component state ownership. Keep
component/composition changes in R2 rather than hiding them in the resolver PR.
Do not publish the package or claim the first consumer release is finished.
Record what item 3 needs to make strict pages practical, then complete items 3
and 4 against the reconciled renderer baseline. Report completed contracts,
exact evidence paths, compatibility versions, unresolved analysis cases and the
next bounded task.

Acceptance for the first PR: a raw button/div/heading/link/form fails, a composed
feature passes, an exact implementation exception allows raw rendering while
still rejecting styling violations, aliases cannot bypass the rules, shadowing
does not cause false positives, and a fresh packed consumer can run the same
checks outside this repository. Any unsupported analysis path produces a clear
diagnostic. No files outside the agreed scope are overwritten.
