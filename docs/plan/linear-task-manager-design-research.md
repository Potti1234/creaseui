# Linear design research for the Crease task manager tutorial

Date: 2026-10-15. Status: initial source-backed research and proposed product rules.

The user selected a small task-management frontend with Linear as its baseline:
clean presentation, strong consistency, usability, and careful small interactions.
Implement Tailwind first, with client-side persisted sample data and no backend.
The user will create the separate application repository named creaseui-demo.

This research supplies decisions for the
[product brief and version plan](tutorial-product-discovery-and-repository-plan.md).
It does not make every Linear feature part of the app. The proposals below need
to become a coherent local product policy and working interaction, not a collection
of visual references pasted onto generic components.

## Evidence and interpretation

Each principle separates what Linear documents from the proposed adaptation and
its verification. Official product/design posts are the primary evidence.
Third-party breakdowns can suggest further questions, but validate behavioral
claims against current first-party material.

The 2024 redesign article provides historical context; the March 2026 refresh
describes newer refinements. Recheck the source baseline before implementation.
These sources do not establish exact CSS measurements or universal timing budgets.
Measure and review the chosen app's actual typography, density, motion and focus.

## Research principles

### L01 Give task content the strongest visual emphasis

Linear's 2026 refresh reduces competing navigation/icon emphasis and softens
unnecessary separators. Its intent is to keep dense work readable.
[A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh)

Proposed adaptation: quieter navigation, restrained status/icon treatment and
clear issue hierarchy. Define semantic tokens and reusable row/header patterns.
Verify cross-screen emphasis and contrast rather than a global border/icon ban.

### L02 Keep navigation and actions in predictable places

The same refresh identifies inconsistent header actions as a source of drift.
[Linear interface refresh](https://linear.app/now/behind-the-latest-design-refresh)

Proposed adaptation: shared location/header/view-control regions and action slots.
Check identical responsibilities across issue and project views, including narrow
layouts. Product pattern assembly can enforce placement; browser review confirms it works.

### L03 Design the visual system across themes and view types

Linear's redesign describes coordinated theme work and testing navigation,
appearance and hierarchy across view structures.
[How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)

Proposed adaptation: tune tokens and row/header/control geometry on the same real
dataset, then test list, detail and any approved board layout. Include long titles,
empty states, selected rows and both required themes. A single attractive screenshot
does not establish consistency.

### L04 Make contextual actions fast for pointer and keyboard users

Linear's contextual-menu article explains shortcut discoverability and a pointer
safe area for reaching submenus diagonally.
[Invisible details](https://linear.app/now/invisible-details)

Proposed adaptation: share action definitions between context menus and commands,
show relevant shortcut hints, and verify submenu pointer travel. Reuse and inspect
Foldkit menu behavior; do not port the article's React implementation. Test focus,
dismissal, disabled items and reliable activation.

### L05 Change a small issue property in context

Linear documents assignment from an issue's properties, directly from list/board
avatars, or through an assignment menu and keyboard command.
[Assign and delegate issues](https://linear.app/docs/assigning-issues)

Proposed adaptation: product StatusPicker, AssigneePicker and PriorityPicker
patterns use an appropriate accessible menu/select/searchable picker near the
trigger. Choosing a value updates that issue without opening a full edit form.
Preserve the underlying view's selection and position, restore focus, and provide
a pointer-accessible route alongside shortcuts.

These are proposed local component names, not existing Crease exports.

### L06 Choose the overlay for the task

Linear creates issues in a modal, supports drafts when navigating away, and permits
inline editing of existing issue titles/descriptions.
[Issues](https://linear.app/docs/creating-issues)

Proposed adaptation: use lightweight pickers for property edits and a focused
composer for multi-field creation. Define draft persistence, dismissal and submit
behavior explicitly. The user's preference for quick navigation becomes a
contextual rule; a universal no-dialog rule would contradict this documented flow.

Verify keyboard focus, draft retention, required title, and repeated creation.

### L07 Preview without abandoning the collection

Linear documents a peek preview, including moving among adjacent items and closing
the preview.
[Peek preview](https://linear.app/docs/peek)

Proposed adaptation: consider an issue preview/detail surface as part of the
approved scope. Preserve collection context and expose a normal pointer route
to details. Verify closing returns to the same relevant row and that next/previous
navigation does not discard edits. A peek feature remains a scoped proposal.

### L08 Make filters editable and reflect their actual meaning

Linear distinguishes filtering from displayed properties and documents editable
filter values/operators.
[Filters](https://linear.app/docs/filters),
[Display options](https://linear.app/docs/display-options)

Proposed adaptation: show applied filters and a clear removal path. Keep filtering,
grouping, sorting and display choices separate in the local model. Begin with a
small useful subset. Verify actual results, visible selection and meaningful
empty-result recovery instead of decorative filter chips.

### L09 Keep navigation and search within easy reach

Linear documents workspace search, recent items and search within the current view.
[Search](https://linear.app/docs/search)

Proposed adaptation: a visible search entry plus keyboard access, useful recent
issues and direct issue navigation. Give commands the same underlying actions as
menus. Do not intercept text-input shortcuts indiscriminately. Test typing,
Escape, focus restoration and navigation back to the prior list context.

### L10 Keep priority choices small and explicit

Linear deliberately limits issue priority to a fixed small set to avoid excessive
granularity.
[Priority](https://linear.app/docs/priority?noRedirect=1)

Proposed adaptation: use one finite priority vocabulary and one picker across rows,
details and creation. Decide the labels in the product brief, then share the type,
contract, rendering and sample data. Test valid choices, unassigned priority and
the intended ordering; do not create a decorative badge per screen.

### L11 Make selection and bulk actions a coherent interaction

Linear documents pointer/keyboard highlighting, explicit selection, clearing with
Escape, and actions over the selected items.
[Select issues](https://linear.app/docs/select-issues)

Proposed adaptation: distinguish focused, hovered and selected rows in state and
presentation. If bulk actions are in scope, use the same property/action vocabulary
and update the actual selected records. Test selection persistence, clearing and
actions after filtering. A checkbox without working selection is insufficient.

### L12 Keep the product purpose and scope clear

Linear's method emphasizes creator productivity, familiar terminology, reducing
busy work, and starting simply.
[Principles and practices](https://linear.app/method/introduction)

Proposed adaptation: the tutorial's first release supports capturing work, finding
the next issue and changing it with little interruption. Establish these task
flows before adding reports or a large settings hierarchy. Keep local product
policy small enough for a reader and an agent to apply.

## First local slice and later product scope

Confirmed after the research: start with issue list and quick editing, a light
theme close to Linear, desktop first, a small software/product team, English and
Crease Tasks as the working name. The review happens locally on one coherent
slice before the rest of the frontend is built. The first implementation now
lives in the sibling creaseui-demo directory and uses reviewed PR 28 commit
244b4c79cf901a28f7e2e8d57a9b4dd59aaee390.

The implementation distinguishes source observations from local decisions:

| Research principle                     | First-slice adaptation                                                                                       | Evidence to request                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| L01–L03 attention and stable structure | Quiet persistent rail, stable location/action header, separate filter/display toolbar, one shared row layout | Review real content, open menus, focus, empty results and narrower widths      |
| L04–L05 contextual changes             | Three shared property pickers, used by rows and creation                                                     | Same values, actual persistence, Arrow/Enter/Escape and focus after regrouping |
| L06 commit boundary                    | A small composer, required title and explicit submit; closing retains the in-session draft                   | Validation, close/reopen, Control/Command+Enter, created row and reload        |
| L08 separate filtering and display     | Priority/unassigned filtering independent of priority/default ordering                                       | Actual counts and ordering, removable filter and useful empty recovery         |
| L09 finding work                       | Visible current-view search and a shortcut                                                                   | Query matching and focus; this is not a full workspace search implementation   |
| L10 one priority vocabulary            | Urgent, High, Medium, Low, No priority                                                                       | Shared schema, icons, choices and sort order                                   |
| L11 distinct interaction states        | Hover/focus and a recent-created highlight                                                                   | No fake bulk-selection UI; multi-select remains later work                     |

The 236px rail, 58px location header, 52px toolbar, 44px rows, named appearances,
specific type scale and palette are proposed product values. They are not claimed
Linear measurements. The prototype's slash shortcut searches the current view;
Linear distinguishes workspace and view search. Label that adaptation honestly.

The longer product proposal remains:

Use it after the first direction is accepted, without asking the user to restate
their task-management choice:

1. A shared app shell and issue collection with useful grouping/filtering.
2. An issue detail view with title, description, status, assignee, priority and
   realistic activity where appropriate.
3. Quick issue creation and in-context property editing from the list and details.
4. Search/navigation that returns users to their relevant collection context.
5. Client-side persistence, deterministic sample data and a reset mechanism.

My Issues, a project-focused view, board layout, peek and bulk actions are sensible
next candidates. Select the smallest combination that proves the important
patterns. Do not promise all candidates, a full Linear clone, collaboration, an
agent integration or a backend without a separate scope decision.

The remote repository URL/visibility, visual acceptance and exact reviewed
version map remain open. Dark mode, detail routes, board, global search and bulk
selection are outside this first local slice. Linear is the accepted reference;
the user does not need to supply more products before reviewing this prototype.

## From research to a consumer design system

Implement a compact local vocabulary around issue rows, shared headers, property
pickers, action menus, the composer and the chosen detail presentation. Build those
from Crease components and approved composition. Keep domain values in the feature
Model and transient picker/menu/dialog state in the appropriate interaction model.

Map the rules to the mechanism that can actually verify them:

| Product decision                                           | Primary mechanism                         | Complementary evidence                            |
| ---------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| A property edit uses the approved local picker             | Public API and contract/import boundaries | Actual commit, close and focus behavior           |
| Header regions have fixed responsibilities                 | Structured shared pattern                 | Cross-screen and narrow-layout review             |
| Priority values remain finite                              | Shared type/runtime contract and lint     | Real sorting/filtering scenarios                  |
| Feature code cannot restyle controls                       | Existing strict Crease source policy      | Component-owned states and theme checks           |
| Context menus and keyboard commands invoke the same action | Shared action/message definitions         | Pointer/keyboard equivalence scenarios            |
| Navigation preserves collection context                    | Explicit route/view state ownership       | Back/close restores relevant selection and scroll |
| Visual emphasis remains consistent                         | Semantic tokens and product patterns      | Reviewed states/screens and appropriate contrast  |

Some of these require a new consumer pattern or extension to public contract
tooling. They are not claims that the current lint package already proves them.
Avoid matching raw function names or forbidding every Dialog from application code.

## Proposed first visual and interaction review

Review the issue list with realistic dense content and one open property picker,
then the corresponding issue detail/composer. Show default, hover, keyboard focus,
selected, empty, long-content and applicable failure states. Include the chosen
desktop/narrow and theme combinations.

Record the agreed row density, typography, alignment, separators, icon treatment,
header geometry and overlay behavior as product tokens/pattern decisions. Source
and screenshots must identify the same app commit. Review the working tasks as
well as the images before expanding across additional screens.

Carry accepted feedback into the app's design log, local policy, component
examples and subsequent tutorial versions. Changes to token or interaction
policy should be visible in the version diff and taught in the maintenance lessons.
