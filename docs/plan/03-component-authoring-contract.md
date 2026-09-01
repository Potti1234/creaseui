# Component authoring contract

## Purpose

This contract defines the minimum work required to add, migrate, or stabilize one
Crease registry artifact. It supplements the existing component authoring guide and
should eventually replace any conflicting rules there.

## Step 1: create an artifact brief

Before implementation, add an authored brief containing:

- artifact name and classification;
- user need and expected interaction;
- closest `@foldkit/ui` primitive;
- durable domain state;
- transient interaction state;
- parent-to-child operations;
- child OutMessages;
- required Commands, Subscriptions, Mounts, services, or browser capabilities;
- keyboard interaction table;
- focus entry, movement, dismissal, and restoration rules;
- semantic slots and states;
- responsive behavior;
- light, dark, RTL, reduced-motion, forced-colors, and SSR expectations;
- intentional differences from shadcn/ui;
- required evidence and known limitations.

Implementation may not begin while state ownership or the primitive choice is
ambiguous.

## Step 2: inspect exact upstream sources

For each migration:

1. record the exact installed Foldkit and `@foldkit/ui` versions;
2. read the primitive source, exported types, tests, and version-matched docs;
3. record the exact shadcn source commit used for visual reference;
4. identify Radix or React behavior that is not portable;
5. identify existing Crease consumer-facing behavior that must migrate safely;
6. write the intended difference before changing code.

Do not copy current website documentation blindly when the installed types differ.
The compiler and exact package source are authoritative.

## Step 3: select a public API template

### Render helper template

Required:

- `ViewConfig<ParentMessage>` or a clearly named props type;
- `view(config, h)` as the canonical export;
- semantic variant types when applicable;
- no Model, Message, init, update, Commands, or module state.

Optional compatibility aliases may retain existing names such as `button` during a
documented migration period.

### Controlled helper template

Required:

- current value as input;
- pure mapping from user input to a parent Message;
- disabled and read-only semantics where applicable;
- stable label and description association;
- invalid and validation-state input where applicable;
- no child Model unless interaction state truly requires one.

### Interaction Submodel template

Required exports:

```ts
export const Model: Schema.Schema<...>
export type Model = typeof Model.Type

export const Message: MessageUnion<...>
export type Message = typeof Message.Type

export const OutMessage: MessageUnion<...>
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<...>
export const init: (config: InitConfig) => Model

export type ViewInputs = Readonly<...>
export const view: Submodel.View<Model, Message, ViewInputs>

export const update: (
  model: Model,
  message: Message,
) => Update.ReturnWithOutMessage<Model, Message, OutMessage>
```

When no facts leave the child, omit `OutMessage` and use the corresponding update
return type. Use actual type names from the chosen Foldkit baseline.

Parent-initiated entry points should be named as operations:

```ts
export const open = (model: Model): Update.Return<Model, Message> => ...
export const close = (model: Model): Update.Return<Model, Message> => ...
export const reflectDisabledItems = (
  model: Model,
  items: ReadonlyArray<ItemId>,
): Update.Return<Model, Message> => ...
```

Do not require consumers to construct private bookkeeping Messages.

### Generic bundle template

```ts
export type Bundle<Item, Value> = Readonly<{
  view: Submodel.View<Model, Message, ViewInputs<Item, Value>>
  update: UpdateFunction<Model, Message, OutMessage<Value>>
  selectItem: ...
  open: ...
  close: ...
}>

export const create = <Item, Value extends string>(
  config: FactoryConfig<Item, Value>,
): Bundle<Item, Value> => ...
```

The factory result must be declared once at module scope by consumers and examples.

### Lifecycle adapter template

Required:

- explicit ownership of the external runtime;
- initialization and cleanup in Mount or managed-resource code;
- serializable Model state only;
- Messages for runtime events that affect the application;
- update operations for configuration changes;
- SSR fallback and hydration policy;
- tests proving cleanup and no duplicate runtime creation.

### Feature recipe template

Required:

- separate Model, Message, update, and view modules when the feature is non-trivial;
- comments marking application-specific example fields;
- at least one composed child Submodel;
- a complete parent integration file;
- domain adaptation guidance;
- story and Scene tests;
- registry installation into a predictable feature directory.

## Step 4: define semantic slots

Create a slot inventory before styling. Example for Dialog:

```text
dialog
dialog-backdrop
dialog-panel
dialog-header
dialog-title
dialog-description
dialog-body
dialog-footer
dialog-close
```

For every slot, document:

- semantic element;
- primitive attributes that must be applied;
- optional and required children;
- supported variants;
- interactive states;
- whether consumer class or style extension is allowed;
- whether inline geometry is owned by Foldkit.

Do not expose decorative implementation fragments as public slots.

## Step 5: implement behavior once

- Place shared behavior under the canonical UI or behavior module.
- Keep Models, Messages, updates, OutMessages, IDs, and part semantics skin-neutral.
- Tailwind and StyleX modules may provide style maps and styled view composition.
- If structure must differ between skins, document why and prove equivalent semantics.
- Generated skin files must name their generator and source inputs.
- A CI check must fail when generated outputs drift.

## Step 6: write complete examples

Every stateful component page must contain at least:

1. a complete application example with Model, Message, init, update, view, and runtime;
2. an isolated child module example;
3. parent Model embedding;
4. `Got*Message` wrapping;
5. child update folding and Command mapping;
6. exhaustive OutMessage handling;
7. parent-initiated entry point usage;
8. `h.submodel` embedding with stable `slotId`;
9. controlled domain state passing;
10. a Story test and a Scene test.

Examples must compile as files, not only as fragments embedded in prose. Generated API
tables must be supplemental, not a substitute for integration examples.

## Step 7: add migration compatibility

When changing an existing public API:

- document the old and new shape;
- provide a compatibility alias when it does not preserve a bad invariant;
- emit a development warning only when Foldkit has an accepted warning mechanism;
- add a codemod or deterministic migration recipe for repetitive changes;
- include before and after parent wiring;
- record the removal target in the changelog;
- test both the compatibility path and the canonical path during the transition.

Do not retain unsafe parent mutation, hidden state, or effectful views for compatibility.

## Required authored and generated artifacts

For a stable UI artifact named `example`:

```text
src/ui/example.ts                    canonical behavior and API
src/stylex/example.ts                generated or thin StyleX skin, if supported
src/docs/components/pages/example.ts authored documentation definition
test/example.test.ts                 pure contracts and metadata
scene/example.scene.test.ts          view and interaction behavior
e2e/example.spec.ts                  browser-only behavior and accessibility
docs/component-roadmap.json          classification and maturity
docs/component-parity.json           quality evidence
registry.json                        source distribution
public/r/example.json                generated registry output
```

Names may follow existing repository organization, but the evidence categories may
not be omitted.

## Review checklist

- [ ] Classification is correct.
- [ ] State ownership is documented field by field.
- [ ] Existing Foldkit primitive was used when suitable.
- [ ] Model and Message schemas match the supported baseline.
- [ ] Stateful view is a branded Submodel view.
- [ ] Parent integration never mutates child state directly.
- [ ] Generic factory is bound once.
- [ ] Effects use the correct lifecycle primitive.
- [ ] Primitive attributes are preserved.
- [ ] Required labels, titles, descriptions, and IDs cannot be lost accidentally.
- [ ] Semantic slots are stable and documented.
- [ ] Tailwind and StyleX share behavior.
- [ ] SSR policy is explicit.
- [ ] Complete examples compile.
- [ ] All applicable quality evidence exists.
- [ ] Registry installation works in a clean consumer.
- [ ] Upgrade diff preserves local source ownership.

