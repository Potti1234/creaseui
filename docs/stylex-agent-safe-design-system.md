# Constrained StyleX in Crease UI

Status: implemented experiment  
Last verified: 2026-08-28  
Demonstration route: `/create-constrained`  
Reference routes: `/create` and `/create-stylex`

## Executive summary

This experiment asked whether StyleX and the Elm architecture used by Foldkit
could make AI-authored UI more consistent than an open Tailwind authoring
surface.

The result is encouraging, with an important qualification: StyleX alone does
not provide the guarantee. The guarantee comes from the complete authoring
system around it:

1. semantic tokens are the only accepted visual vocabulary;
2. components expose named variants instead of arbitrary classes or styles;
3. public style overrides are restricted to parent layout;
4. page composition uses five closed primitives: `Box`, `Stack`, `Inline`,
   `Grid`, and `Text`;
5. TypeScript, ESLint, Oxlint, source-level AST tests, and browser tests reject
   different classes of drift;
6. Foldkit keeps all interactive choices in the model and routes every change
   through explicit messages and `update` branches.

The implementation now contains StyleX counterparts for all 65 Crease UI
component modules, 33 StyleX card demonstrations on the Create board, a full
StyleX catalog, and a constrained Create page whose initial geometry matches
the StyleX reference page.

The constrained page also includes a primitive inspector. Its controls modify
the real board rather than a synthetic preview, so the effect of a design-system
decision can be observed in context.

## Research question and verdict

The original hypothesis was that StyleX would prevent agents from expressing
the same design in many inconsistent ways.

The more precise verdict is:

| Question | Finding |
| --- | --- |
| Does replacing Tailwind with StyleX automatically prevent drift? | No. Raw `stylex.create`, unrestricted `StyleXStyles`, arbitrary component overrides, and raw layout elements can recreate the same openness. |
| Can StyleX support a strongly constrained system? | Yes. Static extraction, typed style objects, theme variables, and StyleX lint rules provide a strong base for a closed API. |
| Did the primitives make later composition easier? | Yes. Once the vocabulary existed, the constrained board was assembled mostly by choosing finite props rather than inventing CSS. |
| Was visual parity one-shot? | No. The first full migration required repeated browser comparison and fixes for responsive behavior, contextual states, icon sizing, card geometry, accessibility, and theme scoping. |
| Is later AI work more predictable? | Yes. An agent working at the constrained page boundary has far fewer valid decisions and receives deterministic failures for most escape attempts. |
| Can CI prove pixel-perfect design quality? | No. CI can prove structural and vocabulary constraints. Browser geometry and screenshot testing can detect regressions, but design judgment is still required for new visual decisions. |

## Inspiration from Polar Orbit

This work was directly informed by Polar's June 2026 article,
[Building an LLM safe design system](https://polar.sh/blog/orbit-llm-safe-design-system).

Polar's argument is that an LLM is generally capable of writing valid CSS or
Tailwind, but it is not automatically aware of the product's design decisions.
An open string surface lets it select from many plausible colors, spacing
values, radii, and dark-mode variants. All may compile while only one is the
canonical product decision.

Orbit therefore tries to make off-system decisions difficult to express:

- tokens are named by intent rather than by their literal value;
- typed props accept a short list of approved decisions;
- raw layout elements and styling escape hatches are rejected;
- semantic HTML is retained through a closed polymorphic `as` prop;
- important conventions are executable CI contracts rather than prose alone;
- light and dark behavior lives behind semantic tokens instead of being
  reauthored at every call site.

Crease adopts the same underlying principle: the agent should identify the
kind of thing it is building and choose from decisions already made by the
design system. It should not be asked to rediscover the design language from
the full CSS value space.

### Where Crease follows Orbit

| Orbit idea | Crease implementation |
| --- | --- |
| Tokens are the vocabulary | `tokens.stylex.ts`, family token files, and composition token files contain semantic paint, shape, shadow, and spacing decisions. |
| Typed primitive props | `Box`, `Stack`, `Inline`, `Grid`, and `Text` accept closed string unions. |
| Remove the nearby escape hatch | The constrained page cannot call raw Foldkit layout builders, `h.Class`, `h.Style`, `stylex.create`, or class-composition helpers. |
| Preserve semantics | Primitives accept a closed `as` union for `main`, `nav`, `section`, lists, and other approved elements. |
| CI is the contract | Lint, compiler assertions, AST checks, catalog checks, and Playwright tests are executable requirements. |
| Add a token instead of bypassing the system | Visual changes require a reviewed semantic token, named variant, or primitive prop. |

### Where Crease differs

Crease is not a React project. Its views use Foldkit's Elm architecture, so the
experiment had to constrain both styling and message-driven UI construction.
The public components return Foldkit `Html`, and interactive component state is
represented by models, messages, reducers, commands, and subscriptions.

Crease also separates two boundaries:

- leaf components may implement their internals with StyleX;
- AI-authored page composition uses the smaller five-primitive API.

This is stricter than merely adopting StyleX throughout the repository. It
prevents a page-authoring agent from creating a new local style system beside
the component library.

## Inspiration from Linear

The second research input was Linear's article,
[Styling Linear for the future with StyleX](https://linear.app/now/styling-linear-for-the-future-stylex),
and its public
[styled-components-to-stylex codemod](https://github.com/skovhus/styled-components-to-stylex-codemod).

Linear's migration is much larger than this experiment, but several lessons
transfer directly:

- migrate foundations before leaves, so later work selects existing decisions;
- give agents narrow, mechanically verifiable scopes;
- combine a fast general linter with a repository-aware, type-aware checker;
- trace style props through wrappers and verify merge order rather than only
  checking a single file;
- make motion, cursors, thin borders, hover, and press behavior semantic system
  decisions;
- treat theme inheritance across portals as an architectural boundary;
- require narrow, justified suppressions and make CSS fallback usage explicit;
- publish migration counters, while being precise about what the counters mean.

Crease is not claiming Linear's runtime-performance result. The existing
reference is Tailwind rather than styled-components, and the StyleX routes are
still a parallel experiment. The useful transfer is the engineering method:
encode migration and authoring invariants as executable repository contracts.

## Six-point hardening inspired by Linear

The initial experiment proved component coverage and constrained composition.
The following hardening pass closes the six gaps identified after studying
Linear's migration.

| Point | Implemented contract | What now fails deterministically |
| --- | --- | --- |
| Cross-file style flow | `check-stylex-contract-flow.mjs` uses the TypeScript program and checker to follow each public `layoutStyle` and slot layout prop through wrappers, renamed forwarding, and final class materialization. | A declared layout hook that is dropped, applied outside the StyleX adapter, or merged before component-owned styles. |
| Theme-aware overlays | Every anchored StyleX component calls `themedAnchor`, which fixes `portal` to `false`. | A body portal, a public `portal?: boolean`, direct Foldkit portal access, or a literal unguarded anchor config. |
| Semantic interaction policy | `interaction-tokens.stylex.const.ts` owns durations, easing, cursors, and press transform; shared controls and overlays include reduced-motion behavior. | Raw timing, easing, or cursor values in the StyleX implementation and StyleX Create cards. |
| Suppression and fallback governance | Only justified next-line suppressions are accepted; CSS Modules must live in `src/stylex/fallbacks` and be declared in its manifest with a specific reason. | File-wide disables, unexplained suppressions, undeclared CSS fallbacks, missing fallback files, and stale ESLint disables. |
| Browser state matrix | A dedicated Playwright test records and asserts rest, hover, focus, active, disabled, dark, open, and scoped-theme states. | Missing visual state changes, broken focus rings, lost disabled semantics, dark-token drift, or an overlay escaping the theme scope. |
| Adoption metrics | A generated drift-checked report labels the work as a `parallel-experiment` and separately counts UI components, Create cards, constrained primitives, and guardrail escapes. | Counter drift, missing counterparts, new legacy imports, suppressions, fallbacks, or unsafe portals that are not reflected in the report. |

The current flow checker covers 65 component modules, 171 exported functions,
and 190 constrained layout properties. Multiple final materializations are
permitted only where a component intentionally renders mutually exclusive
responsive roots; silent dropping and incorrect precedence are not.

The overlay policy deliberately chooses theme inheritance over escaping
ancestor clipping. Foldkit normally relocates anchored panels to a shared
`document.body` portal. Since the Create presets are scoped to
`[data-crease-board-theme]`, that move loses inherited variables. A future
escape-from-clipping requirement must first add a reviewed theme-copying portal
primitive at the shared boundary; individual components cannot opt in ad hoc.

The checked adoption report is
[`docs/stylex-adoption.json`](./stylex-adoption.json). Its 100% values mean
that all 65 UI modules and all 33 Create cards have parallel StyleX
counterparts. They do not mean Tailwind has been removed from the main product.

## What was implemented

### 1. Compiler and test integration

StyleX compilation is configured once in `stylex.config.js`. The application
build and the test transform consume the same `styleResolution`, CSS layer,
and `sxPropName` options.

The adapters intentionally differ:

- Vite uses `stylex.vite(...)` because development requires CSS collection,
  injection, and hot reloading;
- Vitest uses `stylex.rollup(...)` because tests only require compile-time
  transformation.

Using the Vite adapter in Vitest caused the process to remain alive after its
tests passed. The upstream Vite adapter starts a polling interval for dev-server
CSS updates, while Vitest middleware mode has no HTTP server close event to
clear it. The Rollup adapter avoids installing that dev-server lifecycle.

This corresponds to the upstream
[`@stylexjs/unplugin` Vitest resource-leak issue #1533](https://github.com/facebook/stylex/issues/1533).
The workaround is deliberately isolated in `vitest.config.ts`; the production
compiler semantics remain shared.

StyleX theme and constant imports also use relative paths where required by the
compiler. TypeScript/Vite aliases resolved at the application layer were not
always sufficient for StyleX's theme-file analysis.

### 2. Complete StyleX component catalog

`src/stylex` contains counterparts for the complete 65-component Crease UI
registry. `src/stylex/index.ts` exposes a canonical, closed component-name tuple
and one PascalCase namespace per component.

The catalog verifier checks:

- exact component-name and module coverage;
- module resolution;
- exported TypeScript symbol parity with the original component;
- public prop-name parity, with intentional class-to-layout migrations;
- absence of Tailwind, CVA, raw authored class strings, and `src/ui` fallbacks;
- use of the static StyleX-to-Foldkit class adapter;
- absence of unrestricted public `StyleXStyles` or `StaticStyles` hooks.

### 3. Complete StyleX Create board

`src/demo/stylex-cards` contains 33 card modules used by the Create board. Their
models, messages, update behavior, subscriptions, and public exports were kept
equivalent to the original card implementations while their component imports
and visual styling moved to StyleX.

Three routes make the comparison explicit:

| Route | Purpose |
| --- | --- |
| `/create` | Original Tailwind/Create reference. |
| `/create-stylex` | Full StyleX component and card implementation using the initial board composition. |
| `/create-constrained` | Same StyleX components, same Elm state, and same board data, composed through the five closed primitives. |

The constrained page does not fork product behavior. It reuses the StyleX
board model, messages, reducers, commands, subscriptions, preset theme, sprite
definitions, and card specification. Only the composition boundary changes.

### 4. Closed component contracts

StyleX components do not expose public `class`, `className`, `style`, or
`unsafeStyle` props.

Where a caller genuinely needs to position a component inside its parent, it
may use `layoutStyle`. That type is based on `StaticStyles` and whitelists only
properties such as margins, width/height constraints, flex placement, grid
placement, alignment, aspect ratio, and order.

It cannot change component colors, typography, internal padding, radii,
shadows, or interaction states. Those require a named component variant or a
composition-owned wrapper.

The contract also rejects StyleX inline-style tuples. The Foldkit adapter emits
the compiled class name and would otherwise discard a dynamic `.style` result.
Dynamic visual state must therefore be represented by a finite named variant,
unless the value is intrinsically runtime-owned, such as a chart data value or
slider percentage.

### 5. Composition primitives

The constrained authoring surface is intentionally small.

#### Box

`Box` owns surfaces and non-layout-specific containment:

- semantic element through `as`;
- semantic surface;
- tokenized padding and radius;
- approved width and minimum-size recipes;
- overflow and containment recipes;
- page-shell rail behavior.

It does not accept a CSS object or arbitrary class name.

#### Stack

`Stack` owns vertical flow:

- tokenized gap and padding;
- finite alignment;
- approved grid placement;
- width behavior;
- an explicit deferred-rendering recipe for the large board.

#### Inline

`Inline` owns horizontal flow:

- finite alignment and justification;
- tokenized column gap;
- wrapping;
- approved width and minimum-width behavior.

#### Grid

`Grid` owns repeated two-dimensional layout:

- one, two, or canonical Create-board columns;
- finite alignment;
- tokenized gap and padding;
- approved canvas surfaces and widths.

#### Text

`Text` owns typography and textual semantics:

- approved semantic elements;
- named variants such as caption and headings;
- semantic tones;
- finite alignment;
- an `inherit` mode for applying a typography scope without changing the
  reference page's default appearance.

### 6. Primitive inspector on the real page

The first inspector rendered a small isolated specimen. That was useful for
testing but did not answer the product question well: the user needed to see
how a primitive affects the real Create page.

The specimen was removed. The current controls modify the actual board:

| Inspector control | Real target |
| --- | --- |
| Canvas padding (`Box`) | Padding around the complete 33-card board. |
| Canvas surface (`Box`) | Background, foreground, border, and shadow semantics of the board canvas. |
| Card spacing (`Stack`) | Vertical space between real cards and space inside real split columns. |
| Board alignment (`Inline`) | Justification of the actual fixed-width board inside its horizontal layout context. |
| Split layout (`Grid`) | Real two-card split compositions switch between one and two columns. |
| Board text scale (`Text`) | Typography inherited by the real board; explicit component typography remains stable by design. |

`responsive` and `inherit` are first-class finite decisions. They preserve the
reference geometry at the default state while still allowing visible changes.

Every selection is part of the Elm model. A toggle emits a typed message, the
board `update` branch produces the next model, and the view renders the selected
primitive props. There is no DOM mutation or ad-hoc CSS state outside the
architecture.

## Enforcement model

The design system uses several layers because no single tool sees the whole
problem.

```text
AI or human author
        |
        v
closed component and primitive props ---- TypeScript rejects unknown decisions
        |
        v
semantic StyleX implementation ---------- StyleX ESLint rejects invalid styles
        |
        v
constrained page boundary --------------- Oxlint + AST + grep reject escape hatches
        |
        v
catalog and contract tests -------------- source/API parity and coverage
        |
        v
real browser ---------------------------- layout, interaction, theme, a11y, parity
```

### TypeScript guarantees

- primitive props are closed unions rather than `string`;
- component variants and sizes are finite;
- `ComponentLayoutStyle` contains only approved parent-layout properties;
- exact-key assertions detect drift between exported unions and style maps;
- compile assertions ensure a dependency update cannot silently widen the
  layout contract to accept visual or inline styles;
- `as unknown as` is banned repository-wide for TypeScript and TSX.

TypeScript cannot prevent a deliberately malicious `any`, disabled checks, or
arbitrary code outside the checked boundary. Those require lint and review.

### StyleX ESLint guarantees

All available StyleX plugin rules in the installed version are enabled as
errors for the StyleX implementation boundary:

- enforced `.stylex` theme and `.stylex.const` constant extensions;
- no legacy contextual styles;
- no lookahead selectors;
- no nonstandard styles;
- conflicting-prop detection where the rule can understand the syntax;
- unused-style detection;
- canonical key ordering;
- valid shorthand policy with no `!important`;
- valid-style analysis using the same property-specificity resolution as the
  compiler.

`propLimits` require semantic tokens for colors, SVG paint, radii, and shadows.
They also require semantic tokens for durations, easing functions, and cursors.
Raw CSS custom-property declarations and outer pseudo/media syntax are also
disabled at this boundary.

The repository-aware flow checker complements these local rules. It follows
public layout contracts across function calls and object forwarding, including
renamed slot props, then proves that final class emission puts the caller's
layout style last. This catches the wrapper-level cases a single-file syntax
rule cannot see.

`npm run lint:stylex-governance` separately owns exceptions and browser
boundaries. Its current baseline is zero suppressions, zero CSS fallbacks, zero
legacy UI imports in the StyleX boundary, and zero unsafe body portals.

Important limitation: some StyleX lint rules are designed around JSX. Foldkit
constructs nodes through `h.*` calls, so JSX-only conflict analysis cannot prove
every Foldkit call-site property relationship. The other contracts compensate
for this but do not make the rule magically Foldkit-aware.

### Constrained-page guarantees

`npm run lint:composition` combines three checks:

1. Oxlint runs over the constrained page and primitive implementation;
2. a cheap source guard rejects known signatures for direct StyleX, Tailwind
   class composition, `h.Class`, `h.Style`, raw layout builders, and double
   assertions;
3. a TypeScript AST test verifies imports and calls to all five primitives,
   rejects raw Foldkit layout construction, and audits primitive prop types for
   styling escape hatches.

The AST check matters more than regex alone. Formatting changes and many syntax
variations do not change the syntax tree, while string-only rules can become an
endless set of special cases.

### Catalog and browser guarantees

Catalog and contract tests prove component coverage, source/API parity, the
absence of fallback styling paths, and the layout-only public contract.

Playwright then verifies what source checks cannot:

- the default constrained board has the same bounds, padding, grid columns,
  gap, position, and child count as the StyleX reference board;
- all six inspector controls change the expected computed CSS on the real
  board;
- route navigation, presets, theme behavior, mobile behavior, and accessibility
  flows remain operational.
- rest, hover, keyboard focus, active press, disabled, dark, open, and scoped
  overlay states produce the expected computed behavior;
- opened anchored content remains inside the scoped theme subtree rather than
  being relocated to Foldkit's body portal.

The complete board contains expensive charts, calendars, menus, and 33 card
views. Its focused browser tests are marked slow and run serially to avoid a
parallel-render timeout. This is test sizing based on measured application
cost, not a forced-exit workaround.

## What each layer can and cannot prove

| Layer | Can prove | Cannot prove |
| --- | --- | --- |
| Closed prop types | Only declared decisions are accepted at ordinary call sites. | That every declared decision looks good in every context. |
| Semantic tokens | Paint, radius, shadow, and spacing values come from reviewed vocabulary. | That a semantically valid token was chosen for the correct product meaning. |
| StyleX compiler | Styles are statically extracted and compiler-valid. | Product-level consistency by itself. |
| ESLint and Oxlint | Known syntax and policy violations fail deterministically. | Arbitrary intent or visual quality. |
| AST tests | Structural boundaries, imports, calls, props, and exports remain constrained. | Runtime layout and browser CSS behavior. |
| Playwright geometry | Important rendered measurements and interactions remain stable. | Every pixel in every state unless screenshot coverage is exhaustive. |
| Human review | New decisions fit the design language and product context. | Deterministic enforcement across future changes unless the decision is encoded afterward. |

## Implementation learnings

### StyleX is a mechanism, not the policy

The largest learning matches Polar's thesis. An agent can produce inconsistent
StyleX just as it can produce inconsistent Tailwind if it can freely author
local style objects and raw values. Consistency improved only after the allowed
vocabulary and escape-hatch policy were encoded.

### The first migration was not one-shot

Moving 65 components and the Create board required substantial verification
and iteration. The difficult parts were not simple declarations such as
`display: flex`. They were:

- contextual parent/child and peer states;
- selected, disabled, focus, open/closed, and direction-aware states;
- responsive sidebar, dialog, drawer, sheet, and menu behavior;
- theme scoping and semantic token coverage;
- icon sizing previously inherited from Tailwind selectors;
- exact card widths, gaps, padding, and fixed-board geometry;
- accessible labels and required list/group structure;
- runtime-owned values for charts, panels, sliders, and skeletons;
- StyleX theme-file module resolution;
- the Vitest dev-server lifecycle issue.

Playwright was essential during this phase. Screenshots exposed visual problems
that type checking and linting could not see, including blank icons, intrinsic
button widths, theme contrast, responsive layout differences, and missing
full-width wrappers.

### The primitive composition was much closer to one-shot

Once the leaf components, semantic tokens, and board behavior were stable, the
constrained page was materially easier to author correctly. The agent chose
from `Box`, `Stack`, `Inline`, `Grid`, and `Text` props instead of repeatedly
inventing spacing and layout styles.

Browser verification was still required, but its role changed. It verified
that the chosen composition preserved geometry rather than discovering dozens
of unrelated visual decisions. This is the main productivity benefit of the
approach: verification remains necessary, but the number and variety of
possible failures shrink.

### Constraint friction is useful feedback

Several real requirements did not fit the first primitive vocabulary. The
correct response was to decide whether each need represented:

- a reusable design-system decision worth adding;
- component-owned visual behavior;
- composition-owned structure;
- or a genuinely dynamic runtime value.

That pause is productive. It prevents a local arbitrary value from silently
becoming an undocumented precedent.

### Preserve behavior separately from styling

Keeping the same Elm models and reducers for `/create-stylex` and
`/create-constrained` made the experiment trustworthy. Differences could be
attributed to composition and styling rather than to a second implementation
of the application behavior.

### Visual parity and authoring safety are separate goals

Pixel parity proves that a migration retained the current design. A constrained
API proves that future changes have fewer ways to drift. Both are valuable, but
one does not imply the other.

### Escape hatches need an explicit budget

Some dynamic values are legitimate: chart series variables, panel percentages,
slider ranges, skeleton widths, and other values that originate in runtime
data. Those should remain narrow, documented, and local. A generic public style
prop is different because it lets every caller redefine the component.

## Recommended agent workflow

When adding or changing UI in the constrained system:

1. choose an existing component and named component variant;
2. compose it with `Box`, `Stack`, `Inline`, `Grid`, and `Text`;
3. choose only existing semantic tokens and finite primitive values;
4. if the vocabulary is insufficient, identify the missing design decision;
5. add the narrowest reviewed token, component variant, or primitive prop;
6. add or update a source-level contract test for the new decision;
7. run `npm run lint:composition`, lint, and type checking;
8. verify the affected route in a real browser;
9. add a geometry, interaction, accessibility, or screenshot assertion when the
   failure mode could recur.

Do not widen `layoutStyle`, add a raw class/style prop, use a double assertion,
or bypass the primitives simply to make the current diff pass.

## Commands

```sh
# Fast constrained-boundary feedback
npm run lint:composition

# Cross-file layout contract and governance checks
npm run lint:stylex-contracts
npm run lint:stylex-governance

# Drift-checked parallel-adoption report
npm run stylex:adoption
npm run stylex:adoption:generate

# General static validation
npm run lint
npm run typecheck

# Unit, source-contract, and scene tests
npm test

# Production StyleX extraction
npm run build

# Browser verification
npm run test:e2e

# Complete local quality gate
npm run check
```

## Important files

| Area | File |
| --- | --- |
| Shared compiler semantics | `stylex.config.js` |
| Vite application adapter | `vite.config.ts` |
| Vitest compile-only adapter | `vitest.config.ts` |
| StyleX lint policy | `eslint.config.js` |
| Component layout contract | `src/stylex/contracts.ts` |
| Semantic component tokens | `src/stylex/tokens.stylex.ts` |
| Component authoring policy | `src/stylex/README.md` |
| Component manifest | `src/stylex/index.ts` |
| Cross-file layout flow checker | `scripts/check-stylex-contract-flow.mjs` |
| Theme-aware overlay boundary | `src/stylex/overlay-boundary.ts` |
| Interaction and motion tokens | `src/stylex/interaction-tokens.stylex.const.ts` |
| Suppression/fallback governance | `scripts/check-stylex-governance.mjs`, `src/stylex/fallbacks/manifest.json` |
| Parallel adoption metrics | `scripts/report-stylex-adoption.mjs`, `docs/stylex-adoption.json` |
| Composition primitives | `src/stylex/composition/` |
| Constrained page | `src/demo/board-constrained.ts` |
| Shared StyleX board behavior | `src/demo/board-stylex.ts` |
| StyleX card modules | `src/demo/stylex-cards/` |
| Composition source guard | `scripts/check-constrained-composition.mjs` |
| Composition AST tests | `test/stylex-composition.test.ts` |
| Component/catalog contracts | `test/stylex-catalog.test.ts`, `test/stylex-contract.test.ts` |
| Browser parity and inspector tests | `e2e/site.spec.ts` |
| Browser interaction/theme matrix | `e2e/stylex-state-matrix.spec.ts` |

## Current limitations and open work

1. Add screenshot-golden coverage beyond the computed-style state matrix for
   representative viewports. Current geometry and state assertions are strong
   but not pixel-exhaustive.
2. Continue making lint analysis more Foldkit-aware. Some upstream StyleX rules assume JSX
   and cannot fully understand `h.*` builder calls.
3. Continue expanding tokens only in response to demonstrated product needs.
   A primitive with every CSS property would recreate the original problem.
4. Audit legitimate dynamic `h.Style` usage periodically and keep it out of
   public component contracts.
5. Improve board render performance or memoization. Foldkit correctly reports
   slow initial view/patch warnings for this intentionally large demonstration.
6. Address the existing production bundle-size warning through code splitting;
   it is separate from StyleX correctness.
7. Track upstream StyleX unplugin fixes and re-evaluate the Vitest adapter when
   the dev-server lifecycle issue is resolved.
8. Add a theme-copying portal primitive only if a demonstrated overlay must
   escape clipping; the current inline boundary intentionally favors correct
   scoped inheritance.

## Featured blocks one-shot case study

The `/blocks-stylex` experiment deliberately tested the constrained system on
the five Featured examples from the
[shadcn blocks gallery](https://ui.shadcn.com/blocks). The first implementation
was written after reference inspection but without viewing the local result.
It passed every source constraint and compiled successfully, yet its visual
result was poor.

That failure is important: syntactic safety is not design accuracy.

| First-pass failure | Root cause | System improvement |
| --- | --- | --- |
| The marketing hero became a small, left-aligned introduction. | The agent preserved words but not the reference's page hierarchy and spatial emphasis. | Added finite hero height, hero typography, text measure, centering, and responsive visibility choices. |
| Block titles and controls used an invented gallery toolbar. | The source contract checked block IDs, not toolbar anatomy or semantic ordering. | Rebuilt the toolbar around the reference hierarchy and added desktop/mobile presentations. |
| Sidebar examples were generic placeholders. | The one-shot pass treated blocks as categories rather than concrete products with distinct information architecture. | Recovered registry content and made `sidebar-03` a documentation tree instead of another product sidebar. |
| Dashboard cards omitted their second line and collapsed to two columns. | Content fidelity was not part of the contract, and overlapping media queries had ambiguous precedence. | Restored the complete card hierarchy and changed the responsive grid to mutually exclusive breakpoint ranges. |
| Icons were blank and consumed layout space. | The raw icon renderer accepts arbitrary names and unconstrained SVG sizing; the primitive system had no safe icon adapter. | Added a closed StyleX icon adapter with finite sizes and used only generated icon names. |
| Login forms were too wide and the separator wrapped vertically. | `width: full` was the closest available choice, while separators were improvised from generic layout primitives. | Added finite form/login widths, centered-content alignment, and used the shared `FieldSeparator`. |
| Mobile controls overflowed the viewport. | A wrapping desktop toolbar is not the same composition as the mobile reference. | Added finite desktop/mobile visibility and a separate compact mobile block heading. |

### What the case study changes

The primitives successfully prevented arbitrary CSS, but they could not tell
the agent which composition was correct. A reliable system therefore needs
three layers:

1. semantic tokens constrain visual values;
2. closed primitives constrain layout decisions;
3. reference-backed patterns constrain recurring composition and information
   hierarchy.

The third layer was underdeveloped in the first pass. Polar's “LLM-safe” idea
remains valid, but a constrained vocabulary only produces consistent output
for concepts it can name. Linear's migration lesson also applies: compiler
correctness and static extraction are foundations, while visual migration
still needs measured parity checks.

The permanent rule from this case study is: a one-shot page may be used as an
evaluation, but it must not be accepted as evidence of design-system quality
merely because lint, AST, and build checks pass. Representative browser
comparisons must inform new finite recipes, and every discovered recurring
failure should become a contract rather than a page-local override.

## Final assessment

The experiment supports the direction proposed by Polar Orbit: an AI-safe
design system should not rely on an agent remembering a style guide. It should
make the approved decisions the easiest—and ideally the only—decisions that
compile.

For Crease, the strongest architecture is not “StyleX instead of Tailwind.” It
is:

> semantic decisions + closed APIs + Elm state + static extraction + executable contracts + browser verification

This does not eliminate visual review. It changes visual review from policing
an unbounded collection of CSS choices to evaluating a much smaller set of
explicit design decisions.

