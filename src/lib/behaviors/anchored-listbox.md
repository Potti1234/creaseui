# Anchored Listbox

Use the anchored listbox for a non-editable choice surface. Its child Model
tracks open state, the active option, typeahead, and transition progress.

## Compose a control

Create one typed bundle for your value set. Keep the committed value in the
parent, pass it into the view, and apply the bundle's Selected OutMessage.
Forward the Commands returned by update so keyboard navigation can focus and
scroll options. Use createMulti when choosing an option should allow further
selection in the same panel.

```ts
import * as Listbox from '@/lib/behaviors/anchored-listbox'

const language = Listbox.create<'en' | 'de'>()
const model = Listbox.init({ id: 'language', isAnimated: true })
```

[Position](position.md) places the panel. [Typeahead](typeahead.md) supports
searching the options without an editable input.
