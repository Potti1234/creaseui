# Crease Tasks first local slice and agent handoff

2026-10-15. Status: working local prototype for visual iteration, not an accepted
visual baseline, finished guide series, merged reliability release or published app.

Architecture correction: the first slice centralized component CSS and rebuilt
navigation despite an available Crease Sidebar. Its authoring sources are ignored
by lint. These are implementation defects, not the architecture to teach. Complete
the [repair and enforcement plan](tutorial-architecture-enforcement-plan.md)
before extending or freezing this checkpoint. Existing browser evidence remains
interaction/appearance evidence, not proof of correct component ownership.

## Confirmed scope and source

The user chose an issue list and quick editing, light theme close to Linear,
desktop first, English, a small software/product team and Crease Tasks as a working
name. Tailwind is first. All data is client-side and synthetic; no backend.

The app is in C:/Users/lpottner/Documents/MaasProjects/creaseui-demo. The user will
create the remote repository called creaseui-demo. The local dev URL is
http://127.0.0.1:5197. Do not substitute a hosted preview without a request.

The source foundation is reviewed PR 28 commit
244b4c79cf901a28f7e2e8d57a9b4dd59aaee390. The review checkout is the sibling
creaseui-reliability-review. The user authorized this baseline while a separate
agent works on the remaining defects. Do not switch to a newer PR head silently.

crease-source.json identifies the registry items and baseline. The unpublished
lint package is packed into vendor so the app's normal install/build/run is
independent of sibling directories. Source-owned product adaptations are local;
the upstream repair assignment remains separate.

## Working slice

- Persistent navigation for All issues, My issues, Active issues and two projects.
- One realistic dataset, grouped by four statuses, with shared issue identifiers,
  project metadata, priority and teammate assignments.
- Status, priority and assignee pickers shared by rows and the composer.
- Search within the current view, priority/unassigned filtering, default/priority
  ordering, group collapse, and useful empty-result recovery.
- Issue creation, required-title validation, in-session draft retention,
  Control/Command+Enter and a confirmed sample reset.
- Versioned browser storage for issues, schema validation at startup and explicit
  persistence failure messaging. Drafts and view preferences are not yet durable.

There is no full issue detail route, activity timeline, board, collaboration,
authentication, backend, dark theme or global workspace search in this checkpoint.
Do not make static rows look like working links to missing pages.

## Product system and tutorial material

The app owns its brief, principles, review notes and pilot essay. Its src/design
patterns have finite public APIs. Feature views compose those patterns instead of
raw controls/layout/text or base-component appearance overrides. The copied Crease
sources add named appearances; they retain Crease/Foldkit behavior.

The initial strict lint checks feature files and the product import boundary.
Known component-authoring files are excluded by exact paths at this checkpoint,
not a directory wildcard. New neighboring files remain checked. This is an
explicitly incomplete authoring-policy stage; do not present the prototype as
finishing the full source package, installer ownership or permissions plan.

The handwritten product contracts are explicit and reviewable because the reviewed
upstream init still misses some factory-created public exports. Replace this
temporary contract maintenance with the completed installer mechanism only after
reviewing the corresponding upstream fix and migration.

## Local implementation lessons to retain

1. A value change and a focus change are separate outcomes. Use child update
   results and schema-checked domain values. Focus after the DOM commit; if a filter
   removes the trigger, return focus to the collection heading.
2. A menu must focus a real option when opened and on keyboard movement. Merely
   changing an active CSS state or focusing the menu container is insufficient.
3. The copied DropdownMenu consumed Ctrl/Command+Enter as ordinary Enter. The local
   source now leaves modified keys to the product shortcut layer. Keep this focused
   behavior correction in an upstream update, and test pointer and keyboard routes.
4. Closed menu triggers no longer reference an unmounted popup through aria-controls.
   Avatar initials are decorative inside already named menu options.
5. Quiet text still needs sufficient contrast. Secondary colors and avatar initials
   were adjusted after rendered checks, rather than accepting the initial screenshot.
6. Keep keyed rows fresh across filtered/grouped collections. Reusing mutable cached
   VNodes across changing positions caused a real navigation crash during development;
   that cache was removed. Stable keys remain. Any later performance optimization
   needs filter, navigation and reset coverage, not just a faster static render.

## Review and next assignment

Review the live list, one open picker, composer, empty state and keyboard path.
Record feedback on density, title/metadata hierarchy, labels, header/rail balance,
focus treatment and picker placement. The current geometry and palette are our
proposed values, not published Linear specifications.

After feedback, improve this same slice and update the product decisions, tokens,
API contracts, examples and pilot essay together. Then choose the first frozen
checkpoint and its branch/tag. Do not create all chapter versions from an unreviewed
prototype or claim a later screenshot is evidence for an earlier branch.

The full guide-series, policy/AI and repository-version plans remain the larger
assignment. Keep their complete code, visual explanation, migration and upstream
upgrade requirements. This checkpoint is the concrete starting product, not a
replacement for those plans.
