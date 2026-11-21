# Behaviors

Behaviors are headless Foldkit Submodels or pure helpers.
State lives in a Schema Model, never in a mutable store or the DOM.
Messages describe facts; update returns the next Model and Commands.
DOM effects belong in Commands; DOM lifecycle resources belong in Mounts.
Views emit attribute bundles and leave roles and ARIA to components.
Components compose behaviors and own selection policy, semantics, and styling.
Bind key unions once with `create<Key>()`; pass item collections as view inputs.
Keep navigation helpers pure and test them independently of rendered views.
RovingFocus establishes this convention for subsequent behavior modules.

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

## Storage, Preference and ColorScheme

Storage descriptors are Schema data: choose local, session or cookie and an id.
Run get, set, remove and available inside Effects or Commands. Failures return
null or false, never prevent an in-memory preference change. Cookie defaults
are one year, path /, SameSite=Lax and Secure on HTTPS. The changes stream owns
cross-document storage listeners (including clear); cookies have no change stream.
script generates a validated data-* attribute pre-paint script for web storage.

Bind allowed strings with Preference.create<Value>({ values, defaultValue,
attribute, storage }). init and decode accept raw storage, falling back to the
default. RequestedValue persists only actual changes; RestoredValue and
ReceivedStoredValue report restore/storage-sync without writing back. Updates
return ChangedValue OutMessages. attributes exposes a pure data-attribute bundle;
compose changes into the parent's subscriptions and lift command messages.

ColorScheme composes Preference for system, light and dark, defaulting to system.
Its Schema model also tracks the OS scheme (unknown resolves to light). Compose
changes to follow live OS and storage changes. Apply owns the documentElement
dark class and style.colorScheme; updates apply only resolved changes. Initialize
from Storage.get and the OS inside an Effect, never by reading DOM from update.
