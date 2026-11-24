# Tabs

Tabs uses [Roving Focus](roving-focus.md) to move between enabled tabs.
The parent keeps selectedValue while the child Model holds the focus cursor
and activation mode. Each tab has linked tab and panel attributes.

## Compose tabs

Create one typed bundle for your tab values. Route its Messages through
update, lift focus Commands, and apply the Selected OutMessage in the parent.
Automatic activation selects the newly focused tab. Manual activation lets
the user move focus before committing with Enter or Space.

```ts
import * as Tabs from '@/lib/behaviors/tabs'

const settingsTabs = Tabs.create<'profile' | 'security'>()
const tabs = Tabs.init({ id: 'settings-tabs', activationMode: 'Manual' })
```
