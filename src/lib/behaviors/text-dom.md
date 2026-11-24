# DOM Text

Use `labelOf(element)` to collect an item's text for Typeahead. It skips
decorations marked hidden or `aria-hidden` and uses `aria-label` when the item
has no text. `isComposing(event)` lets keyboard handlers leave IME input alone.

`pageLocale(element)` resolves the nearest language across DOM and shadow
boundaries. `userLocale()` resolves the browser's language preferences.
`toLocale(tag)` normalizes an underscore-separated or mixed-case language
tag for Intl. Locale helpers return undefined when there is no usable tag.
