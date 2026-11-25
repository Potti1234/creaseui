# CreaseUI behavior ownership migration

This plan tracks CreaseUI ownership of component behavior. The [UI SDK primitive parity audit](ui-sdk-primitive-parity.md) tracks the reusable contracts for building custom components.

CreaseUI should be able to build components from shared behaviors with Foldkit Schema models, Messages, Commands, and Mounts. Each public component keeps its existing contract in Tailwind, StyleX, and Pleat. Foldkit core supplies the runtime and DOM effects for the shared behaviors.

| Slice                                | Starting dependency                                                                                | Migration and acceptance criteria                                                                                                                                                                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Native form controls                 | Button, Toggle, Input Group, Input, Textarea, Checkbox, Switch, Native Select, Fieldset, File Drop | Own native attributes and form semantics. Share contracts across renderers. Check disabled and read-only routing, labels, focus, and form submission.                                                                                                                    |
| Popup foundations                    | Popover, Dialog, Anchor, Motion, Hover Intent, Tooltip                                             | Build on CreaseUI Popup, Layer, and Position. Own dismissal, focus return, exit, and hover timers. Test nested overlays, clipping boundaries, RTL, and reduced motion.                                                                                                   |
| Overlay consumers                    | Popover, Dialog, Alert Dialog, Drawer, Sheet, Mobile Nav, Lightbox, Hover Card, and pickers        | Switch each family to the shared lifecycle. Check portal themes, Escape ordering, focus restoration, and scroll locking.                                                                                                                                                 |
| Selection and editable lists         | Listbox and Combobox in Command, Tokenizer, Select, Multi Selector, Time Input, and table filters  | Compose shared Listbox, Selection, Typeahead, Text Match, Popup, and Focus Recovery. Verify active descendant and option identity, IME, controlled edits, and modes with multiple selection.                                                                             |
| Date and numeric controls            | Calendar, Date Picker, Radio Group, Slider                                                         | Preserve the current value and navigation contracts while moving state into CreaseUI where those behaviors need to compose. Test locale, range resets, disabled boundaries, and pointer and keyboard operation.                                                          |
| Remaining interaction infrastructure | Disclosure, Tabs, Progress, Toast, Virtual List, and Drag and Drop                                 | Audit which behaviors need to compose outside their current components. Move those contracts into CreaseUI. Retain self-contained implementations when their dependencies stay private. Verify focus, scroll and virtualization boundaries, announcements, and gestures. |
| Registry and dependency audit        | Direct imports in renderer, registry, docs, and demo sources                                       | Update registry dependencies with each slice. Verify installable sources and browser coverage across the renderers. Record intentionally retained delegates and remove package entries once their consumers are gone.                                                    |

Ship the form-control, hover-intent, and selection slices independently. Establish the popup and positioning contracts before moving overlay consumers. Follow those with the date and numeric controls and the remaining infrastructure audit.

## Current branch

- Button, Toggle, Input Group buttons, Input, Textarea, Checkbox, Switch, Fieldset, and Native Select build their native attributes in CreaseUI. File Input also uses the native File Drop behavior. Data Table and Virtual Data Table use the same checkbox control attributes as the standalone Checkbox.
- Drag and Drop owns subscriptions, hit testing, pointer capture, nested scrolling, and post-render focus. Transfer implements group and grid drafts and is used by Kanban.
- The anchored popup foundation composes CreaseUI Position, Layer, and Portal. Popover owns its lifecycle and uses the shared geometry. Tooltip and Hover Card share versioned hover and focus intent.
- Combobox and anchored Listbox own their interaction models and renderer contracts. Command, Tokenizer, Select, Multi Selector, Time Input, and table filters compose those behaviors. The parent retains ownership of selection.

- Accordion, Collapsible, and Banner use shared native Disclosure attributes. Linear and Circular Progress use the same owned progress semantics. Motion and Toast use generation-guarded native animation commands. Toast also owns its queue, timers, actions, and swipe behavior.
- Radio Group and Tabs own their focus cursors and selection messages. Parent Models still own the selected values. Slider owns range normalization, keyboard navigation, and pointer drag state.

- Calendar owns its grid, navigation, focus, and range policy. Date Picker composes it with the CreaseUI Popover lifecycle. The parent owns the selected date. Date Input, Date Range Input, Date Time Input, and Color Picker also use shared CreaseUI Popover.
- Dialog owns its Schema, view, dismissal, and animation lifecycle. Alert Dialog, Drawer, Sheet, Lightbox, and Mobile Nav share this behavior. Foldkit core DOM APIs handle modal isolation, focus containment and restoration, Escape ordering, and scroll locking.

## Dependency verification

The registry dependency test checks that installed behavior and renderer
sources have no direct `@foldkit/ui` import. Tutorial snapshots keep the
imports shown in their published chapters. Some older tests still use
Foldkit UI message schemas to match historical fixtures.

The [primitive parity audit](ui-sdk-primitive-parity.md) records behavior
coverage and the remaining interaction contracts.
