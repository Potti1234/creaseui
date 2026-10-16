# Pleat component coverage and design consistency

Reviewed on 2026-10-13 at PR #27 head
`69359503e35cb5925426add76aee4aba30d9609a`.
This supplements the [fourth code review](pleat-pr-27-round-four.md).

## Assessment

The Pleat port is broadly functional and closely follows the existing StyleX
design. All component documentation pages render, and the wider interaction
suite passes. That is stronger evidence than the copied-program startup check
alone. It still does not certify every interaction of every example.

Default styling is reasonably coherent: controls share semantic colors, focus
treatment, restrained borders, a related radius scale and consistent type
hierarchy. The larger weakness is changing the design. Current presets are
small CSS patches over a few component slots, rather than complete design
families. They can change part of a form while leaving neighboring controls
with the old appearance. Scoped state colors can also become stale.

Pleat has the token and theme machinery needed to improve this. The guarantee
must come from Crease's shared design contract, complete component coverage and
state testing; choosing Pleat alone does not produce it.

An [interactive preset comparison](http://127.0.0.1:4198/) shows the same real
Pleat Payment Method form with all eight existing exported presets. The images
are browser captures of the current implementation, not proposed designs.

## What was actually checked

| Coverage                      | Result and scope                                                                                                                                                                                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Pleat site suite     | 166 checks pass in about 11 minutes: 121 isolated component-page checks plus 45 additional behavior and route checks. Two StyleX-only checks skip.                                                                                                                                                         |
| Deeper behavior               | Nested drawers, drawer snapping and reduced motion, sheets, file selection/validation/drop, OTP editing, lightbox panning, hover cards, links/tooltips, menubars, multi-selector search/selections/surfaces, popover sizing, slider crossing, navigation and themes. Several tests exercise mobile widths. |
| Representative visual sweep   | 12 pages at 1440×1000 and 390×844, in light and dark mode: 48 captures with no page errors, detected crash view or document horizontal overflow.                                                                                                                                                           |
| Pages in that sweep           | Button, Input Group, Select, Combobox, Calendar, Field, Card, Table, Tabs, Accordion, Checkbox and Sidebar. All 12 mobile light images and selected dark images were visually inspected.                                                                                                                   |
| Paired default examples       | Six examples compared across Tailwind, StyleX and Pleat: Button, Input Group, Select, Combobox, Calendar and Field. Captures and computed control styles are recorded; this is a sample, not a full pixel-parity certification.                                                                            |
| Additional Select interaction | Opened the Pleat hero listbox, selected Apple and verified the trigger updates and regains focus.                                                                                                                                                                                                          |
| Actual Create presets         | All eight styles plus emerald/large-radius and blue/zero-radius configurations, in light and dark mode: 20 cases without page errors or document overflow.                                                                                                                                                 |
| Exported preset CSS           | All eight styles applied to the actual mobile Pleat Field example. Measured Button, Input, Select, Textarea and Checkbox; captured the form for the comparison gallery.                                                                                                                                    |
| Palette pairs                 | Browser-resolved primary/primary-foreground pairs for all 25 accent themes in light and dark mode: 50 pairs. This covers this color role, not a complete accessibility audit.                                                                                                                              |
| Hover state parity            | Nova, emerald/large-radius and blue/zero-radius checked in the actual Create UI on all three renderers. The non-default palettes reveal the scoped-token defect below.                                                                                                                                     |
| Pleat reset independence      | Both standalone light/dark consumer tests pass on retry, including open overlays. The initial collapsed-Sidebar screenshot assertion differed in three pixels; its computed-style comparison passed.                                                                                                       |

The initial reset-test failure is preserved in the evidence. The expanded
screenshots were byte-identical. After collapsing Sidebar, the two screenshots
differed in only three pixels within a 2×2 region, with matching computed styles.
An isolated rerun passes both light and dark tests. This demonstrates a sensitive
screenshot gate rather than a reproduced functional failure. Keep the check,
but settle animated geometry and compare pixels with a small documented
tolerance instead of requiring identical PNG bytes.

The earlier all-1,524 copied-program startup pass remains relevant. Its missing
shared-CSS limitation is documented in the fourth review; it is not used here
as evidence of complete styling delivery or visual parity.

## What changes when choosing a different style

The styling renderer and the design preset are separate choices. Tailwind,
StyleX and Pleat should implement the same component variants and design
decisions. Switching renderer should preserve the look. Switching preset should
change a declared set of visual roles while preserving behavior, hierarchy and
accessibility.

The current presets are implemented by
[create-preset.ts:316](https://github.com/Potti1234/creaseui/blob/69359503e35cb5925426add76aee4aba30d9609a/src/demo/create-preset.ts#L316).
They have the following actual effects:

| Preset | Intended treatment expressed by the current code | Observed scope/limit                                                                                                      |
| ------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Nova   | Baseline design                                  | No additional style rules.                                                                                                |
| Vega   | Flatter surfaces                                 | Removes shadows from Button, Input and Card; Select and Textarea retain their shadows.                                    |
| Maia   | Softer, rounded treatment                        | Makes Button and Input pill-shaped and increases Card radius; Select and Textarea keep their normal radii.                |
| Lyra   | Square treatment                                 | Squares Button, Input and Card; Select and Textarea remain rounded.                                                       |
| Mira   | Smaller control text                             | Button and Input text becomes 13px. Their fixed 36px/32px heights remain; Select and Textarea typography does not follow. |
| Luma   | Softer elevation                                 | Adds a shadow to Button, Input and Card; other surface/control shadows are unchanged.                                     |
| Sera   | Stronger outlines                                | Button, Input and Card receive 2px borders; Select and Textarea retain 1px borders.                                       |
| Rhea   | Larger controls                                  | Button and Input become at least 40px tall, while Select remains 32px. Card padding is changed to 4px.                    |

Examples measured in the Create board, with the default neutral palette:

| Configuration      | Button radius | Input radius | Native Select radius | Button/Input/Select height |
| ------------------ | ------------- | ------------ | -------------------- | -------------------------- |
| Nova               | 8px           | 8px          | 8px                  | 36/32/32px                 |
| Maia               | Pill          | Pill         | 8px                  | 36/32/32px                 |
| Lyra               | 0             | 0            | 8px                  | 36/32/32px                 |
| Rhea               | 8px           | 8px          | 8px                  | 40/40/32px                 |
| Nova, large radius | 12px          | 12px         | 12px                 | 36/32/32px                 |
| Nova, zero radius  | 0             | 0            | 0                    | 36/32/32px                 |

The radius setting propagates more broadly than the style presets because the
components already consume radius tokens. Similarly, palette changes update
the main surfaces and action colors, and inherited font family supports a
shared typeface. These are useful foundations.

Consistency does not require every radius or height to be identical. A Switch
can stay pill-shaped; a Checkbox can remain a small recognizable square. A
multiline Textarea needs a different shape from a single-line input. The design
family must explicitly decide these relationships. The current three-slot
selectors do not express such a complete policy. Lyra's unchanged rounded
Select and Rhea's short Select are especially visible in mixed forms.

These narrow preset rules are shared project debt, not a new Pleat conversion
failure. `create-preset.ts` is byte-identical to the PR's originally reviewed
base commit `0968bd8`. The comparison gallery demonstrates how that shared
policy appears on the new renderer.

## Confirmed state-color inconsistency

In `/create`, select an emerald or blue preset and hover a primary Button.

| Renderer | Resting state         | Hover state                               |
| -------- | --------------------- | ----------------------------------------- |
| Tailwind | Selected emerald/blue | Corresponding emerald/blue at 80% opacity |
| StyleX   | Selected emerald/blue | Default neutral at 80% opacity            |
| Pleat    | Selected emerald/blue | Default neutral at 80% opacity            |

Pleat's Button uses `tokens.buttonPrimaryHover`, but the Create board's manual
scoped bindings omit that token. They rebind `primaryHover`, which is a
different token. The Button therefore inherits a hover color already resolved
at the document root against the neutral palette.

Source:

- [button.ts:75](https://github.com/Potti1234/creaseui/blob/69359503e35cb5925426add76aee4aba30d9609a/src/pleat/button.ts#L75)
- [tokens.ts:96](https://github.com/Potti1234/creaseui/blob/69359503e35cb5925426add76aee4aba30d9609a/src/pleat/tokens.ts#L96)
- [board-pleat.ts:68](https://github.com/Potti1234/creaseui/blob/69359503e35cb5925426add76aee4aba30d9609a/src/demo/board-pleat.ts#L68)

The same behavior was reproduced in StyleX; it is not a fundamental Pleat
limitation. Complete the scoped binding set, including secondary and other
derived state tokens, and test their consumers. Prefer generating the complete
binding set from the canonical theme definitions over maintaining long manual
lists independently in each renderer.

In Pleat, the existing `Theme.bindings`, `Theme.patch` and scoped `Global.theme`
APIs provide the necessary machinery. A complete Crease theme boundary should
bind base, foundation, composition and derived state values at their actual
scope. Existing `composition.themeScope` binds only the semantic composition
theme; it should not be presented as a complete visual theme for all controls.

## Contrast needs its own validation

The shared preset generator gives light-mode primary actions a near-white
foreground for every accent. That foreground is unsuitable for several of the
available accent values. Browser-resolved examples:

| Primary palette | Mode  | Approximate text contrast |
| --------------- | ----- | ------------------------- |
| Yellow          | Light | 2.81:1                    |
| Lime            | Light | 2.93:1                    |
| Amber           | Light | 3.07:1                    |
| Emerald         | Light | 3.50:1                    |
| Indigo          | Dark  | 3.92:1                    |

Fourteen of the 50 tested primary pairs are below 4.5:1. Colors were converted
by the browser to 8-bit sRGB before computing relative luminance, so the values
are approximate. The threshold for ordinary enabled text is 4.5:1 under
[WCAG 2.2's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
The measured action text is normal-size text, not a large-text exception.

Fix this in the palette definition by pairing each surface with a suitable
foreground and checking both modes. Validate hover/pressed/selected surfaces
and their transparency against the actual underlying background as well.
Do not assume that a token named `primaryForeground` guarantees contrast.

This problem is shared by the preset definition across renderers. It should
be addressed in the theme work rather than attributed to Pleat's renderer.
These checks do not establish full WCAG conformance or audit every text role.

## What a coherent design-family contract should own

Define one renderer-independent design contract, with complete named presets.
Each renderer implements that contract. The preset should supply decisions by
role, rather than rewrite arbitrary selectors in application code.

| Axis       | Decisions the theme should own                                                                                  | Relationships that remain consistent                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Palette    | Canvas, surfaces, text, primary actions, destructive actions, focus, success/warning/info, and all state colors | Meaning, text contrast, light/dark pairings and predictable selected states. Chart palette changes should not implicitly redefine status meaning. |
| Shape      | Single-line controls, multiline controls, cards, menus, dialogs, checkboxes and persistent pill shapes          | Related radii by role; intentional exceptions and appropriate nested geometry.                                                                    |
| Density    | Control sizes, vertical/horizontal padding, icon sizes, list/menu row height, field gaps and region spacing     | Baseline alignment, readable content and adequate targets. Compact must change actual geometry coherently, not just font size.                    |
| Typography | Body, label, supporting text, heading levels, weight, leading, numeric treatment and loaded font families       | Hierarchy and readable wrapping across different fonts, languages and viewport widths.                                                            |
| Surfaces   | Border widths, separators, shadows and elevated overlays                                                        | Consistent elevation and distinction between a flat section, a card and a floating menu.                                                          |
| Motion     | Durations, easing, press feedback and reduced-motion behavior                                                   | Related feedback and predictable enter/exit behavior across component families.                                                                   |

There are already useful pieces: base and foundation tokens, shared overlay
styles, interaction constants and composition primitives. But several control
dimensions and type values are still component literals. For example, Button
uses fixed named-size heights and Input uses a fixed 2rem height.

The semantic composition theme declares `controlSmall`, `controlMedium`,
`controlLarge` and duration/elevation values, but the control-height fields are
not currently consumed by the component controls. Its spacing and text fields
do have composition consumers. A compact composition scope can therefore
change gaps without making the actual controls compact. Wire the control and
state roles through component styles before advertising a whole-system density
theme. Preserve intentional named-size overrides.

Do not rebuild the layout or behavior for each preset. A new design family
should change a reviewed set of tokens/recipes and leave Button actions,
selection state, focus management, labels and composition intact. Consumers
then select a preset and named variants; they do not invent one-off styling for
every instance.

Pleat's typed token specs and native conditional/theme composition are a good
fit for this. StyleX can consume the same decisions through its extracted
variables, and Tailwind through the shared semantic CSS variables and recipes.
Different syntax must not imply different design policy.

## Relation to the consumer-lint plan

The agreed [consumer implementation brief](../plan/consumer-ui-lint-implementation-brief.md)
already distinguishes source restrictions from rendered quality checks. These
findings reinforce that split:

- Source lint should enforce approved components for controls, layout and
  text; finite variants; approved placement props; and registered theme/token
  definitions. Keep raw rendering and appearance authoring inside explicitly
  registered implementations, as planned.
- Theme validation should enforce complete role coverage, supported values,
  palette pairings and state derivations. A missing hover binding is detectable
  by a theme/consumer coverage contract; banning hex literals alone cannot find it.
- Browser checks should verify actual dimensions, state colors, contrast,
  focus, clipping, internal scrolling and RTL under representative presets.
  Passing source lint cannot prove these rendered relationships.
- Review existing public appearance escapes, such as `Input.inputStyle`,
  against the planned consumer boundary. Internal composite components may
  need that authority; ordinary application authors should use reviewed variants.

Keep intentional exceptions explicit. A circular Avatar, a pill Switch, a
scrollable data table and a specialized chart are valid design roles. Avoid
generic rules that force every component into the same dimensions or appearance.

## Recommended order

1. Fix the known explicit-left RTL Data Table branch from the fourth review.
   Complete the scoped state bindings in both Create renderers.
2. Correct and validate the shared foreground/background palette pairs.
3. Write the complete shape/density/surface policy for the existing eight
   presets, covering forms, menus, tables and overlays. Decide intentional
   exceptions rather than applying identical styles to every slot.
4. Map the reviewed policy into shared semantic roles and the three renderers.
   Replace the ad hoc selector patches and duplicate manual binding lists.
5. Add a permanent mixed-component theme fixture: a form, primary/outline/
   destructive actions, Select/Combobox, Checkbox/Switch, a card, table and open
   menu/dialog. Verify default and changed states in light/dark, mobile/desktop
   and RTL. Compare each renderer against the same expected design decisions.
6. Connect the installable consumer-lint policy to those approved APIs. Agents
   should choose from the system's decisions; rendered tests should verify the
   system's own implementations.

These are recommendations for the broader design work. They are not a claim
that the entire strict-lint or preset redesign was already required to merge
the current renderer port.

## Evidence and preview

The PR checkout remains source-clean at:
`C:/Users/lpottner/Documents/MaasProjects/creaseui-pleat-review`.
All QA scripts, logs, JSON measurements and screenshots are ignored artifacts
under `output/playwright/`, prefixed `pr27-consistency-`.

Useful evidence includes:

- `pr27-consistency-sites.log` — official wider suite.
- `pr27-consistency-visual-results.json` — 48 default visual states.
- `pr27-consistency-create-results.json` — 20 actual Create configurations.
- `pr27-consistency-form-results.json` — exported preset measurements.
- `pr27-consistency-paired-results.json` — six default examples on three renderers.
- `pr27-consistency-hover-probe.log`, `hover-stylex.log` and
  `hover-tailwind.log` — actual three-renderer hover comparison, all with the
  `pr27-consistency-` prefix.
- `pr27-consistency-palette-results.json` — all 50 primary pairs.
- `pr27-consistency-preflight-audit.log` and `preflight-retry.log` — first
  difference and passing retry, with the same prefix.

The [interactive comparison](http://127.0.0.1:4198/) is served by the local QA
helper `output/playwright/pr27-consistency-gallery-server.mjs` (PID 106348).
The existing Pleat, StyleX and Tailwind production previews remain on ports
4175, 4174 and 4173. Main-checkout local work was preserved. No PR source was
modified and no merge or external PR comment was made.
