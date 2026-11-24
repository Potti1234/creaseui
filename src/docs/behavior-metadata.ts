import { componentBehaviors, behaviors } from '@/docs/generated-behavior-docs'
import { canonicalComponentSlug } from '@/docs/component-metadata'
import { behaviorDocsPath, behaviorsPath } from '@/route'
import type { Html, HtmlBuilder } from 'foldkit/html'

export { behaviors }
export const coreBehaviors = behaviors.filter(
  entry => entry.kind === 'primitive',
)
export type { BehaviorEntry } from '@/docs/generated-behavior-docs'

export type BehaviorRenderer = 'tailwind' | 'stylex' | 'pleat'

const bySlug = new Map(behaviors.map(behavior => [behavior.slug, behavior]))

export const behaviorFor = (slug: string) => bySlug.get(slug)

export const behaviorsFor = (slug: string, renderer: BehaviorRenderer) =>
  (componentBehaviors[canonicalComponentSlug(slug)]?.[renderer] ?? []).flatMap(
    key => {
      const behavior = behaviorFor(key)
      return behavior?.kind === 'primitive' ? [behavior] : []
    },
  )

export const componentsUsing = (slug: string, renderer: BehaviorRenderer) =>
  Object.keys(componentBehaviors).filter(component =>
    componentBehaviors[component]?.[renderer].includes(slug),
  )

const sidebarBehaviors = [...coreBehaviors].sort((left, right) =>
  left.title.localeCompare(right.title, 'en'),
)

export const behaviorNavGroup = (
  item: (href: string, label: string) => Html,
): Readonly<{ label: string; items: readonly Html[] }> => ({
  label: 'Behaviors',
  items: [
    item(behaviorsPath(), 'All Behaviors'),
    ...sidebarBehaviors.map(entry =>
      item(behaviorDocsPath(entry.slug), entry.title),
    ),
  ],
})

export const behaviorList = <Msg>(
  slug: string,
  renderer: BehaviorRenderer,
  h: HtmlBuilder<Msg>,
): Html => {
  const related = behaviorsFor(slug, renderer)
  return related.length === 0
    ? h.p([h.Class('behavior-docs-muted')], ['No shared behaviors.'])
    : h.ul(
        [h.Class('behavior-docs-compact-list')],
        related.map(entry =>
          h.li(
            [],
            [
              h.a(
                [
                  h.Class('behavior-docs-link'),
                  h.Href(behaviorDocsPath(entry.slug)),
                ],
                [entry.title],
              ),
              h.span([h.Class('behavior-docs-muted')], [entry.description]),
            ],
          ),
        ),
      )
}
