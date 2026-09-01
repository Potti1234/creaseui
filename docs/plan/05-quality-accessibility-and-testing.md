# Quality, accessibility, and testing plan

## Quality model

Each artifact has independent maturity for:

- architecture;
- behavior;
- accessibility;
- composition;
- visual fidelity;
- responsive behavior;
- theme and direction support;
- SSR and hydration;
- performance;
- documentation;
- registry and clean-consumer installation;
- upgrade safety.

Use these statuses:

- `not-applicable`: the dimension does not apply, with a reason;
- `planned`: no implementation evidence exists;
- `implemented`: source exists, but proof is incomplete;
- `verified`: required evidence passes on the supported baseline;
- `adapted`: behavior intentionally differs and the adapted contract is verified;
- `blocked`: a named external limitation prevents completion.

Do not infer one dimension from another. A component can be visually verified while
its keyboard behavior remains only implemented.

## Stability levels

### Experimental

- API may change without migration tooling.
- Some quality dimensions may be planned.
- Must be clearly labeled in docs and registry metadata.

### Preview

- Architecture, typecheck, documentation, and registry install are verified.
- Core behavior has pure and Scene tests.
- Remaining browser or visual gaps are listed.

### Stable

- Every applicable dimension is verified or intentionally adapted and verified.
- Migration notes exist for all previous public APIs.
- Clean-consumer install and upgrade preview pass.
- No open P0 or P1 accessibility or behavioral defect remains.

## Required test layers

### 1. Static and schema checks

Prove:

- TypeScript compiles with strict settings;
- public Models and Messages are Schema-defined where required;
- Message unions are exhaustively matched;
- registry metadata agrees with source exports;
- artifact classification agrees with required API markers;
- generated files match their source inputs;
- version metadata agrees everywhere;
- forbidden React and JSX dependencies are absent;
- Tailwind and StyleX behavior imports resolve to the same canonical modules.

Add architecture lint rules where reliable. Examples:

- a registry item classified as `interaction-submodel` must export `Model`, `Message`,
  `init`, `update`, and a branded `view`;
- a render helper must not export a Model;
- a stateful example must contain a `Got*Message` wrapper and `h.submodel`;
- generated skin files must not define Messages or update functions;
- no `create()` factory call may occur inside a view body for typed bundles.

### 2. Pure update and Story tests

Cover every state transition, including:

- initialization;
- normal interaction paths;
- disabled and read-only paths;
- invalid input;
- stale command completions;
- boundary values;
- repeated operations;
- parent-initiated entry points;
- command production and message mapping;
- OutMessage production;
- invariant preservation.

Tests must assert both resulting Model and Commands or OutMessages. A test that checks
only one field is not enough when the transition has other observable consequences.

### 3. Scene tests

Drive the real view using accessible queries. Cover:

- visible labels and roles;
- keyboard navigation;
- selection and activation;
- open and close behavior;
- validation feedback;
- focusable element availability;
- rendered state after Messages and resolved Commands;
- multiple component instances with distinct boundaries;
- parent and child message integration.

Prefer role, label, and text queries. Avoid selectors tied only to implementation classes.

### 4. Browser interaction tests

Use Playwright for behavior requiring the browser:

- actual focus movement and restoration;
- native dialog behavior;
- pointer capture and dragging;
- viewport collision and anchored positioning;
- portal or top-layer behavior;
- scroll locking and preservation;
- touch and coarse-pointer behavior;
- resize observers and element measurement;
- CSS transition completion;
- file input and drag-and-drop;
- third-party Mount lifecycle;
- hydration and browser history.

Run critical interaction tests in Chromium, Firefox, and WebKit. Document any narrower
browser matrix for non-critical visual snapshots.

### 5. Accessibility automation

For each stable component:

- run axe on default, open, selected, disabled, invalid, and loading states where applicable;
- test accessible name and description relationships;
- assert role and state attributes;
- verify there are no duplicate IDs across repeated instances;
- verify keyboard-only completion;
- verify focus is visible and not obscured;
- verify zoom to 200 percent and reflow where relevant;
- verify forced-colors rendering for controls and focus indicators;
- verify reduced-motion behavior;
- verify LTR and RTL behavior;
- verify live-region behavior for asynchronous feedback.

Automated tools do not replace manual keyboard and screen reader review for flagship
components.

### 6. Visual regression

Capture approved snapshots for:

- Tailwind and StyleX;
- light and dark themes;
- default and compact density when supported;
- desktop and mobile widths;
- key interactive states;
- RTL where layout changes;
- forced colors for applicable controls;
- reduced motion at stable start and end states.

Use deterministic content, fonts, dates, IDs, and viewport sizes. Mask only genuinely
non-deterministic data. A broad screenshot of a catalog is supplemental; every flagship
component needs focused state snapshots.

### 7. SSR and hydration tests

For artifacts marked `supported` or `client-enhanced`:

- render on the server without browser globals;
- verify deterministic HTML for fixed inputs;
- hydrate without mismatch warnings;
- exercise the first client interaction;
- confirm unique stable IDs;
- confirm client-only lifecycle work starts once;
- verify cleanup after unmount or route replacement.

### 8. Performance checks

Measure rather than assume. Applicable checks include:

- consumer bundle contribution;
- generated icon and theme size;
- view time for large lists;
- keyed diff stability;
- number of third-party runtime instances;
- subscription and Mount cleanup;
- animation frame stability during drag or resize;
- memoization effectiveness where adopted.

Set budgets only after recording a baseline and user-relevant reason.

### 9. Registry and consumer tests

For every stable artifact:

1. create a clean consumer for each supported styling backend;
2. install through the public or local registry path;
3. verify exact file destinations and rewritten aliases;
4. compile a minimal usage example;
5. run the consumer production build;
6. run at least one integrated interaction test;
7. preview an upgrade;
8. confirm local modifications are detected and preserved.

## Component interaction test matrices

### Overlay matrix

Applies to Dialog, Alert Dialog, Sheet, Drawer, Popover, Tooltip, Hover Card, Menu,
Context Menu, and similar artifacts.

- trigger by pointer and keyboard;
- initial focus;
- Tab and Shift+Tab behavior;
- Escape dismissal;
- outside interaction dismissal policy;
- focus restoration;
- nested overlay behavior;
- repeated open and close;
- scroll lock;
- viewport collision;
- mobile viewport and virtual keyboard;
- animated and reduced-motion paths;
- multiple instances and stable IDs.

### Selection matrix

Applies to Select, Combobox, Menu, Tabs, Radio Group, Toggle Group, Calendar, and
similar artifacts.

- controlled value from parent;
- empty and preselected states;
- disabled item and disabled control;
- keyboard traversal, wrapping, Home, End, Page keys where relevant;
- typeahead and query behavior;
- selection OutMessage;
- external value changes;
- duplicate label and unique value handling;
- multiple selection where supported;
- form submission integration;
- read-only behavior;
- RTL directional keys where relevant.

### Form matrix

- visible labels and descriptions;
- required, optional, disabled, and read-only states;
- `NotValidated`, `Validating`, `Valid`, and `Invalid` presentation;
- asynchronous stale-response handling;
- error summary and field focus;
- native form submission behavior;
- autofill and password manager compatibility where applicable;
- mobile input modes and autocomplete tokens;
- server and client validation agreement.

### Drag and resize matrix

- pointer, mouse, touch, and keyboard operation;
- pointer cancellation;
- minimum and maximum constraints;
- orientation and RTL;
- screen reader instructions and announcements;
- focus persistence;
- total-size invariants;
- cleanup after interruption or unmount;
- no layout-property animation during direct manipulation.

## Evidence storage

Every verified status must link to concrete evidence:

- test name and file;
- snapshot path;
- rendered screenshot path;
- compatibility baseline;
- verification date;
- intentional-difference record if adapted.

Generated parity reports must reject `verified` without evidence. Evidence paths must
exist, and named tests must be discoverable.

## Pull request gate

A component migration PR cannot merge unless:

- focused tests pass;
- full typecheck passes;
- generated metadata is current;
- clean consumer installation passes;
- new visual snapshots are reviewed;
- accessibility findings are resolved or explicitly block stable status;
- public API changes include migration guidance;
- quality statuses reflect evidence honestly;
- unrelated repository changes are absent.

