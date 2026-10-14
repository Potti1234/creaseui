# Legacy `test:e2e` triage

Baseline: local `CI=1 npx playwright test` on PR #28 (`b120cee`) failed 47 tests, the same set that fails on the #27 CI run. Most are stale specs written for the crease-only docs fixtures before the shadcn 1:1 docs ports, the two-renderer header link, or retired features. A few are real product bugs. Specs are updated to the current fixtures without loosening what they assert; product bugs are fixed in source.

## CI worker count

With 4 workers, CI failed 12-16 extra tests that changed from run to run, with browser-session errors (`session closed`, `Target.createTarget`). With `PLAYWRIGHT_WORKERS: 2` (`77b5e6e`), run on `efd38b7`: 261 passed, 23 failed, 1 flaky, 1 did not run in 25.9 min. All 23 failures and the flaky test (`sidebar hover menus`) are in the inherited #27 set below. None of the CI-only failures came back, so they were caused by load.

The `browser` job on the same commit failed 1 of 672 (667 passed, 4 skipped): `[pleat] sheet.spec.ts:228 bottom sheets ease into view without dialog scrolling at 390px`. The job log doesn't include the assertion error, which is only in the uploaded report artifact. Locally the test passes 10/10 on the Pleat build (`--repeat-each=5`, both widths). Unresolved: not classified as flaky until the CI error has been read.

## Fixed

| Test                                                                                          | Cause                                                                                                                                          | Fix                                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| site: tour is removed from component navigation                                               | pagination follows category order, spec pinned the alphabetical neighbour                                                                      | `ea9d387` assert two links and no tour link                                                                                                          |
| site: authored tabs keep child instances                                                      | stray radio-group lines referenced undefined locators                                                                                          | `5e42f70`                                                                                                                                            |
| blocks: app-shell-01 desktop/mobile (4)                                                       | block renders plain markup with no Sidebar component                                                                                           | `eeacbda` wait for `main`, skip the Sidebar trigger flow                                                                                             |
| site: Create is available on both sites, docs integration model, others using `visitRenderer` | header link now cycles tailwind -> stylex -> pleat                                                                                             | `7b8d2b3` navigate by origin                                                                                                                         |
| site: StyleX Create constrained board                                                         | board-constrained retired in `7a2a65e`                                                                                                         | `88a0d32`/`eeeb9e8` assert the full board                                                                                                            |
| site: component docs explain the Foldkit integration model                                    | Toast became a submodel                                                                                                                        | `eeeb9e8` check the recipe badge on Breadcrumb                                                                                                       |
| site: primitive inspector                                                                     | feature only existed on the retired constrained board                                                                                          | `5d379b3` removed                                                                                                                                    |
| carousel (3)                                                                                  | shadcn examples have 5 slides, sections renamed                                                                                                | `b46c456`                                                                                                                                            |
| site: kbd keeps semantic notation / kbd sections                                              | sections renamed; **product bug:** tooltip triggers nested a Button inside a button                                                            | `dcc240b` renderTrigger + spec update                                                                                                                |
| site: flagship docs accessibility                                                             | **product bug:** icon-only Button Group menu trigger had no name                                                                               | `7330ecd` triggerAriaLabel                                                                                                                           |
| site: switch                                                                                  | crease-only fixtures (read-only, hidden form value, description) replaced by shadcn fixtures; axe flagged shadcn muted text on the choice card | `226f201` toggle, disabled, RTL thumb; axe ignores only the pairs in `e2e/accepted-contrast.ts` (`a0b3b1a`). Gap: no read-only or form-value fixture |
| site: collapsible                                                                             | `#details` external-control fixture replaced by shadcn fixtures                                                                                | spec covers click/Space/Enter, aria-controls panel, reduced motion and the aria-disabled trigger in both renderers. Gap: no external-control fixture |
| site: menubar child models                                                                    | crease-only fixtures replaced by shadcn fixtures                                                                                               | `02c61a1`                                                                                                                                            |

## Remaining (first error on the current build)

| Test                                          | First error                             |
| --------------------------------------------- | --------------------------------------- |
| application: public catalog a11y scan         | URL not `/docs/components/accordion`    |
| application: dialog contract                  | no `Open profile` button                |
| blocks: StyleX sidebar disclosure             | no `Installation` link                  |
| site: Foldkit-native docs contained on mobile | no `Browse components` text             |
| site: authored slider                         | `#range` lower thumb value              |
| site: button-group sections                   | `#inputgroup` voice toggle aria-pressed |
| site: command dialogs                         | combobox value `Calculator`             |
| site: context menu sections                   | `#checkboxes` trigger                   |
| site: direction                               | `#mixed-direction` LTR text             |
| site: drawer                                  | `#docs-drawer-11` swipe handle count    |
| site: hover-card sections                     | `#rtl` trigger `يسار`                   |
| site: input-group sections                    | `#button` Copy button                   |
| site: item semantic collections               | `#collection`                           |
| site: item sections                           | hero profile link                       |
| site: label                                   | `#input-label`                          |
| site: marker                                  | `#separator` marker variant             |
| site: message                                 | `#incoming`                             |
| site: message scroller                        | layout height `< 80`                    |
| site: popover                                 | `#interactive-content` code import      |
| site: presentational helpers / separator      | `#vertical` separator aria-orientation  |
| site: sheet                                   | `#compound-layout` trigger              |
| site: sidebar hover menus                     | menu item in viewport                   |
| stylex-preflight: light overlays              | `Close` button                          |
| stylex-template-system (2)                    | dashboard recipe table / recipe list    |
