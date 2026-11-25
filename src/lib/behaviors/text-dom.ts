/** Read a typeahead label, skipping hidden decorations such as shortcuts. */
export const labelOf = (element: Element): string => {
  const parts: string[] = []
  const read = (node: Node): void => {
    if (node.nodeType === 3) {
      parts.push(node.nodeValue ?? '')
      return
    }
    if (node.nodeType === 1) {
      const child = node as Element
      if (
        child.hasAttribute('hidden') ||
        child.getAttribute('aria-hidden') === 'true'
      )
        return
    }
    node.childNodes.forEach(read)
  }
  read(element)
  return (
    parts.join('').replace(/\s+/gu, ' ').trim() ||
    element.getAttribute('aria-label')?.trim() ||
    ''
  )
}

/** IME keydowns on some browsers use keyCode 229 before isComposing is set. */
export const isComposing = (
  event: Pick<KeyboardEvent, 'isComposing' | 'keyCode'>,
): boolean => event.isComposing || event.keyCode === 229

/** Read direction in the element's browsing context, including shadow trees. */
export const isRTL = (element: Element): boolean =>
  element.ownerDocument.defaultView?.getComputedStyle(element).direction ===
  'rtl'

export const toLocale = (tag?: string | null): string | undefined => {
  if (!tag?.trim()) return undefined
  try {
    return Intl.getCanonicalLocales(tag.trim().replaceAll('_', '-'))[0]
  } catch {
    return undefined
  }
}

export const pageLocale = (
  scope: Element | Document | undefined = globalThis.document,
): string | undefined => {
  if (!scope) return undefined
  let element = 'documentElement' in scope ? scope.documentElement : scope
  for (;;) {
    const tag = element.getAttribute('lang')
    if (tag !== null) return toLocale(tag)
    const root = element.getRootNode()
    const parent =
      element.parentElement ??
      ('host' in root ? (root as ShadowRoot).host : null)
    if (!parent) return toLocale(element.ownerDocument.documentElement?.lang)
    element = parent
  }
}

export const userLocale = (
  browser:
    | Pick<Navigator, 'language' | 'languages'>
    | undefined = globalThis.navigator,
): string | undefined =>
  (browser?.languages ?? []).map(toLocale).find(tag => tag !== undefined) ??
  toLocale(browser?.language)
