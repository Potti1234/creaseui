# Shared theme contract and scoped styling plan

Date: 2026-10-13. Work package: R1. Status: proposed implementation.

Make the selected theme control the complete visual system in Tailwind, StyleX
and Pleat, including interactive colors and overlays. Build on the existing
token machinery while replacing independently maintained definitions and partial
scope bindings. This establishes the input for component coverage, authoring
lint and rendered checks.

## Problem and source inputs

The [design review](../reviews/pleat-pr-27-design-consistency.md) reproduced
emerald/blue primary buttons reverting to neutral on hover in the Pleat and
StyleX Create boards. Their scoped bindings omit the Button's derived hover
token. Existing composition theme scopes bind only part of the visual system.
Control-height tokens exist without corresponding control consumers. Fourteen
of 50 sampled primary color pairs fell below the normal-text contrast threshold.

Inspect the current equivalents of `src/demo/create-preset.ts`,
`src/demo/board-pleat.ts`, `src/demo/board-stylex.ts`, all three renderer token
modules, foundation/complex/overlay tokens, composition semantic themes and
interaction tokens. Verify the installed `@pleat/core` and StyleX APIs rather
than assuming historical imports or planning snippets remain valid.

## Canonical contract

Create one renderer-neutral, versioned schema and default theme. Existing
compatible semantic CSS names remain supported through a documented mapping.
Do not add a hidden runtime service or move application state into theme code.

| Area         | Required roles                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Palette      | Canvas, surface, elevated surface, foregrounds, muted content, borders, primary/secondary/destructive actions, selection and focus |
| State colors | Resting, hover, pressed, selected, invalid and other applicable foreground/background pairs                                        |
| Status       | Success, warning, error and info independent of chart palette choices                                                              |
| Shape        | Single-line and multiline controls, panels, overlays, selection indicators and intentional pills/circles                           |
| Density      | Control role and named size, horizontal/vertical padding, icon size, menu/list rows, field spacing and region spacing              |
| Typography   | Body, label, supporting text, headings, weights, line heights, numeric treatment and font families                                 |
| Surfaces     | Border weights, separators, shadows, elevation and documented layer relationships                                                  |
| Motion       | Named durations, easing, allowed animated properties and reduced-motion treatment                                                  |

Represent token kinds and aliases explicitly. Reject unknown roles, incompatible
value kinds, missing required resolved roles, alias cycles and unsupported schema
versions. Registered theme definitions may contain brand literals; component
implementations consume semantic roles and finite variants. Define narrow
structural constants separately from themed appearance.

The illustrative concepts `ThemeDefinition`, `ThemePatch`, `ResolvedTheme` and
`ThemeScope` are proposed API concepts. Choose actual export names after auditing
current APIs and add migration aliases where useful.

## Resolution and customization

Resolve a complete default theme, then the selected preset, then explicit axis
choices, then a registered custom patch. Make precedence deterministic and
document it. The color mode selects the matching palette branch; it must not
silently reset shape, density or typography choices. A nested scope applies its
explicit patch to its declared parent theme and recomputes dependent roles.

Partial patches are allowed because the resolved theme is complete. Require
explicit component-role overrides for an intentional exception; arbitrary
per-call CSS is not a theme extension. Size resolution includes component role,
density and named size. Preserve `xs`/`sm`/`lg` semantics without allowing an
ambient density change to discard the consumer's explicit size choice.

Record current Nova metrics before migration. Existing Button and Input default
heights differ; the contract may preserve this where intentional. Do not force
all controls to one height to manufacture parity. Coordinated rows get their
own declared relationship contract.

## Renderer adapters

| Adapter  | Required implementation                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| Tailwind | Consume the canonical semantic variables through static classes and registered theme/reset CSS                        |
| StyleX   | Derive variable definitions and complete scoped assignments from the canonical roles; retain compiler-safe extraction |
| Pleat    | Map canonical roles to typed token specs and complete theme bindings using the actual installed Theme APIs            |

Adapters must enumerate the complete required role set. Use exhaustive typed
maps or generators, and fail when one adapter omits a role. Avoid hand-maintained
lists in Create, docs, recipes and components. Reuse one binding mechanism for
root, nested preview and installed consumer themes.

Resolve derived values at the scope where their dependencies change. Either
rebind derived CSS expressions at each complete scope or emit resolved state
values from the already merged theme. A root-resolved derived variable must not
be inherited as though it depends on the nested palette. Validate both primary
and secondary state consumers; fixing only one Button token is insufficient.

Generated modules declare their inputs/generator and are checked for drift.
Generation must be deterministic on Windows and Linux, without executing browser
StyleX initialization during Node-only example or metadata generation.

## Theme scope and overlays

Provide a complete visual scope usable through approved Crease composition. Keep
the existing partial composition scope compatible or migrate it explicitly;
document the difference until all required roles are bound.

Theme selection is a parent-owned input. Theme rendering remains pure. Ordinary
descendants inherit their closest visual scope. Native top-layer elements that
retain DOM ancestry should use that inheritance rather than an unnecessary new
portal mechanism.

For content genuinely mounted outside that ancestry, the overlay integration
must receive the owning resolved theme/scope identity explicitly and bind it at
the detached root. Inspect actual Foldkit mounting APIs before choosing the
mechanism. Do not install global mutable theme context or read browser state in
views. Changing the owning theme while an overlay is open must update styling
without resetting selection, focus or the child Model. Closing/removing an
overlay must leave no leaked theme bindings.

Test two differently themed instances, nested scopes, root dark-mode changes,
open menu/dialog updates, and repeated mount/unmount. Include focus, invalid,
selected and hover roles, not only resting backgrounds.

## Palette and contrast validation

Pair foregrounds with their actual surfaces for each accent and both modes.
Validate normal enabled text at 4.5:1 and large text at 3:1 under the applicable
[WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Classify large text from actual size/weight, not component names. Disabled content
must be recorded distinctly rather than used as a blanket contrast suppression.

Use a deterministic palette validator for all declared color branches and a
browser validator for resolved CSS, alpha blending and interactive states.
Browser checks composite translucent surfaces against their actual backdrop.
Gradients, images or unsupported paints require a supported measurement path or
an unresolved result, never a fabricated pass. Test focus/non-text indicators
under the applicable policy independently from text contrast.

Choose accessible foreground/background pairs in palette definitions. Do not
recolor isolated Button instances or lower thresholds to preserve a failing
palette. Prevent chart theme changes from altering status semantics implicitly.

## Work item and delivery evidence

**Objective:** complete, scope-correct visual themes with the known hover and
palette regressions protected permanently.

**Scope:** shared theme definitions/resolver, renderer token adapters, visual
scope API, necessary overlay integration, Create export integration, focused
tests, registry/theme generators and theme documentation. Include explicit
DataTable left alignment in the first regression slice where it remains broken;
test all declared alignments in LTR/RTL and inherited alignment contexts.

**Inputs:** R0 baseline, reviewed token consumers, exact installed styling APIs,
current theme/export format and current component metrics.

**State ownership:** existing component/application ownership remains intact;
theme choices are per-render parent inputs.

**Public API:** versioned theme schema, registered patches and complete scope;
preserve legacy CSS aliases and partial-scope callers through documented migration.

**Behavior contract:** theme changes retain values, focus, overlay lifecycle,
primitive positioning and reduced-motion correctness.

**Evidence:** missing-role/cycle/type failures, three exhaustive adapter checks,
emerald/blue hover in each renderer, secondary/selected/invalid/focus states,
nested and detached-root scope behavior, all palette branches, exported preset
equivalence and a clean production consumer with its required CSS loaded.

**Migration:** generate a mapping of old tokens to roles and remove manual scoped
lists only after their consumers use the replacement. Intentional visual changes
need before/after evidence and release notes.

**Stop conditions:** an unresolved Foldkit lifecycle limitation, incompatible
public schema break without migration, or conflict with unrelated consumer work.

## Acceptance checklist

- [ ] Each resolved theme has every required role and every adapter binds it.
- [ ] Nested palette changes update all derived state colors in all renderers.
- [ ] Two theme scopes and open overlays remain independent and update correctly.
- [ ] All declared accent/mode branches pass supported palette checks.
- [ ] Geometry/motion roles have real consumer proof in the first component slice.
- [ ] Explicit DataTable alignment has an exhaustive browser regression test.
- [ ] Create preview and exported installation resolve the same theme choices.
- [ ] Clean consumers render with complete CSS without the documentation shell.
- [ ] Public changes, generators and focused evidence are documented together.
