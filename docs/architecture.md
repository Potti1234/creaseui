# Architecture

crease/ui is a styled layer over Foldkit and Foldkit UI. shadcn/ui is the visual
and token reference; Foldkit remains the architectural authority.

## Component categories

Foldkit UI has two deliberately different kinds of component.

Stateless render helpers such as buttons, inputs, labels, and cards accept a
configuration object and return `Html`. crease/ui wraps or implements these as
plain functions. They should not become submodels merely for API consistency.

Stateful controls such as dialogs, menus, listboxes, calendars, and popovers own
a `Model`, `Message`, `update`, and sometimes an `OutMessage`. An application
embeds them as Foldkit submodels and maps their messages through its root update.
Their state is explicit, replayable, and testable; it is not hidden in a closure
or DOM node.

## Styling contract

Components use Tailwind CSS and shadcn/ui-compatible semantic tokens, including
`--background`, `--foreground`, `--primary`, `--border`, and `--radius`. Themes
should change tokens rather than component internals. The `cn()` helper combines
conditional classes and resolves Tailwind conflicts.

Foldkit permits a single effective `h.Class` attribute per element: later
attributes replace earlier ones. Compose every class fragment with `cn()` before
passing it to `h.Class`.

Radix-specific selectors and `data-state` assumptions do not automatically carry
over. Styling must target the state attributes exposed by the corresponding
Foldkit UI primitive. Likewise, config-driven primitives should use their
documented class-name hooks rather than trying to restyle generated children from
the outside.

## Behavior and effects

Views remain pure. Messages describe events, updates perform state transitions,
and subscriptions or commands provide runtime effects. Document-level behavior
such as pointer tracking and keyboard dismissal belongs in a lifted subscription,
not an imperative event listener hidden in a view.

When a Foldkit UI primitive computes inline positioning, consumers should extend
its supported styling hooks without overwriting those required coordinates.

## Porting rule

Match the interaction to the closest Foldkit UI primitive first, then adapt the
shadcn/ui visual treatment. A port is not a transliteration of React or Radix
code. If Foldkit lacks the required behavior, document the gap and implement it
as an explicit Foldkit model rather than introducing React interop.

The artifact-level completion rules, optionality policy, and generated-file
boundaries are defined in [component-authoring.md](component-authoring.md).
