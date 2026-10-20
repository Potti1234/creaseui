import type { Locator } from '@playwright/test'

export type ClippedText = Readonly<{
  text: string
  overflow: number
  clipper: string
}>

/* Text a clipping ancestor (overflow hidden/clip) cuts off horizontally.
   Root scrollWidth misses this: a card clips its value while the page itself
   doesn't overflow. Intentional clipping opts out explicitly: an ancestor with
   text-overflow: ellipsis, a scroll region (overflow auto/scroll) or
   [data-clip-intended]; screen-reader-only text is skipped. */
export const clippedText = (
  root: Locator,
): Promise<ReadonlyArray<ClippedText>> =>
  root.evaluate(element => {
    const found: Array<{ text: string; overflow: number; clipper: string }> = []
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim() ?? ''
      if (text === '' || node.parentElement === null) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      const box = range.getBoundingClientRect()
      if (box.width === 0) continue
      /* Every clipping ancestor is checked: a wide inner box that fits the
         text must not hide an outer box that cuts it. An intentional
         region (ellipsis, scrolling, opt-out) may cut its own content, so
         from there on its box is what outer clippers must fit. */
      let measured: { left: number; right: number } = box
      for (
        let ancestor: Element | null = node.parentElement;
        ancestor !== null && ancestor !== document.body;
        ancestor = ancestor.parentElement
      ) {
        const style = getComputedStyle(ancestor)
        const overflow = [style.overflowX, style.overflowY]
        const rect = ancestor.getBoundingClientRect()
        if (
          ancestor.hasAttribute('data-clip-intended') ||
          style.textOverflow === 'ellipsis' ||
          overflow.some(value => value === 'auto' || value === 'scroll')
        ) {
          measured = {
            left: Math.max(measured.left, rect.left),
            right: Math.min(measured.right, rect.right),
          }
          continue
        }
        if (!overflow.some(value => value === 'hidden' || value === 'clip'))
          continue
        /* Visually hidden text (sr-only) is a 1px clip by design. */
        if (rect.width <= 1 || rect.height <= 1) break
        const lost = Math.max(
          rect.left - measured.left,
          measured.right - rect.right,
        )
        if (lost > 0.5) {
          found.push({
            text,
            overflow: Math.round(lost),
            clipper:
              ancestor.getAttribute('data-slot') ??
              ancestor.tagName.toLowerCase(),
          })
          break
        }
      }
    }
    return found
  })
