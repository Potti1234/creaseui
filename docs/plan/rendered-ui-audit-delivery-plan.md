# Rendered UI audit and guidance delivery plan

Date: 2026-10-13. Work packages: A1 and A2. Status: proposed implementation.

Deliver optional consumer browser checks for measurable design mistakes and
actual interaction contracts. Reuse the existing `@creaseui/lint/rendered` SDK
and LintApple research, shared theme/component policy and permanent R3 fixtures.
Source lint remains independently installable and usable.

## Existing SDK and research inputs

Read `packages/lint/rendered.js`, `rendered.d.ts`, current engine adapter/state
helpers, `scripts/lint-rendered-ui.mjs`, lint package tests,
[the rendered research](../rendered-ui-lint.md), the
[consumer lint plan](consumer-ui-lint-plan.md) and
[R3 testing plan](renderer-regression-and-ci-plan.md).

The local SDK provides `auditUI`, `assertUI`, `expectUI`, policy construction and
report types with a minimal host-page interface. Its engine baseline is pinned
to LintApple 0.1.20 in the local package. Verify that baseline in the implementation
checkout. Reuse useful measurements and preserve license/provenance; an engine
upgrade is a tested compatibility change.

Rule names such as keyboard operation or dialog focus do not prove an interaction
was executed. Keep page measurement coverage separate from actual named state
transitions and assertions.

## Versioned policy and component metadata

Use R1 roles and R2 component contracts for typography, spacing, density, shapes,
surfaces, motion and relationships. Components emit applicable metadata
automatically. Reuse existing `data-ui-*` meanings and add versioned Crease
contract/region IDs where necessary; consumers should not annotate every node.

| Contract owner     | Measurement and required distinction                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Action group       | Normal gaps, joined/shared-border groups and dense groups have different expectations     |
| Stack/Inline/Grid  | Approved spacing and declared alignment; no global alignment guess for arbitrary children |
| Numeric text/table | Tabular digits and explicit intended alignment                                            |
| Nested surface     | Opted-in radius/inset relationship with a known outer/inner owner                         |
| Control/Field      | Role-specific geometry, label/description/error links and applicable states               |
| Overlay            | Viewport bounds, collision, local scrolling, focus visibility and owning theme            |
| Page region        | Document overflow, clipping and intentional local scrolling ownership                     |

Missing or malformed required metadata produces a finding or an unresolved
contract, never a claim that a relationship passed. Theme changes automatically
change the expected role values; do not duplicate default pixel values across
three renderer-specific policies.

## A1 portable runner

Add the proposed `creaseui-lint audit --config creaseui-lint.config.mjs` command.
Consumer configuration supplies URLs, readiness conditions, viewports, theme
setup, direction/motion choices and named state callbacks. Use explicit
configuration for class/data-attribute/storage theme setup; do not assume this
repository's theme key, routes, ports or server lifecycle.

Keep the SDK's minimal host-page interface compatible. The optional CLI can use
the host's supported Playwright API for navigation/actions; adding those methods
must not force existing SDK users to adopt a different engine's Page type.
Document tested host Playwright versions and missing browser/tooling diagnostics.
Source imports must not load or download browser tooling.

For each configured case: establish readiness, apply theme/direction/viewport,
run the declared state transition, assert its expected result, settle relevant
assets/geometry, measure the actual state and record coverage. A callback label
alone does not satisfy state coverage. Prevent stale state from a previous case
by using defined reset/reinitialization semantics.

## First rule set

Prioritize measurable contracts with reliable fixes:

- Missing accessible names, form-label/error references and inconsistent state attributes.
- Contrast against actual resolved surfaces in applicable resting/interactive states.
- Document horizontal overflow, clipped content and offscreen overlays.
- Font loading, approved typography roles and numeric tabular/alignment contracts.
- Role-specific control geometry, target areas and normal/joined/dense spacing.
- Declared inset, nested-radius and alignment relationships.
- Focus visibility/obscuring, keyboard completion, dismissal and focus restoration
  through real interaction assertions.

Use palette/schema checks for all cheap theme branches and browser measurement
for actual alpha/background composition. Distinguish disabled, hidden and
applicable enabled content. Unsupported paints or inaccessible content produce
unresolved coverage, not guessed values or a global contrast suppression.

Content/copy opinions, decoration density, gradients and marketing layout taste
remain optional contextual guidance. The standard preset should not ban every
card, centered heading or approved brand choice. Named recipes can impose
stronger hierarchy/decoration contracts when their purpose justifies them.

## Reports and exit behavior

Extend current reports compatibly or provide a versioned CLI envelope retaining
existing SDK data. Include engine and policy/schema versions, component contract,
URL, renderer when declared, theme/preset, state, viewport, direction, measurement,
expected value, severity, fix and related region. Record screenshots/traces and
the real assertions completed for interaction contracts.

Coverage distinguishes checked, failed, unresolved, unsupported, unvisited and
explicitly excluded cases. Inventory frames/open shadow roots and document that
closed roots cannot generally be counted. A main-document audit does not imply
that frame/shadow content or unopened states were inspected.

| Exit | Meaning                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------- |
| 0    | Complete passing execution for the declared policy and coverage, including any valid scoped exclusions   |
| 1    | Complete execution with unsuppressed findings at the configured failing severity                         |
| 2    | Invalid setup, unavailable page, timeout, failed state setup or incomplete required measurement/coverage |

Incomplete execution takes precedence over a findings-only result. A report-only
mode may relax finding severity but cannot turn an incomplete required audit into
success. Exceptions name the rule, stable contract/selector, reason, owner and
scope. Preserve excluded/suppressed results and report unused exceptions. Required
contract coverage cannot be waived accidentally through a broad selector.

## Clean and deliberately broken fixtures

Reuse installed Button/form, Combobox and overlay fixtures first, then settings
and dashboard recipes. Cover light/dark, mobile/desktop, long content, applicable
loading/disabled/invalid/open/focused states, RTL and reduced motion. Follow R3
for deterministic assets, screenshots and supported browsers.

Each enabled measurement needs a meaningful positive and deliberately broken
fixture. Assert rule/contract IDs, actual/expected values and corrective guidance.
Include broken setup/state callbacks, unloaded fonts, unsupported contrast,
missing metadata, unvisited required states, unchecked frames and malformed
exceptions. Verify the expected nonzero result and retained evidence.

Keep clean consumer fixtures separate from the documentation catalog's classified
baseline. Documentation examples intentionally demonstrate many states and
styles. Do not raise warning caps, allow zero gaps everywhere or globally disable
contrast to make the catalog appear clean.

## A2 contextual guidance and adoption

Classify observed findings by component/recipe owner and measurable cause. Fix
shared defaults first, then tighten the remaining baseline by category. Existing
exceptions require a specific contract reason; new files have zero unreviewed
violations under their chosen policy.

Add advisory rules only when valid/broken examples and false-positive review
support them. Explain applicability and customization routes. Contextual checks
for over-decorated regions or weak hierarchy belong to declared recipes/policies
rather than universal element-count limits.

Provide consumer examples for source-only ESLint, SDK use in existing Playwright
tests, and optional CLI use against the application's own server. Preserve
complete Foldkit code and equivalent examples for all renderers. Publishing the
package remains a separately authorized release action.

## Work item and completion contract

**Objective:** portable optional measurements and interaction evidence that
distinguish passing UI, findings and incomplete execution.

**Scope:** rendered SDK/adapter, policy and metadata integration, optional CLI,
report types, fixtures, package setup/docs and consumer CI examples.

**Inputs:** pinned engine, existing SDK semantics, R1/R2 roles/contracts and R3
fixtures. Resolve exact dependencies before changing public interfaces.

**State ownership:** consumer apps own their Models; audit callbacks drive
public browser interactions. Tooling must not rewrite application state to
manufacture a passing case.

**Public API:** preserve SDK exports/minimal page interface; add documented
versioned metadata/reports and proposed audit configuration/command.

**Behavior contract:** actual declared state transitions and applicable focus,
selection, dismissal, validation and overflow/contrast contracts are exercised.

**Evidence:** every enabled rule can fail, clean three-renderer fixtures pass,
exit-code coverage is complete, optional tooling installs independently and
reports expose all required coverage outcomes.

**Migration:** keep existing reports usable through compatible additions or a
versioned envelope; document policy/engine changes and separate old baselines.

**Stop conditions:** unsupported required measurement or engine/tooling
compatibility blocks that coverage or release claim; it does not justify a
fabricated pass or weakened default.

## Acceptance checklist

- [ ] Consumers configure their own pages, readiness, themes and states.
- [ ] Metadata and expectations come from shared component/theme contracts.
- [ ] Interaction claims include real assertions, not only post-action screenshots.
- [ ] Each enabled measurement has valid and broken fixture proof.
- [ ] Findings and incomplete execution have distinct tested exit behavior.
- [ ] Reports retain exclusions, unresolved coverage, versions and evidence.
- [ ] Source-only installation remains free of browser requirements.
- [ ] Guidance stays contextual and documentation baseline cleanup is classified.
