import { Stream } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { HeroExampleConfig } from './component-page'
import { toSlug } from './component-metadata'

const HERO_ID_SUFFIX = '-hero'
const HERO_ID_REF_ATTRIBUTES = [
  'for',
  'form',
  'list',
  'headers',
  'aria-labelledby',
  'aria-describedby',
  'aria-details',
  'aria-controls',
  'aria-activedescendant',
  'aria-errormessage',
  'aria-owns',
  'aria-flowto',
] as const

/** Heading-less copy of the first example, rendered directly under the page
    header like shadcn's unnamed top preview. The hero and the named section
    render the same example, so element ids would duplicate: the hero rewrites
    every id (and intra-hero id reference) inside its subtree with a suffix,
    keeping the canonical ids on the named section. */
export const heroFrame = <Msg>(
  config: HeroExampleConfig<Msg>,
  content: Html,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.AriaLabel(`${config.title} preview`),
      h.OnMount({
        name: `docs-hero-${toSlug(config.title)}`,
        f: element => {
          if (!(element instanceof HTMLElement)) return Stream.empty
          const scopedIds = new Set<string>()
          if (config.keepIdsCanonical === true) return Stream.empty
          element.querySelectorAll<HTMLElement>('[id]').forEach(node => {
            if (node.id.length > 0) scopedIds.add(node.id)
          })
          scopedIds.forEach(id => {
            const node = element.querySelector<HTMLElement>(
              `#${CSS.escape(id)}`,
            )
            if (node !== null && !id.endsWith(HERO_ID_SUFFIX)) {
              node.id = `${id}${HERO_ID_SUFFIX}`
            }
          })
          HERO_ID_REF_ATTRIBUTES.forEach(attribute => {
            element
              .querySelectorAll<HTMLElement>(`[${attribute}]`)
              .forEach(node => {
                const value = node.getAttribute(attribute)
                if (value === null) return
                const rewritten = value
                  .split(/\s+/)
                  .map(token =>
                    scopedIds.has(token) ? `${token}${HERO_ID_SUFFIX}` : token,
                  )
                  .join(' ')
                if (rewritten !== value) node.setAttribute(attribute, rewritten)
              })
          })
          return Stream.empty
        },
      }),
    ],
    [content],
  )
}
