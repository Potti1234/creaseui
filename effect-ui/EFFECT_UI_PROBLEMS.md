# Effect UI problems found during the docs migration

- `Link`'s `tooltip` option mounts a `Tooltip` child internally. Rendering multiple tooltip links in one parent view fails with “two children at CreaseTooltip[]” because the consumer cannot key those internal tooltip children. The docs currently work around this by placing each tooltip link inside its own keyed demo component.

- Effect HTML element builders frequently expose their environment parameter as `any` or infer it as `unknown` after ordinary composition, even for static content. Strict `View.Input<Msg, never>` example types therefore reject otherwise valid composed `Button`/`Icon` content unless helpers are explicitly typed with the docs message type.

- `Tooltip` trigger input is typed as a button or anchor element only. The Foldkit docs' disabled-button example uses a non-focusable `span` trigger so the explanation remains hoverable while the action is unavailable; the Effect API cannot express that trigger type directly, so the port currently uses a disabled button approximation.
