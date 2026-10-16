# Repair the tutorial's component and styling boundaries

2026-10-15. Status: inspected failure analysis and implementation plan. The checks
below are proposed work, not capabilities already delivered by the lint package.
This repair precedes additional chapters and a frozen tutorial checkpoint.

The attempt is now preserved in creaseui-demo on archive/tutorial-attempt-01 at
f723c380ca66da05acca50727b0f210949840342. Keep it as the counterexample. For normal
project startup, use the [registry discovery follow-up](shadcn-registry-and-foldkit-discovery-plan.md):
the agent should discover and compose real components without requiring users to
prepare a product-specific component map or install a dashboard scaffold.

## What failed

The local creaseui-demo slice demonstrates useful interactions and a promising
visual direction, but not the intended source architecture. Passing visual and
workflow checks did not establish architectural correctness.

The inspected foundation is Crease PR 28 commit
244b4c79cf901a28f7e2e8d57a9b4dd59aaee390. This assessment does not describe later PR
commits. Keep upstream fixes and demo repair separate.

| Observed evidence                                                                                                                          | Consequence                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| src/styles.css has about 1,230 lines, mostly component selectors after the theme/base declarations                                         | Appearance belongs to a global cascade rather than the source component being customized |
| src/ui/button.ts maps taskPrimary to product-action/action-primary CSS hooks; other appearances do the same                                | A finite API exists, but the component source does not include its full styling          |
| src/design/shell.ts builds navigation with native aside/nav/div and generic Button variants                                                | The product bypasses Crease Sidebar instead of adapting its owned source                 |
| crease-source.json and scripts/refresh-crease.mjs select thirteen artifacts, without Sidebar                                               | Our install selection omitted an available foundation                                    |
| ESLint.calculateConfigForFile returns no configuration for src/design/shell.ts, src/ui/button.ts and src/styles.css; isPathIgnored is true | Those implementations and CSS never participated in the demo's lint gate                 |
| scripts/write-contracts.mjs grants rawRendering to all five product design source files                                                    | Compositions and actual low-level implementations receive the same broad capability      |
| AGENTS.md and README.md explicitly allowed product styles in styles.css                                                                    | Our instructions reinforced the mistake                                                  |

The pinned src/ui/sidebar.ts already has provider, header, content, footer,
groups, menu items, active menu buttons and badges. Its static collapsible: 'none'
mode means reuse does not require implementing collapse/mobile state for this
slice. src/demo/cards/sidebar-nav.ts demonstrates composition.

The owned Sidebar may still need local changes for product geometry and explicit
current-page semantics. That is normal customization, not evidence that the base
component cannot work.

## Responsibility and causes

We optimized for tuning the first screenshot, created a central CSS vocabulary,
then wrapped it in closed product APIs. This was an implementation choice contrary
to the source-owned Tailwind tutorial, not a Foldkit requirement.

We also skipped a reuse inventory. Installing a small selected subset made
rebuilding other parts convenient. No documented technical blocker justified
rebuilding Sidebar.

The tooling let both errors survive. Exact-file ownership is better than a
directory wildcard, but the demo globally ignores those exact files. That bypasses
even the renderer checks the strict preset would attach to implementations.
In the pinned package, rawRendering also bypasses the raw rendering rules for
the whole registered file. Neither registration nor a closed API proves that
a component uses its intended foundation or owns its appearance.

The repairs therefore cover implementation, task instructions, checked authoring,
CSS analysis and reuse evidence. A shorter stylesheet alone would not fix them.

## Intended ownership

| Layer                 | May do                                                                                                           | Must not do                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Global theme/base     | Framework/font imports, semantic theme values/bindings, narrowly defined reset/document rules                    | Define component classes, component focus/hover rules or slot overrides                  |
| Adapted Crease source | Own Tailwind style maps, variants, native/primitive semantics and necessary geometry                             | Depend on app-wide selector overrides or expose unrestricted feature styling             |
| Product patterns      | Compose foundations into navigation, rows, pickers and creation; own product-specific appearance in their source | Get blanket raw-control privileges or rebuild available components for convenience       |
| Features              | Supply data/events and compose the product vocabulary                                                            | Import styling tools, raw renderers or implementation APIs, or pass appearance overrides |

For Tailwind, ordinary styling lives beside the owning view/variant map in
TypeScript. A rare authored CSS requirement can use a registered colocated scoped
stylesheet with checked selectors/imports. Splitting the same global cascade
into many imported files is not a repair.

Use semantic tokens for shared decisions, without making every local constant
global. Keep component-owned runtime geometry, Foldkit positioning and primitive
attributes valid at their precise implementation boundary.

## 1. Inventory before repair

Map every visible pattern to an installed artifact or registry candidate. Record
the source pin, reused exports, local changes and any real limitation.

| Demo area                                                     | Repair starting point                                                                                    |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Workspace navigation                                          | Install/adapt Sidebar and its menu/group/header/footer parts                                             |
| Shortcut labels                                               | Inspect/adapt Kbd instead of a new raw kbd helper                                                        |
| Search with icon/shortcut                                     | Inspect InputGroup and its control/addon parts                                                           |
| Issue labels                                                  | Adapt the already installed Badge                                                                        |
| Generic layout/text                                           | Use installed Stack, Heading and Text where applicable; report missing semantic composition capabilities |
| Group disclosure                                              | Evaluate Collapsible against controlled state, focus and mounted-content requirements                    |
| Reset confirmation                                            | Evaluate AlertDialog for initial focus, cancellation and destructive-action behavior                     |
| Issue identity, status/priority glyphs, issue-row composition | Legitimate product-specific work; reuse applicable foundations                                           |

These are candidates, not claims that every API fits unchanged. Read the exact
sources. Change owned source or propose a small upstream improvement when a
semantic prop is missing. Do not silently fall back to raw markup, or force a
table/card when the appropriate product structure is a list.

An unused import, renamed custom implementation or 'based on Sidebar' declaration
is not evidence of reuse.

## 2. Repair the existing slice

1. Keep current screenshots, behavior evidence and source pin for comparison;
   they are not accepted architecture or approved visual regression baselines.
2. Install missing candidates through the pinned registry. Preview dependencies
   and preserve customized Button/Dialog/Menu sources; do not overwrite everything.
3. Pilot the repair with Sidebar: adapt its source styling, compose the workspace
   from its parts, preserve navigation/counts/current-page semantics, and remove
   superseded taskNavigation/taskSearch duplication.
4. Put Button/Input/Textarea/Dialog/Menu appearance in their Tailwind source.
   Consolidate base, size and variant choices rather than stacking overrides
   on conflicting defaults.
5. Migrate remaining patterns and relevant foundation parts. Split mixed files
   when only one small implementation needs raw rendering.
6. Reduce styles.css to permitted theme/base content; consolidate shared
   appearance values into appropriate semantic roles.
7. Update contracts, provenance, examples and instructions together. Preserve
   after-commit focus, menu key handling and persistence behavior.
8. Compare the real list/menu/composer and rerun affected workflows.

Do not freeze a tutorial branch while this repair is open.

## 3. Check authoring instead of ignoring it

Extend the existing ownership/contract model, without creating another authority
for the same component identities.

- Remove global ignores of owned source. Classification selects applicable rules
  rather than exempting a file from lint.
- Pure product compositions receive no raw-rendering grant.
- Refine implementation permissions to the necessary component/export and
  native/primitive responsibilities. A helper drawing an SVG must not grant
  unrelated controls to every export in its file.
- Keep token, finite variant, contract and supported renderer checks active in
  authorized implementations. Add authoring checks where the current preset
  does not cover the responsibility.
- Include authored CSS and its imports in ownership/coverage. Diagnose unknown
  files and supported but unresolved imports.
- Report incomplete authoring coverage explicitly. A feature-only pass cannot
  claim complete design-system enforcement.

Do not ban native elements everywhere. Actual base components need them, along
with headless primitive attributes. Each implementation should have only the
responsibilities it owns.

## 4. Enforce CSS ownership

Add a CSS-aware consumer check using a real parser. TypeScript-only ESLint cannot
enforce CSS. Specify supported Tailwind syntax and nesting rather than checking
selectors with regular expressions.

- Permit identified framework/font imports, theme bindings and finite base
  selectors with permitted property sets.
- Check declarations inside :root/@theme too; these cannot allow arbitrary
  component styling or nested component selectors.
- Reject component classes and role/slot/descendant overrides in the theme entry,
  including selectors hidden under @layer, @media, nesting or imports.
- Follow authored imports. A file called 'base' cannot launder component styling.
- Register rare component stylesheets to exact owners and require scoped
  selectors rather than overrides of another component's internals.
- Distinguish generated Tailwind output, vendor inputs and build artifacts from
  authored source. Allowed external inputs must be explicit.
- Check feature style imports, inline styles and runtime stylesheet injection
  in supported analyzable cases. Diagnose supported but unprovable cases rather
  than silently accepting them; external widgets need bounded adapters.

A line limit is not the criterion. A short global override can break ownership;
a complex self-contained component can legitimately contain many lines.

## 5. Make reuse discoverable and verifiable

Provide versioned registry export/slot inventories, composition recipes,
customization examples and installation dependencies. An agent should find
Sidebar before writing a new styled navigation container.

Extend existing artifact contracts with foundation dependencies where needed.
A product Sidebar should identify the actual Sidebar parts it composes, or
be an in-place adaptation of the installed artifact. Verify resolved calls
reachable from the relevant rendering export, not merely imports or comments.
Use the binding-aware resolver for aliases/re-exports; diagnose unsupported
dynamic resolution honestly.

This detects missing declared composition and many bypasses. It cannot prove
that arbitrary code is semantically a reinvented Sidebar. Keep the inventory,
source diff and behavior review as separate evidence. Do not require every new
component to contain Button, or forbid genuinely new product patterns.

Preserve upstream provenance plus local adaptations. Edited components need not
retain the original hash. A changed hash informs upgrade/diff work, rather than
automatically granting an exemption or forbidding customization.

## 6. Separate feature tasks from system tasks

Feature tasks use the approved vocabulary. System tasks can edit named components,
tokens and contracts, with broader checks. Consumers remain free to customize
their owned components.

An ordinary feature task must not become unchecked by editing rawRendering,
ignores, the lint command or ownership metadata. Evaluate those diffs against
the existing task scope. Use runner filesystem restrictions where available;
otherwise state that task instructions are advisory.

Integration checks must use a trusted baseline/configuration or independently
validate enforcement-input changes. Running only a self-modified lint script is
not independent enforcement. Owner review/protected checks can control integration;
local ESLint is not a security sandbox. Normal consumer edits do not require
upstream maintainer approval.

## Required misuse and positive fixtures

| Case                                                                         | Required result                                                            |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Component selector appended to theme CSS                                     | Fail                                                                       |
| Same selector behind nesting, @media, @layer or a local import               | Fail                                                                       |
| Raw color/arbitrary appearance contrary to the authorized component's policy | Fail                                                                       |
| Feature imports component CSS or injects styles                              | Fail or explicit unresolved diagnostic for a supported but unprovable case |
| Pure product composition requests raw controls                               | Reject unnecessary capability                                              |
| Raw navigation replaces foundations inside an existing approved product file | Fail applicable authoring/reuse checks                                     |
| Unused Sidebar import with custom navigation rendered instead                | Does not satisfy declared composition                                      |
| Feature task changes rawRendering, ignores or the quality command            | Fail independent scope/policy check                                        |
| Owned component missing from effective source/CSS coverage                   | Incomplete/failing quality gate                                            |
| Adapted Sidebar with named variants and resolved composition                 | Pass                                                                       |
| Tokens-only theme with documented base rules                                 | Pass                                                                       |
| Product-specific issue/status pattern using permitted foundations            | Pass                                                                       |
| Narrow primitive rendering and component runtime positioning                 | Pass                                                                       |
| Customized component differs from upstream hash                              | Pass applicable checks; retain provenance                                  |

Use negative fixtures: positive lint/build/browser checks missed this failure.
Behavior tests should verify actual interaction, not mirror class strings.

## Tutorial correction and completion evidence

Teach this boundary before asking an agent to add features. Show the global CSS
shortcut, why a closed API did not establish ownership, the reuse inventory and
Sidebar repair. Include a complete system change and a feature-only change under
the two checked scopes.

Completion requires the inventory, real Sidebar adaptation, component-owned
Tailwind styling, permitted theme/base CSS, effective authoring coverage, passing
positive/failing misuse fixtures and actual diagnostics. Recheck focus, navigation,
menus, creation, persistence and new foundation behavior. Review the rendered list,
menu and composer. Update complete runnable examples, provenance and limitations.

Do not describe this plan, finite props, a source hash or a screenshot as proof
that these gates have been implemented.
