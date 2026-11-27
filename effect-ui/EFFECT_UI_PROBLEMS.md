# Effect UI problems found during the docs migration

- `Link`'s `tooltip` option mounts a `Tooltip` child internally. Rendering multiple tooltip links in one parent view fails with “two children at CreaseTooltip[]” because the consumer cannot key those internal tooltip children. The docs currently work around this by placing each tooltip link inside its own keyed demo component.
