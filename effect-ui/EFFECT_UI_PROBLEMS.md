# Effect UI problems found during the docs migration

- `Link`'s `tooltip` option mounts a `Tooltip` child internally. Rendering multiple tooltip links in one parent view fails with “two children at CreaseTooltip[]” because the consumer cannot key those internal tooltip children. The docs currently work around this by placing each tooltip link inside its own keyed demo component.

- Effect HTML element builders frequently expose their environment parameter as `any` or infer it as `unknown` after ordinary composition, even for static content. Strict `View.Input<Msg, never>` example types therefore reject otherwise valid composed `Button`/`Icon` content unless helpers are explicitly typed with the docs message type.
