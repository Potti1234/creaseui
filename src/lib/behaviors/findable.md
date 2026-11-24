# Findable

Use `supportsHiddenUntilFound(document)` to check whether a document can
search collapsed content. Keep searchable content mounted and apply
`hiddenAttributes(isOpen, true)` to its wrapper. Add `reveal(message)` to
route a browser find match to the parent update that opens the content.
Motion also exports these helpers. Virtualizer uses the same feature check
before including searchable text for unmounted rows.
