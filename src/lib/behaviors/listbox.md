# Listbox

Listbox is the headless highlight/filter/navigation layer from ui-sdk.dev.
Bind keys with `Listbox.create<Key>()`, embed its Model (initial highlight is
None), and pass ordered keys and labels as view inputs. `filter` and `count`
accept contains (default), startsWith, or a boolean/score callback; higher
positive scores rank first, zero hides. Empty queries keep the original order.
Real focus uses RovingFocus's item ids and FocusItem Command. Virtual focus
only changes the highlight; point the input's aria-activedescendant at
`activeId(model)`. Home/End and Typeahead apply to Real focus by default;
Virtual consumers can explicitly set `homeEnd: true`. Page navigation uses
`pageSize` enabled options (default 10); components measuring a viewport can
supply its size. `first`/`last` work in either focus mode. Pass only unmodified
printable keys to the view's keydown callback for typeahead.
Pointer highlight does not choose. Pair Listbox with `Selection.create<Key>()`
for choosing, or keep the component's existing selection policy. Roles and
aria-selected belong to that component.

Anchored Listbox (`anchored-listbox.ts`) composes these navigation helpers
with shared typeahead, popup transitions, and positioning. Select and Time Input
use single selection. Multi Selector keeps its panel open when committing and
folds each selected value through the shared Selection behavior. The table
page-size selector consumes the same single-selection update. The parent
continues to own the committed selection in every case.
