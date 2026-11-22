# InputHistory

InputHistory recalls oldest-first string entries with Up/Down and restores the
draft after the newest entry. Pass entries to `update` and `attributes`; the
component writes `RestoredValue.value` and maps returned Commands. Spread
`attributes(model, inputs, send, h)` on the editor, alongside its ID. The Mount
reads plain `data-history-up` / `data-history-down` availability attributes,
computed by the pure `canNavigate` helper. Only recalls prevent the browser key.
Send `Reset` after submission or when replacing history. A stable `getEntryKey`
preserves position across rebuilt lists and appended entries without Reset;
the default identity combines index and string. Keys must be unique.
Textarea edges use a layout mirror, including soft wrapping. Custom editors can
use `create({ atEdge })`; they own value rendering and caret placement when the
native input/textarea caret Command does not apply.
