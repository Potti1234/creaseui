# Parts

Use `keyedPartId(instanceId, slot, key)` with a stable instance ID, a fixed slot
name, and the item's value. It escapes all three fields consistently on the
server and client, then separates them with colons. Colons within a field are
escaped, so different instance, slot, and key tuples always produce different
IDs. Reordering leaves part IDs and their ARIA references intact.

Tree List keeps its legacy row IDs where the tree boundary is unambiguous. It
uses framed IDs for ambiguous tree IDs and for all action, label, and
description parts. Those auxiliary IDs replace the old row-ID-plus-suffix
format, which could collide with a row whose key ended in that suffix.

Use `elements(root, selector, keyAttribute)` in a Foldkit Command or Mount when
the result depends on rendered order. It returns the matching elements and
their keys in DOM order, skips parts without the key attribute, and preserves
empty keys. Pass `{ direct: true }` for sibling operations. Tree List uses it
to find the next bound sibling when dropping a row.
