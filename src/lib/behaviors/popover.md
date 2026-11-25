# Popover

Popover owns an anchored panel's open state, dismissal, focus, and animation.
Use it for a floating surface a user can enter and interact with. [Position](position.md)
attaches the panel to its trigger and [Layer](layer.md) coordinates dismissal
with other open surfaces.

## Compose a popover

Keep a child Model and pass its Messages to update. Lift Commands so placement,
focus return, and transition completion can run. Render the supplied button,
panel, and backdrop attributes with your markup. When the panel opens to a
specific control, pass its selector as focusSelector.

```ts
import * as Popover from '@/lib/behaviors/popover'

const model = Popover.init({ id: 'filters', isAnimated: true })
const next = Popover.open(model)
```

Read isVisible from the view's render info when deciding whether to keep the
panel mounted during exit.
