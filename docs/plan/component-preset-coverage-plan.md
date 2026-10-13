# Component preset coverage and composition parity plan

Date: 2026-10-13. Work package: R2. Status: proposed implementation.

Make every supported component consume the shared design roles it needs, and
provide ordinary composition replacements so strict applications can use Crease
for controls, layout and text. This work builds on
[the theme contract](theme-contract-and-scoping-plan.md) and supplies the
component metadata consumed by source lint and browser checks.

## Current gaps and implementation inputs

The [design review](../reviews/pleat-pr-27-design-consistency.md) found that the
eight Create style presets mostly patch Button, Input and Card. Select and
Textarea retain inconsistent shape, borders, typography or elevation. Compact
semantic control tokens are declared but not consumed by controls.

Inspect the actual current catalog, registry generators, `src/ui`, `src/stylex`,
`src/pleat`, shared behavior modules, composition directories, authored examples
and `src/demo/create-preset.ts`. Treat existing catalog counts and file layouts
as baseline inputs rather than fixed future schemas. Preserve the fixes already
present in the revised Pleat PR.

## One component contract inventory

Extend existing artifact, parity and registry metadata with one canonical
styling/composition contract. Generate renderer coverage and lint metadata from
it; do not maintain a separate handwritten lint inventory.

For each public component or recipe, record:

- Classification, public render exports, shared behavior source and renderer files.
- Semantic parts, native semantics and primitive-owned attributes/geometry.
- Finite variants, named sizes, density support and responsive choices.
- Applicable hover/focus/pressed/selected/open/disabled/read-only/loading/invalid states.
- The roles each part consumes: color, type, dimensions, spacing, shape,
  border/elevation and motion.
- Parent-placement inputs, owned appearance, content slots and raw replacements.
- Required rendered relationship metadata and installed dependencies.
- Intentional exceptions, with reason, scope, contract version and test evidence.
- Coverage evidence by renderer, choice and state; unresolved roles remain visible.

Use exhaustive finite-choice declarations. A new public variant, part or renderer
requires a corresponding adapter and evidence entry. An empty implementation,
unused token declaration or unconditional status marker cannot satisfy coverage.

## Preset design decisions

Retain existing preset IDs and explicitly define their complete treatment.
The following is the implementation direction, not a claim that coverage exists.

| Preset | Whole-system contract to implement                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Nova   | Documented default role values; preserve approved baseline metrics                                             |
| Vega   | Flat control/surface elevation while preserving understandable floating-overlay hierarchy                      |
| Maia   | Rounded single-line controls and coordinated multiline/panel/overlay shapes; declare pills/circles by purpose  |
| Lyra   | Square applicable controls, panels and overlays; persistent pill/circle exceptions remain explicit             |
| Mira   | Coherent compact control, row and spacing geometry with readable typography and usable targets                 |
| Luma   | Coordinated soft elevation across applicable controls and surfaces                                             |
| Sera   | Consistent stronger outlines and separators across applicable control/surface roles                            |
| Rhea   | Coordinated larger control/row sizes and intentional region spacing; avoid accidental four-pixel panel padding |

Create explicit role values and expected relationships for these profiles.
Remove the three-component selector patches after their effects are represented
by the canonical theme/preset contract. Do not replace them with a larger
unbounded selector stylesheet. Preview and exported installation use the same
resolver and preset definitions.

Palette, radius, density, font, menu accent and menu surface are independent
choices where the current product exposes them. Record precedence with the
theme resolver. Test interactions among axes through representative combinations
and complete cheap schema/palette validation; avoid claiming every combination
was captured when only the base preset was tested.

Consistency means intentional relationships. Switch tracks, avatars, circular
indicators and multiline inputs can have distinct shapes. Table scrolling can
be intentional within its declared region. Register these contracts rather than
globally suppressing radius or overflow checks.

## Migration waves

| Wave | Components and required result                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Button, Input, Textarea, Native Select, styled Select trigger/content, Field and Input Group; one coherent mixed form across all presets |
| 2    | Checkbox, Switch, Radio Group, Toggle, action groups, Text/typography and basic composition; coordinated sizing, labels and focus        |
| 3    | Card, Alert, badges, tables/DataTable, lists and menu rows; surfaces, numeric alignment and status roles                                 |
| 4    | Dialog, Popover, menus, Tooltip, Sheet, Drawer, Hover Card and related overlays; complete scope, elevation and motion roles              |
| 5    | Tabs, Accordion, Calendar/Date Picker, navigation, Sidebar and remaining catalog/recipes; close every inventory gap                      |

Inspect shared dependencies before ordering individual components. Do not modify
a behavioral state machine merely because its skin needs tokens. Shared behavior,
ARIA, event translation and primitive geometry stay canonical across renderers.
If an existing component needs an architectural migration, keep it a separate
bounded work item under the numbered roadmap.

For each wave, characterize Nova first, add missing-role and changed-role browser
checks, migrate one complete component slice across all renderers, update examples
and installation output, then verify every finite choice and applicable state.
Add R3 regressions in the same slice; do not defer evidence until wave 5.

## Strict composition replacements

Reconcile the existing composition API rather than adding three independent
wrapper vocabularies. Move shared public types to a renderer-neutral location
where appropriate, with compatibility re-exports for existing import paths.

| Ordinary application need   | Required installed replacement                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| Regions and arrangement     | Box, Stack, Inline, Grid, Section and page/shell recipes with semantic elements and responsive choices |
| Text and headings           | Text/typography helpers with semantic element, role, tone, weight and finite type choices              |
| Navigation and submission   | Styled Link and Form preserving native semantics and Foldkit message translation                       |
| Lists and descriptions      | Semantic list/item/description helpers or equivalent approved composition options                      |
| Tabular and numeric content | Table/DataTable and numeric display/alignment contracts                                                |
| Action relationships        | Normal, joined and dense groups with distinct spacing/target contracts                                 |
| Media and supporting parts  | Icons, images and separators with dimensions and applicable labels                                     |
| Rich or specialized output  | Explicit rich-content/chart/canvas/editor/integration adapters when those features are used            |

Missing ordinary replacements block the first strict source-lint release.
Consumers install only the items and dependencies they use; they do not need the
whole catalog to lint a Button page. Specialized adapters are required for
specialized output, without obliging the first release to implement every
possible third-party integration.

Strings remain valid in component-owned labels and content slots such as Button
children or Field descriptions. In strict application composition,
Box/Stack/Inline/Grid children use approved Html output; ordinary text is rendered
through Text/typography. Do not lint domain strings, URLs, Messages or model data
as though they were raw typography.

Parent placement controls arrangement within a finite contract. Appearance,
internal padding, control gaps, typography, border/radius/shadow and motion belong
to components or themes. Preserve legitimate behavior attributes and inline
positioning; replace unsafe appearance slots with a documented compatibility path.

## Documentation and source parity

Every renderer gets the same example titles, descriptions, order, domain data,
initial state and interaction behavior. Displayed source contains the complete
Foldkit program: Model, Message, init, update, view, runtime and applicable
subscriptions, Commands and OutMessage handling. A single component invocation
does not satisfy the example contract.

Renderer-specific imports and styling adapters may differ; code presentation,
Show Code behavior and source completeness remain equivalent. Compile extracted
displayed programs against the installed baseline. Verify real preview providers
use their declared renderer and do not fall back to a different implementation.
Node-safe metadata generation must not execute browser-only compiler setup.

Update the shared documentation-parity machinery instead of creating a separate
Pleat-only documentation format. Historical two-renderer plans apply to all three
renderers for this workstream.

## Work item and delivery evidence

**Objective:** complete semantic preset consumption and usable strict composition
in all three renderers.

**Scope:** shared component contracts, relevant renderer skins, composition
types/helpers, preset resolver integration, authored examples, metadata/registry
generators and focused tests. Avoid unrelated catalog expansion or branding work.

**Inputs:** R0 inventory, R1 roles and resolver, exact Foldkit primitives,
current metrics and existing source-lint component contracts.

**State ownership:** preserve parent-owned durable values and existing child
interaction Models. Theme/variant/placement remain view inputs.

**Public API:** equivalent finite composition/variant choices, installed
replacement exports and contract metadata. Document changes to appearance slots.

**Behavior contract:** preserve native semantics, labels, form submission,
keyboard operation, focus, RTL, responsive containment and primitive geometry.

**Evidence:** complete role/choice coverage, meaningful computed styles when a
role changes, paired renderer fixtures, affected interactions, complete copied
program compilation, generated registry output and clean settings/dashboard
consumers. Use [the R3 plan](renderer-regression-and-ci-plan.md) for matrix rules.

**Migration:** retain compatible imports and named variants where possible.
Provide old/new examples for restricted slots and changed preset values.

**Stop conditions:** a required behavior redesign, unresolved semantic choice
that changes component purpose, or conflicting source-owned edits. Intentional
shape exceptions and ordinary finite-role choices are covered by this plan.

## Acceptance checklist

- [ ] All current catalog parts have applicable roles or justified exceptions.
- [ ] Every finite choice is represented in all supported renderer contracts.
- [ ] No claimed theme capability relies only on an unused token declaration.
- [ ] All eight presets affect the applicable mixed-form controls coherently.
- [ ] Settings and dashboard/data-page programs use strict composition entirely.
- [ ] Complete ordinary replacements install and run in all three renderers.
- [ ] Documentation and displayed programs have three-renderer parity.
- [ ] Each wave includes regression checks, production CSS proof and migrations.
