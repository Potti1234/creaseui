# Effect UI problems found during the docs migration

- `Link`'s `tooltip` option mounts a `Tooltip` child internally. Rendering multiple tooltip links in one parent view fails with “two children at CreaseTooltip[]” because the consumer cannot key those internal tooltip children. The docs currently work around this by placing each tooltip link inside its own keyed demo component.

- Effect HTML element builders frequently expose their environment parameter as `any` or infer it as `unknown` after ordinary composition, even for static content. Strict `View.Input<Msg, never>` example types therefore reject otherwise valid composed `Button`/`Icon` content unless helpers are explicitly typed with the docs message type.

- `Tooltip` trigger input is typed as a button or anchor element only. The Foldkit docs' disabled-button example uses a non-focusable `span` trigger so the explanation remains hoverable while the action is unavailable; the Effect API cannot express that trigger type directly, so the port currently uses a disabled button approximation.

- `DropdownMenu`'s backdrop is rendered as a manual popover. Because the styled wrapper originally gave it no background class, the browser's popover user-agent background painted the whole page white while a menu was open. The branch now overrides it with `bg-transparent`.

- `DropdownMenu`'s styled menu composition diverged from the Foldkit/shadcn reference in several details: minimum width, group-label size/color, missing separators between groups, check/radio indicator structure, label wrapping, shortcut tracking, and disabled/icon CSS. The branch aligns those styles and item composition with the reference implementation.

- `DropdownMenu` submenu triggers are consumer-provided elements. Unlike ordinary items, they do not automatically receive the standard menu-item data attributes or the trailing chevron, so the docs must remember to compose the chevron themselves and the rendered submenu trigger still lacks the same `data-slot` surface as ordinary items.

## Popover styled popup styling diverges from Foldkit

`effect-ui/src/ui/popover.ts` originally added `grid`, `gap-2`, `text-sm`, sizing clamps, and scrolling behavior that the Foldkit/shadcn-style popover does not have. That compressed custom content and changed inherited heading text from 16px to 14px. The branch now aligns the styled popup classes with the Foldkit implementation.

## Select styled trigger, popup, and item styling diverge from Foldkit

`effect-ui/src/ui/select.ts` originally used fixed-height/background trigger classes, allowed the popup to size itself independently of the trigger anchor, and used flatter menu-item padding. This made the same docs fixture render a 384px trigger/popup where Foldkit renders the shrink-to-fit 129px control. The branch now aligns the styled trigger, popup width, and option padding with the Foldkit implementation, although the inner option DOM still differs because the Effect kit exposes item parts differently.

## Tabs styled sizing diverges from Foldkit

`effect-ui/src/ui/tabs.ts` originally used a larger root gap, 4px list padding, always-on trigger gaps, fixed minimum-height triggers, and text underline styling for the line variant. This made the basic demo 214px high with a 327px tab list where Foldkit renders 206px and 313px. The branch now aligns the styled root/list/trigger sizing and line indicator treatment with the Foldkit implementation while retaining the kit's `data-active` state attribute.
