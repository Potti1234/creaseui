# Disclosure

Disclosure supplies trigger and panel attributes for a controlled expanded
value. Use it when the application owns a Boolean open state and needs the
trigger to work with pointer, Enter, and Space.

## Compose a disclosure

Pass isOpen and an onToggle function to view. Spread the supplied button and
panel attributes on the elements you render. Use animatePanel to retain the
panel during a height transition. A Foldkit Mount measures the content and
tracks size changes while it is mounted. It disables the height transition
when reduced motion is requested. Closed content is inert and hidden from
assistive technology. If the panel closes while it holds focus, the Mount
returns focus to its trigger without scrolling.

Accordion, Collapsible, and collapsible Banner use this same wrapper. Banner
dismissal still restores the focus origin for the whole banner.

```ts
import type { HtmlBuilder } from 'foldkit/html'
import * as Disclosure from '@/lib/disclosure'

const details = <Msg>(
  isOpen: boolean,
  onToggle: (isOpen: boolean) => Msg,
  h: HtmlBuilder<Msg>,
) =>
  Disclosure.view({
    id: 'details',
    isOpen,
    onToggle,
    toView: ({ button, panel, animatePanel }) =>
      h.div([], [
        h.button([...button], ['Details']),
        h.div([...panel], [animatePanel(h.p([], ['More information']))]),
      ]),
  }, h)
```
