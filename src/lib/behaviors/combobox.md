# Combobox

Use a combobox when a text input should filter choices or control a popup.
The child Model owns query, active option, input focus effects, and popup
transitions. The parent stores the committed selection.

## Compose a control

Create a typed bundle once. Render its view with the displayed items and the
parent's current selection. Route child Messages into the bundle's update
and lift the returned Commands. Apply Selected or ClearedSelection
OutMessages in the parent. Use Multi.create for token or multiple-choice inputs.

```ts
import * as Combobox from '@/lib/behaviors/combobox'

const fruit = Combobox.create<'apple' | 'pear'>()
const model = Combobox.init({ id: 'fruit', nullable: true })
```

Provide stable item values. The view manages active-descendant attributes and
guards its keyboard shortcuts during IME composition.
