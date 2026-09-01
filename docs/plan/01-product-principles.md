# Product principles and decision framework

## Product definition

Crease UI is a collection of accessible, styled Foldkit building blocks and
feature recipes delivered as source code. It gives applications a coherent visual
language while preserving Foldkit's explicit Elm-style architecture.

Crease is not a React compatibility layer. shadcn/ui is a design and distribution
reference, not the architectural authority.

## Target users

- Foldkit developers who want polished defaults without giving up explicit state.
- Effect teams that want frontend behavior represented as typed data and Effects.
- teams that need auditable accessibility and interaction behavior;
- application developers who prefer source ownership to opaque runtime packages;
- agents and human reviewers who benefit from predictable Model, Message, update,
  view, and test structure.

## Product promise

A consumer should be able to install a Crease artifact and answer these questions
without reverse engineering it:

- What state does this artifact own?
- What state must my application own?
- Which Messages cross the boundary?
- Which OutMessages can it emit?
- Which Commands, Subscriptions, Mounts, services, or browser capabilities does it use?
- How is it initialized, embedded, tested, themed, and upgraded?
- Which accessibility and browser behaviors are verified?
- Which differences from shadcn/ui are intentional?

## Decision hierarchy

When implementing or reviewing an artifact, decide in this order:

1. What is the user interaction and accessibility contract?
2. Which state is durable domain truth and which state is transient UI state?
3. Does an existing `@foldkit/ui` primitive satisfy the behavior?
4. Which Foldkit lifecycle primitive owns each effect?
5. What is the smallest public API that keeps the architecture explicit?
6. Which semantic slots and states need styling?
7. Which shadcn visual treatment remains useful?
8. How will the behavior be proven?

Never start by transliterating a React source file.

## What Crease inherits from shadcn/ui

- semantic theme tokens;
- source ownership;
- registry-based installation;
- local editability;
- inspectable upgrades and diffs;
- familiar component names where behavior truly corresponds;
- variant-driven visual APIs;
- reusable blocks and complete examples;
- strong registry metadata for humans and agents.

## What Crease rejects from React-shaped libraries

- hooks and hook ordering;
- local component instances as hidden state owners;
- providers used only to simulate implicit component ancestry;
- uncontrolled state as the default convenience mechanism;
- effectful view callbacks;
- cloned children and `asChild` polymorphism;
- runtime validation of compound component nesting;
- Radix-specific attributes copied without matching Foldkit semantics;
- global singleton services for notifications, dialogs, or overlays;
- one-file component APIs when the feature naturally spans a Model, update, view,
  commands, and tests.

## UX and visual principles

### Familiarity

Standard controls should behave like standard controls. Visual personality must not
change expected focus, keyboard, dismissal, validation, selection, or loading behavior.

### States

Every interactive component must define all applicable states:

- default;
- hover;
- focus-visible;
- active or pressed;
- selected or checked;
- open and closed;
- disabled;
- read-only;
- loading;
- validating;
- invalid;
- success, warning, error, and informational feedback;
- enter and leave transition phases.

### Color

- Use semantic roles rather than raw colors in components.
- Default product surfaces should use restrained color.
- Accent color belongs to primary actions, selection, focus, and meaningful status.
- Support light and dark themes without component-level manual overrides where tokens
  can express the difference.
- Store canonical token values in OKLCH and generate backend-specific output.

### Typography

- Use one legible product sans family by default.
- Use a fixed type scale for product UI.
- Keep prose between 65 and 75 characters per line.
- Use tabular numbers for changing numeric values and aligned data.
- Do not use display typography for labels, buttons, controls, or table data.

### Layout

- Prefer normal document flow, flex, and grid.
- Responsive behavior must be structural, such as collapsing navigation or changing
  table presentation.
- Do not animate layout properties.
- Avoid nested cards and unnecessary surface containers.
- Preserve readable density for application interfaces.

### Motion

- Motion communicates state change, continuity, or feedback.
- Most UI transitions should complete in 150 to 250 milliseconds.
- Use exponential ease-out curves for entrances and state changes.
- Respect `prefers-reduced-motion`.
- An animated component must remain correct when animation is disabled.

## Accessibility baseline

- Target WCAG 2.1 Level AA for every stable artifact.
- Preserve all Foldkit primitive attribute bundles unless a documented transformation
  is required.
- Visible labels are preferred over `aria-label` when the design permits.
- Focus order, restoration, trapping, and initial focus must be specified.
- Keyboard interaction must follow the relevant ARIA pattern.
- Dynamic feedback must use appropriate live-region semantics.
- Touch targets, contrast, zoom, forced colors, directionality, and reduced motion are
  part of component quality, not optional polish.

## Product language

Documentation should be precise and slightly dry. Prefer concrete claims backed by
rendered proof. Say what state and wiring cost a component has. Do not describe an
adapted or partially tested artifact as equivalent to upstream.

