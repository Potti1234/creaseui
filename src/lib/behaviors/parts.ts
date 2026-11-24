/** Escape a key for an ID without losing identity for unpaired surrogates. */
export const idPart = (key: string): string =>
  key
    .split(/([\uD800-\uDFFF])/u)
    .map((part, index) =>
      index % 2 === 0
        ? encodeURIComponent(part)
        : `%u${part.charCodeAt(0).toString(16)}`,
    )
    .join('')

/** Build the same ID on the server and client from an instance, slot and item key. */
export const keyedPartId = (
  instanceId: string,
  slot: string,
  key: string,
): string => `part:${idPart(instanceId)}:${idPart(slot)}:${idPart(key)}`

/** Snapshot the keyed descendants of a rendered part in current DOM order. */
export const elements = <Part extends Element = Element>(
  root: ParentNode,
  selector: string,
  keyAttribute: string,
  { direct = false }: Readonly<{ direct?: boolean }> = {},
): ReadonlyArray<Readonly<{ element: Part; key: string }>> =>
  Array.from(root.querySelectorAll<Part>(selector)).flatMap(element => {
    if (direct && element.parentNode !== root) return []
    const key = element.getAttribute(keyAttribute)
    return key === null ? [] : [{ element, key }]
  })
