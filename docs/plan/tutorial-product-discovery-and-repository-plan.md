# Tutorial product discovery repository versions and design iteration

Date: 2026-10-15. Status: task-manager direction, Tailwind, local data, repository
name, editorial audience and first local slice confirmed. The local visual
prototype is in creaseui-demo; the remote URL and visual acceptance remain open.

The tutorial must produce a real, polished frontend in a separate Git repository.
It uses components and tooling from Crease, develops a consumer-owned design system,
and preserves the versions taught in independently runnable branches. The tutorial
goes into the decisions, implementation, verification, and subsequent changes in
enough depth that a reader can repeat them for their own product.

This specification supplements the [guide series](design-system-guide-series-plan.md),
[application tutorial](design-system-tutorial-spec.md), and
[policy and AI workflows](design-system-policy-and-ai-plan.md).
[Linear research](linear-task-manager-design-research.md) provides the initial
source-backed principles. This specification replaces the original generic
workspace-administration scenario with the user's selected task-manager direction.

## Confirmed requirements and open decisions

| Requirement                                                                   | State                                                                                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Separate application repository with real frontend source and its own history | Required                                                                                                 |
| One accessible branch per tutorial version                                    | Required                                                                                                 |
| In-depth lessons with complete code, rationale, checks and change history     | Required                                                                                                 |
| Polished consistent product with realistic content and working interactions   | Required                                                                                                 |
| User input and iterative visual/product review before broad implementation    | Required                                                                                                 |
| Existing Crease foundation with a consumer-owned product system               | Required                                                                                                 |
| Product                                                                       | Focused task manager; a few important screens/workflows, not all of Linear                               |
| Visual direction                                                              | Clean/simple Linear baseline, with consistency, usability and small interaction details                  |
| Data and services                                                             | Client-side persisted sample data; no backend                                                            |
| Primary renderer                                                              | Tailwind first; no additional technical constraints supplied                                             |
| Separate repository                                                           | User will create creaseui-demo; remote URL and visibility will follow from that repository               |
| Audience and editorial direction                                              | Experienced developers; deep concepts/problems, examples, visual guides and technical essays             |
| Editorial references                                                          | Matt Rothenberg's articles and Logging Sucks                                                             |
| First local slice                                                             | Issue list and quick editing: persistent navigation, status/assignee/priority pickers and quick creation |
| Appearance and device priority                                                | Light theme close to Linear; desktop first, broader responsive polish after review                       |
| Sample product                                                                | Crease Tasks working name, small software/product team, English                                          |
| Review arrangement                                                            | One local slice first, iterate before broad implementation                                               |
| Remaining detailed choices                                                    | Remote URL/visibility, accepted visual adjustments and the final reviewed chapter/version map            |

### Recorded user answers

| Question IDs      | Confirmed answer                                                                                                     | Consequence                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| P01, P03-P04, F01 | Build a task manager with a few important screens and workflows using Linear as the baseline                         | Propose a bounded issue list/detail/create/edit scope; do not ask the user to restate the general page direction      |
| V01-V02, V04      | Clean and simple, with value placed on consistency and small interactions; Linear is the supplied reference          | Research real decisions and validate a coherent direction; additional reference products are optional                 |
| D01, D04, T02     | No backend; use client-side stored sample data                                                                       | Actual persisted local operations and deterministic fixtures; backend/auth infrastructure is outside scope            |
| T01               | Start with Tailwind                                                                                                  | Review the primary product slice before companion renderers                                                           |
| T03               | User will create a repository called creaseui-demo                                                                   | Do not create another remote; use the supplied URL once available                                                     |
| L01-L02           | Assume existing knowledge; explain new problems/concepts deeply through blog-style posts, examples and visual guides | Avoid beginner/general frontend explanations; produce a pilot technical essay                                         |
| F02, L03          | Issue list and quick editing for the first local review                                                              | Build one coherent collection with working property pickers and creation; no full product expansion before feedback   |
| V03, V05          | Light theme close to Linear, desktop first                                                                           | Polish the light desktop direction first; narrow-layout containment is a basic check, not completed responsive design |
| P02, P05, V06     | Accept the proposed small software/product team, English copy and Crease Tasks working name                          | Use consistent realistic sample work and four teammates; brand/name remain editable working defaults                  |
| L03, L04          | Review only one part locally and iterate                                                                             | Keep the app local and do not freeze all chapter branches or publish the frontend before acceptance                   |

The user subsequently authorized continuing from reviewed PR 28 commit
244b4c79cf901a28f7e2e8d57a9b4dd59aaee390 while another agent repairs its remaining
findings. The first slice uses that pinned baseline, not an unreviewed moving PR
head. Product-owned adaptations are recorded separately from upstream fixes.
See [first-slice handoff](linear-first-slice-implementation-brief.md).

The detailed first-slice research is linked above. Keep proposed density values,
secondary behaviors and future screens distinguishable from confirmed scope.

## Discovery and decision record

Collect answers in manageable rounds. Start with the product and its visual
references, then resolve workflow/content details, technical/repository choices,
and teaching/review expectations. Users may answer in their own words or mark an
item "propose options." A proposed option is not a silently accepted decision.

Record each answer with its question ID, date, relevant reference, and resulting
scope/design decision. Distinguish confirmed decisions, explicit delegated choices,
and unresolved questions. Do not replace unanswered items with an assumed generic
SaaS brief.

Before application implementation, prepare an approved product brief covering the
critical choices: audience/job, main workflows, first release scope, visual direction,
actual content/data approach, device priority, renderer, and repository destination.
Secondary decisions can remain explicit proposals with a planned review point.
Elapsed time does not resolve a required product decision.

Do not re-ask answered questions. For missing routine implementation details,
propose a reasonable option and record whether the user delegated that choice.
The initial questionnaire remains an inventory for future readers; its presence
does not mean every row is still unanswered in this project.

The application repository will own its product brief and continuing design log.
This planning file records discovery and the cross-repository contract in Crease.
Link the accepted app brief by repository and revision when it exists.

## Complete questionnaire

Ask follow-up questions based on the answers. This is the initial full discovery
inventory, not a request to invent detailed answers to every item immediately.
The "needed" column indicates when a decision must be resolved or explicitly
delegated to an agent.

### Product and audience

| ID  | Question                                                                                                                | Needed             |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------------------ |
| P01 | What product should this be, what is its working name, and what problem does it solve in one sentence?                  | Before build brief |
| P02 | Who uses it, in what context, and what do they find difficult with current alternatives? Are there distinct user roles? | Before build brief |
| P03 | What are the three most important tasks a user should complete, and what would successful completion look like?         | Before build brief |
| P04 | Which capabilities belong in the first useful release, which belong later, and what should we deliberately leave out?   | Before build brief |

### Pages workflows and interaction

| ID  | Question                                                                                                                                       | Needed                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| F01 | Which pages or main destinations should exist, and which is the first screen after opening the app?                                            | Before initial structure      |
| F02 | Which one or two screens best express the product and deserve the earliest visual review?                                                      | Before concept review         |
| F03 | Which workflows require editing, explicit saving, autosave, confirmation, undo or history? Describe the expected user experience.              | Before related workflow build |
| F04 | Which richer interactions are essential: search/filtering, tables, charts, drag/drop, uploads, collaboration, notifications or something else? | Before scope baseline         |

### Data and services

| ID  | Question                                                                                                                                                    | Needed                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| D01 | Is there an existing backend/API, should this be a frontend with realistic simulated services, or should a backend be built separately?                     | Answered: no backend, persisted sample data |
| D02 | What realistic entities, sample records, quantities, statuses and relationships should populate the app? Can existing public or local examples inform them? | Before detailed screen design               |
| D03 | Does the app need authentication or role-dependent views, and should those be real integrations or explicitly simulated for the tutorial?                   | Before architecture                         |
| D04 | What must persist after refresh, and are offline, real-time updates, import/export or cross-device use required?                                            | Before related state design                 |

### Visual direction and brand

| ID  | Question                                                                                                                                                           | Needed                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| V01 | Which products or screens should guide us, and what should we learn from them?                                                                                     | Answered: Linear; additional references optional |
| V02 | What should the product feel like? Describe a few qualities and choose priorities if they conflict, such as dense versus spacious or restrained versus expressive. | Before concept review                            |
| V03 | Are there existing colors, typefaces, logo, illustrations, photography or icons to use? Supply available links or local paths; otherwise should these be proposed? | Before visual baseline                           |
| V04 | Which concrete interface patterns or examples feel generic, distracting or wrong to you? What specifically should our design avoid?                                | Before concept review                            |

### Layout interaction detail and accessibility

| ID  | Question                                                                                                                                                       | Needed                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| I01 | Is this desktop-first, mobile-first or equally important on both? What screen sizes and use contexts matter?                                                   | Before layout                  |
| I02 | Do you prefer compact information density or more breathing room? Any preference for sidebar/top navigation, list/table/card presentation or action placement? | Before visual baseline         |
| I03 | Is light mode, dark mode or both required? Are RTL, particular keyboard workflows, forced colors or other audience-specific accessibility needs relevant?      | Before verification scope      |
| I04 | How much motion should there be, and which interactions should feel especially polished or immediate?                                                          | Before motion/interaction work |

### Content and product voice

| ID  | Question                                                                                                                                       | Needed                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| C01 | Which language, locale, date/number/currency formats and tone should the actual product use?                                                   | Before detailed screen design |
| C02 | Do you already have terminology, realistic content or example messages, and which should we write together?                                    | Before content baseline       |
| C03 | What should first use, empty results, loading, validation and service failures feel like? Any existing examples or recovery behavior you want? | Before state design           |

### Technical choices and repository

| ID  | Question                                                                                                                                                          | Needed                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| T01 | Which renderer is primary for the real product: Tailwind, StyleX or Pleat?                                                                                        | Answered: Tailwind first                                                         |
| T02 | Are there package-manager, hosting, browser, frontend integration, API or other technical constraints?                                                            | Before implementation                                                            |
| T03 | What GitHub repository should the app use?                                                                                                                        | User will create creaseui-demo and supply its URL; visibility follows that setup |
| T04 | Should version branches correspond to each tutorial chapter or to larger product milestones? The proposal is one per chapter with an exact reviewed tag for each. | Before checkpoint history                                                        |

### Tutorial depth and AI workflow

| ID  | Question                                                                                                                                                           | Needed                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| L01 | What knowledge should the reader have at the start?                                                                                                                | Answered: experienced developers; explain newly introduced concepts deeply                               |
| L02 | Which editorial formats help most?                                                                                                                                 | Answered: technical essays in the style of Matt Rothenberg and Logging Sucks, examples and visual guides |
| L03 | How independently should an AI agent handle ordinary feature work, component changes, policy changes and visual decisions? Which need a planned review checkpoint? | Before AI workflow lessons                                                                               |

### Iteration and completion

| ID  | Question                                                                                                                                   | Needed                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| W01 | What should the first useful milestone contain, and are there timing or effort constraints?                                                | Before delivery sequencing |
| W02 | How should you review work: local browser, hosted preview, screenshots with notes, side-by-side versions or a combination?                 | Before first design review |
| W03 | What would make you say the result is good enough? Name the most important functional and visual criteria, and any absolute deal-breakers. | Before acceptance baseline |

Accessibility fundamentals remain part of the component contract. These questions
identify additional audience and workflow requirements, not whether basic naming,
keyboard use, readable contrast and focus behavior can be omitted.

## Two repositories with distinct responsibilities

The user will create the application repository named creaseui-demo. Its full
remote URL becomes the source of truth when supplied; do not assume an owner or
create a duplicate repository. The product's visible name can differ from its
repository name.

| Repository          | Canonical content                                                                                                                  | Relationship                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Crease              | Reusable components and lint tooling; guide prose/catalog/search; links to example revisions                                       | Supplies pinned foundation versions                                  |
| Product application | Actual frontend, local design system, product policy/rules, assets/data, tests, agent guidance, product brief and version branches | Consumes Crease through its real installation/distribution mechanism |

Do not embed the app as a folder inside Crease, use a Git worktree as the permanent
separate product repository, or rely on a symlink back to Crease source.
Separate clones/checkouts may be used temporarily for development.

The app must install and run independently. Pin the relevant Crease registry
revision and lint version/artifact. If tooling is not published yet, provide the
tested steps to build it from an exact accessible Crease revision and install the
result. Do not depend on an unshared local tarball, absolute path, parent
node_modules or documentation stylesheet.

If the product reveals a missing generic component capability, fix it in a separate
Crease change with its tests, then update the app's pinned dependency. Product-only
choices stay in the product repository. Keep both changes and their compatibility
relationship traceable.

## Version branches and exact checkpoints

The final version granularity is awaiting T04. The proposed default maps the
existing fifteen chapters to branches tutorial/v01 through tutorial/v15.
If several chapters teach one product release, record an explicit many-to-one
mapping instead. Every taught version still has its own runnable branch.

| Reference                                   | Purpose                                                         |
| ------------------------------------------- | --------------------------------------------------------------- |
| main                                        | Latest accepted complete product state                          |
| tutorial/vNN                                | Discoverable runnable application state for tutorial version NN |
| work/<task> or an isolated working checkout | Active implementation/review before acceptance                  |
| tutorial-vNN-r1 and later revision tags     | Exact accepted checkpoint used by docs and downloads            |

These are proposed names, not existing branches or a promise that remote refs
have already been created. Record the chosen repository before constructing URLs.

Derive each teaching version from the preceding version's accepted source rather
than unrelated rewrites. In-progress work can remain on a working branch; create
or update the version branch after its normal verification and design review.
Early versions should be coherent at their intended scope, not deliberately ugly
screens kept until a final polish chapter.

Branches are the requested navigation mechanism. Use exact commit IDs and
annotated revision tags to pin reviewed source in docs; tags are kept immutable
by project policy and configured host protections, not automatically by Git.
Do not force-push accepted history or move a published revision tag. A later fix
gets a new revision tag and an explicit documentation/checkpoint update.

Do not merge the latest full product back into an early teaching version.
Backport only relevant, compatible fixes and verify that version's intended scope.
Retain prior documentation records so an older lesson remains explainable.

Maintain one version index with:

- Version, chapter IDs, predecessor, branch, accepted commit and revision tag.
- Tutorial state, supported renderer tracks, actual install/run/check commands.
- Crease/tooling baseline, package lockfile and required runtime versions.
- Product/design decision changes, migration notes and required evidence.
- Preview or screenshot links and the corresponding code revision.

Use this index for the docs' start/result links, source viewer, diffs and downloads.
The app owns its version record; the Crease catalog consumes the verified data
without maintaining a different manual mapping.

Keep version branches independent of renderer choice. Decide at T01 how the
primary product and companion tracks are organized. Preserve the existing
three-renderer guide parity requirement until explicitly changed; avoid creating
forty-five unrelated implementations with duplicated domain behavior.

## Depth of the teaching material

Each lesson explains the product problem, alternatives, selected decision and
consequences before showing the implementation. Work through meaningful source
changes and complete Model/Message/update/view integration; explain why an error
occurs and how the preferred correction preserves the system.

Include the before/after screen, exact branch/tag, file diff, complete source,
checks and expected result. Add focused exercises and a checked solution where
they teach a useful skill. State prerequisites instead of compressing several
unexplained setup steps into one command.

The application remains useful after the tutorial. Real tasks drive the patterns;
the frontend must not be a component gallery with invented business labels.
Service/data choices follow the user's brief. When a deterministic simulated
service is appropriate, give it realistic behavior, persistence where promised,
failures and recovery rather than decorative dead controls.

## Design input and visual iteration

Use the supplied references to create a small annotated reference board. For each
reference record the specific lesson, what belongs to that product's context, and
how the selected app should interpret it. Avoid copying a whole interface or
combining disconnected fashionable details.

Linear is the confirmed design reference. Research its actual rules and workflows
using primary material and distinguish observed behavior from proposed adaptation.
Further reference products are optional. Direction proposals should explore
coherent adaptations of that baseline, not reopen the product's entire art direction.

Prepare the product's real terminology and representative data before detailed
layout. Decide hierarchy, navigation, information density, surface use, typography,
spacing, color, action placement and motion as a coherent direction.
Explain each decision through product tasks.

Use these review checkpoints:

1. Product brief and scope: audience, jobs, pages, content/data and success criteria.
2. Direction: a small set of distinct proposals, normally two, with rationale and
   representative layouts; the user selects or combines specific decisions.
3. First detailed slice: the most representative screen plus a related workflow,
   at desktop and narrow sizes with actual content and applicable states.
4. System and cross-page review: tokens/components/patterns used on another screen,
   including whether the same decisions still work with different content.
5. Milestone reviews: complete tasks, meaningful states, responsive behavior and
   the visual acceptance criteria for each proposed version.

Use concrete review artifacts: local or hosted working UI, matching screenshots,
source revision and a short decision list. The format follows W02.
The user reviews the important design decisions; ordinary authorized refinements
within the accepted direction do not require repeated confirmation.

Define "avoiding generic AI UI" through the user's examples and product criteria,
not a universal ban on cards, gradients or decorative details. Review unnecessary
wrappers, arbitrary badges/icons, repeated generic summaries, meaningless metrics,
weak hierarchy, placeholder prose, inconsistent spacing and missing states when
they impair this product. The remedy should follow the accepted direction.

Maintain a design log with the feedback, affected screen/state, decision, changed
implementation and evidence. Screenshots alone do not replace working interactions.
Passing lint does not replace visual/product review, and visual approval does not
replace behavior/accessibility checks.

## Before the build assignment

Finish discovery with one consolidated handoff containing:

1. Confirmed product brief and a visible list of remaining delegated/open items.
2. Scope and first milestone, including what is deliberately later.
3. Annotated references, chosen direction and content/assets strategy.
4. Pages and key workflows, state/service decisions and device priorities.
5. Repository destination, branch/version map and pinned Crease baseline.
6. Local product-system responsibilities and AI editing/review boundaries.
7. The first bounded implementation task, actual validation commands and review artifacts.

The first build task should deliver the accepted detailed slice and its real
system foundation, not the whole application and all fifteen lessons in one pass.
Iterate from observed results and carry accepted changes forward through version
history. Integrate chapter prose with the corresponding verified code.

This planning task updates requirements and collects input. Repository creation,
remote publication, application implementation and hosted previews belong to the
subsequent build task with the selected destination and scope.

## Verification additions

The series release must verify a clean clone of each taught version from the
separate application repository, its dependency pin, its complete commands, and
the matching docs links. Test the product independently of a Crease checkout.

Check branch-to-version mappings, exact tag/commit references, source excerpts and
screenshots against one another. A generated disposable fixture can test
installation, but cannot substitute for the maintained application repository.

Record the agreed visual and functional acceptance criteria for each milestone.
Do not label the product polished or complete solely because code builds or every
example is lint clean.

## Git references

- [Git tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging): marking exact
  accepted checkpoints in the repository history.
- [Git worktrees](https://git-scm.com/docs/git-worktree): temporary side-by-side
  development checkouts; these are not separate repositories.
