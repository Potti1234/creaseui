# Astryx-inspired constrained StyleX architecture

## Why this layer exists

StyleX makes styles static, typed, deduplicated, and compatible with semantic
tokens. It does not, by itself, decide whether a page has a coherent shell,
which region owns padding, whether a table should fill its region, or how a
side panel behaves on a narrow viewport.

The first constrained Crease implementation proved that `box`, `stack`,
`inline`, `grid`, and `text` remove many arbitrary styling choices. The first
blocks implementation also proved that low-level correctness is not enough:
an agent can compose valid primitives into weak hierarchy, nested cards,
double padding, and poorly budgeted regions.

Astryx addresses this with a layered system rather than with StyleX alone:

1. semantic tokens and themes;
2. low-level layout primitives;
3. semantic region components;
4. interactive components;
5. named page and block templates;
6. machine-readable documentation and evaluation.

Sources:

- [How Astryx works](https://astryx.atmeta.com/blog/how-astryx-works)
- [Astryx layout guidance](https://astryx.atmeta.com/docs/layout)
- [Astryx component authoring guide](https://github.com/facebook/astryx/wiki/Component-Authoring-Guide)
- [Astryx theme system](https://astryx.atmeta.com/docs/theme)
- [Astryx CLI](https://astryx.atmeta.com/docs/cli)

## Lessons adopted

### Build pages outside-in

Every page starts with a shell and explicit region policy. Fixed regions have
named width budgets. Content is explicitly either `fill` or `capped`. A region
must declare how it behaves at narrow widths: remain, hide, stack, or become an
overlay owned by application state.

### One inset owner per region

`PageLayout`, `PageHeader`, `PageContent`, `PageFooter`, `Section`, and
`TableRegion` own their insets. Descendants do not recreate the same padding.
This keeps headers, content, rows, hover backgrounds, and footers on a shared
content line.

### Use the weakest sufficient container

Spacing is the default grouping mechanism. `Section` groups related page
content. `Card` is reserved for a self-contained widget or hard boundary.
Collections use `Table` or `List`, not repeated cards.

### Encode rhythm and density

Spacing distinguishes tight relationships from section boundaries. Density is
a named page decision (`compact`, `balanced`, or `spacious`) and is shared by
the region and its controls.

### Separate structure from visual identity

Recipes own structure and responsive behavior. Semantic tokens own color,
type, radius, elevation, focus, and motion. A theme can change identity without
reconstructing the page.

### Templates are contracts, not screenshots

Each template declares its kind, recipe, regions, density, responsive
contract, components, and evaluation tasks. The registry is typed and is the
source for both human documentation and agent discovery.

## Crease architecture

```text
semantic tokens
  -> box / stack / inline / grid / text
  -> AppShell / PageLayout / Section / Toolbar / FormLayout / TableRegion
  -> DashboardShell / SettingsPage / MasterDetailPage / DataExplorerPage / CommercePage
  -> typed page and block template registry
  -> AST contracts + scenario tests + Playwright accessibility/visual checks
```

The implementation ships three finite semantic theme packs:

- `comfortable`, the default balanced rhythm;
- `compact`, for high-volume operational surfaces;
- `expressive`, for lower-density product and commerce pages.

They override the same typed StyleX variable group for region spacing, control
height, typography, focus, elevation, and motion. Recipes accept only these
named themes; callers cannot supply arbitrary theme objects.

The agent-readable registry lives in
`src/stylex/composition/templates.ts`. The task evaluation manifest lives in
`src/stylex/composition/evaluations.ts`. `npm run lint:stylex-templates`
checks the documentation, closed APIs, semantic token families, recipe
coverage, template coverage, and featured-dashboard migration.

## Constraint policy

Crease intentionally does not copy Astryx's unrestricted `xstyle`,
`className`, and inline `style` customization path. Public APIs expose finite
semantic values. New visual behavior must be introduced as a named token,
variant, region policy, or recipe and reviewed at that boundary.

Static checks enforce:

- no raw StyleX, Tailwind, `h.Class`, `h.Style`, or raw layout builders in
  constrained pages;
- token-only visual values in StyleX files;
- closed primitive and recipe prop unions;
- raw pixel widths only in the central structural-width token module;
- exact agreement between the template registry and its documented recipes;
- one known inset owner for each recipe region.

Runtime and browser checks remain necessary for properties that syntax cannot
prove: hierarchy, responsive usefulness, visual balance, accessibility, focus
order, overflow, and the quality of realistic content.

## Agent workflow

1. Select the closest template before writing a page.
2. Use its named recipe and preserve its region set.
3. Choose density and responsive contract explicitly.
4. Compose existing components inside regions.
5. Add a token or finite recipe option only when the system lacks a required
   concept; never add an arbitrary style escape hatch.
6. Run composition contracts and task evaluations.
7. Use Playwright only after the structural checks pass.

## Evaluation tasks

The initial harness evaluates these representative changes:

- build a dashboard with navigation, metrics, chart, and table;
- add a filtering toolbar to a data explorer;
- create a master-detail page with a budgeted detail panel;
- create a settings form with capped readable width;
- switch the visual theme without changing recipe structure;
- verify the narrow-width region contract and accessibility.

The purpose is not to eliminate browser verification. It is to make browser
iteration validate a small set of trusted recipes instead of repairing every
new page from first principles.

## Astryx-inspired dashboard set

The blocks gallery now includes five additional constrained dashboards based
on the information architectures in Astryx's current template catalog:

- executive summary: KPI scorecard, objectives, trends, and narrative rail;
- cohort funnel: conversion stages, trend, and retention table;
- project status: task progress, milestones, workstreams, and risks;
- service monitoring: live metrics plus an alert/service triage rail;
- incident console: dense incident rows and a separate inspector panel.

They intentionally copy structure rather than Astryx source or branding. Each
uses Crease components, Foldkit views, the closed StyleX recipe APIs, and the
semantic theme packs. This follows Astryx's own recommendation to start full
pages from templates rather than composing from scratch, and its distinction
between full-page examples, reusable blocks, and component examples:

- [Astryx core page-layout workflow](https://github.com/facebook/astryx/blob/main/packages/core/README.md)
- [Why Astryx gives agents curated examples](https://astryx.atmeta.com/blog/astryx-cli-build-command)

## Apache ECharts under the constrained StyleX boundary

The blocks gallery also contains a real analytics dashboard spanning area,
grouped bar, line, donut, radar, and radial chart families. The canvas drawing
remains owned by Apache ECharts, while StyleX owns the host dimensions,
surfaces, spacing, responsive grid, typography, and surrounding semantic
regions.

`src/stylex/integrations/echarts.ts` is the single bridge. It exposes only four finite host
sizes and the reviewed chart helpers from `src/lib/echarts.ts`; consumers do
not receive a class string or arbitrary visual style escape hatch. The block
itself uses only composition primitives and `masterDetailPage`, so chart-heavy
pages receive the same structural enforcement as tables and forms.

This separation is deliberate: StyleX cannot style pixels painted into a
canvas. Theme tokens are resolved at mount and supplied to ECharts as concrete
colors, while all DOM layout remains statically extracted StyleX. Browser tests
therefore verify both halves of the contract: six real canvases must mount and
their StyleX regions must remain accessible and horizontally contained.

The same bridge now powers every chart inside the Astryx-inspired dashboard
blocks. Their earlier lightweight SVG area, bar, and donut placeholders have
been replaced with seven mounted ECharts instances, without changing the
semantic region recipes. The StyleX renderer on `/charts/:section` provides a
complete 70-example gallery across area, bar, line, pie, radar, radial, and
tooltip sections.
