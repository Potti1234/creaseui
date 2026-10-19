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
      for (
        let ancestor: Element | null = node.parentElement;
        ancestor !== null && ancestor !== document.body;
        ancestor = ancestor.parentElement
      ) {
        const style = getComputedStyle(ancestor)
        const overflow = [style.overflowX, style.overflowY]
        if (
          ancestor.hasAttribute('data-clip-intended') ||
          style.textOverflow === 'ellipsis' ||
          overflow.some(value => value === 'auto' || value === 'scroll')
        )
          break
        if (!overflow.some(value => value === 'hidden' || value === 'clip'))
          continue
        const clip = ancestor.getBoundingClientRect()
        /* Visually hidden text (sr-only) is a 1px clip by design. */
        if (clip.width <= 1 || clip.height <= 1) break
        const lost = Math.max(clip.left - box.left, box.right - clip.right)
        if (lost > 0.5)
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
    return found
  })
