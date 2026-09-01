# Foldkit-native architecture contract

## Architectural boundary

Crease is a styled and composed layer over Foldkit and `@foldkit/ui`.

```text
Application domain Model and update
  -> Crease feature recipe or styled Submodel
    -> @foldkit/ui behavior primitive
      -> Foldkit Html, Commands, Subscriptions, Mounts, and Runtime
        -> browser DOM
```

The arrow direction expresses dependency. Lower layers must not import application
models or Crease feature code.

## State ownership

Classify every field before adding it to a Model.

### Application-owned domain state

Examples include selected account, submitted form values, saved filters, current
route, server data, permissions, and business validation results.

Rules:

- store it in the application or feature Model;
- pass it to controls through `ViewInputs` or controlled helper configuration;
- receive changes as application Messages or child OutMessages;
- persist it through Commands or flags, never through component initialization.

### Component-owned interaction state

Examples include open state, active descendant, keyboard highlight, typeahead buffer,
drag position, animation phase, focus bookkeeping, and temporary pointer coordinates.

Rules:

- store it in a Schema-defined child Model;
- change it only through the child update or exported child entry points;
- keep internal Messages private when consumers do not need to construct them;
- do not expose internal fields as a substitute for supported transitions.

### Per-render view inputs

Examples include item arrays, labels, rendering callbacks, domain selection, variant,
placement, direction, and class or style slots.

Rules:

- pass them through the Submodel's typed `ViewInputs`;
- do not copy them into the child Model unless the component truly owns their lifecycle;
- do not emit Commands merely to synchronize ordinary render inputs into the Model;
- add explicit `reflect*` entry points only when the primitive needs configuration in
  update, not only in view.

## Artifact contracts

### Render helper

Use when the artifact owns no state and emits no internal Messages.

```ts
export type ViewConfig<ParentMessage> = Readonly<{
  children: ReadonlyArray<Html | string>
  class?: string
}>

export const view = <ParentMessage>(
  config: ViewConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html => ...
```

Do not create an empty Model for API consistency.

### Controlled helper

Use when the application owns the value and the helper only translates user input.

```ts
export type ViewConfig<Value, ParentMessage> = Readonly<{
  value: Value
  onChange: (value: Value) => ParentMessage
  isDisabled?: boolean
  isReadOnly?: boolean
}>
```

The helper may use a stateless `@foldkit/ui` primitive. It must not use module-global
state or manufacture a child Model.

### Interaction Submodel

Use when the interaction owns a state machine.

Required exports:

- `Model` Schema and type;
- `Message` Schema and type;
- `OutMessage` Schema and type when domain facts leave the boundary;
- `InitConfig` and `init`;
- `ViewInputs`;
- a branded view made with `Submodel.defineView`;
- `update` using the baseline `Update.Return` shape;
- named parent-initiated entry points;
- stable ID helpers when labels, descriptions, panels, or triggers must connect.

The parent must embed the view with `h.submodel`, use a unique and stable `slotId`,
and delegate through the current Foldkit child-folding API.

### Lifecycle adapter

Use when a browser or third-party system owns imperative resources.

- Use `Mount` for DOM-owned libraries and return cleanup.
- Use Commands for finite asynchronous operations that produce Messages.
- Use Subscriptions for external event streams active while Model conditions hold.
- Use managed resources for stateful handles whose acquire and release follow Model
  state.
- Keep configuration serializable when it is stored in a Model.
- Never instantiate third-party runtimes in a view.

Charts, carousels, observers, media integrations, and virtualized surfaces must be
reviewed against this category before introducing custom state machines.

### Feature recipe

Use when the useful artifact owns domain-adjacent behavior or composes several
Submodels. A recipe may contain:

```text
feature-name/
  model.ts
  message.ts
  update.ts
  view.ts
  commands.ts
  subscriptions.ts
  test.ts
  README.md
```

A recipe must declare which fields are examples that consumers should rename or
replace. Recipes are not generic primitives and should not claim universal behavior.

## Message rules

- Name Messages as facts about user or runtime events.
- Use the Foldkit `Got*Message` convention for child wrappers.
- Wrapper Messages carry routing information only.
- Match Message unions exhaustively.
- Keep browser event translation pure.
- Do not encode consequences in event names such as `SaveAndNavigate`.
- Use OutMessages for facts the parent may interpret differently.
- Do not emit internal navigation or focus bookkeeping as public OutMessages.

## Update rules

- Use the baseline `Update.Return` object shape consistently.
- Return unchanged Models when events are irrelevant or stale.
- Preserve invariants in one update path.
- Use version or request identifiers to reject stale timer and request completion.
- Map child Commands through the parent wrapper.
- Fold child OutMessages explicitly and exhaustively.
- Parent-initiated child changes must call exported child update entry points.
- A parent must never spread or mutate fields inside a child Model.

## Generic component factories

Listbox, Combobox, Menu, Tabs, and similar value-typed components must bind generic
types once.

```ts
const PlanSelect = Select.create<Plan, PlanId>()
```

The returned bundle must keep view, update, OutMessage, and entry-point types aligned.
Declare bundles at module scope. Do not call `create()` during rendering and do not
export an update from a different factory instance than the view.

## View and composition rules

- Views are pure functions of Model and view inputs.
- Use the builder passed to the active view boundary.
- Keep one effective `h.Class` per element and merge fragments before construction.
- Preserve all primitive-provided ARIA, event, data, ID, positioning, and focus
  attributes.
- Expose semantic part builders when consumers need structural composition.
- Part builders must carry required primitive attributes automatically.
- Required titles or labels cannot be omitted silently.
- Use keyed rendering for identity-bearing repeated children.
- Use Foldkit memoization only after measuring a meaningful rendering cost.

### Composition API guidance

Prefer typed `layout(parts => Html[])` or `toView(parts => Html)` functions over
React-style named children. A parts object should expose semantic builders, not raw
internal Model fields.

For stateful components, provide both:

- a low-level branded `view` for explicit `h.submodel` embedding;
- an optional clearly named `embed` helper when it removes repetitive syntax without
  hiding state ownership or message mapping.

## Effects and browser behavior

- Timers are Commands whose completions are Messages.
- Document and window event streams are Subscriptions.
- Focus that can occur after rendering uses Foldkit DOM Commands.
- Gesture-synchronous browser behavior uses Foldkit event attributes designed for it.
- Third-party DOM ownership uses Mount.
- Persistence uses flags for initialization and Commands for writes.
- No `window`, `document`, random ID, current time, or layout measurement may run in a
  server-rendered view.

## SSR and hydration

Each artifact must declare one of:

- `supported`: deterministic server output and hydration verified;
- `client-enhanced`: server-safe static output, behavior starts on the client;
- `client-only`: cannot render meaningfully on the server, with a documented fallback;
- `not-applicable`: tooling or non-rendered artifact.

IDs must be deterministic from configuration or Model state. Initial output must not
depend on browser-only measurements. Animation must not cause server and client tree
shape disagreement.

## Styling boundary

Behavior exposes semantic slots and states. Skins consume them.

Required semantic state vocabulary includes:

- `data-slot` for meaningful parts;
- Foldkit-native open, closed, active, selected, disabled, invalid, orientation, and
  transition attributes;
- semantic CSS variables for colors, radius, spacing where variable, chart roles,
  and overlay geometry;
- primitive-owned inline positioning values that skins must not overwrite.

Tailwind and StyleX may encode styles differently, but they must consume the same
slot and state contract.

## Forbidden architecture

- React or JSX runtime dependencies;
- hook-like state hidden in closures;
- module-global mutable UI state;
- imperative event listeners installed from views;
- parent mutation of child Model fields;
- duplicated Tailwind and StyleX behavior;
- arbitrary `null` or `undefined` failure channels in public operations;
- uncontrolled durable selection hidden in reusable components;
- raw Radix selectors without equivalent Foldkit state;
- a stateful label in metadata without a branded Submodel view or explicit recipe
  classification.

