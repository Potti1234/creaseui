import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Icon from '@/lib/icon'
import {
  type AppRoute,
  homePath,
  componentDocsPath,
  createPath,
  chartsPath,
  blocksIndexPath,
} from '@/route'
import { rendererLabel, otherRendererLabel } from '@/site/config'
import { skin } from '@/site/skin'

export const header = <Msg>(
  props: Readonly<{
    route: AppRoute
    isDark: boolean
    onThemeToggle: Msg
    counterpartHref: string
  }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const links = [
    {
      href: componentDocsPath('accordion'),
      label: 'Docs',
      active: props.route._tag === 'ComponentDocs',
    },
    {
      href: createPath(),
      label: 'Create',
      active: props.route._tag === 'Create',
    },
    {
      href: chartsPath('area'),
      label: 'Charts',
      active: props.route._tag === 'Charts',
    },
    {
      href: blocksIndexPath(),
      label: 'Blocks',
      active: ['BlocksIndex', 'BlocksStyleX', 'BlocksStyleXTable'].includes(
        props.route._tag,
      ),
    },
  ]
  const navLinks = () =>
    links.map(link =>
      h.a(
        [
          h.Href(link.href),
          h.Class(link.active ? skin.active : skin.link),
          ...(link.active ? [h.AriaCurrent('page')] : []),
        ],
        [link.label],
      ),
    )
  const themeLabel = props.isDark
    ? 'Switch to light mode'
    : 'Switch to dark mode'
  return h.header(
    [h.Class(skin.header), h.DataAttribute('site-header', rendererLabel)],
    [
      h.div(
        [h.Class(skin.bar)],
        [
          h.a([h.Href(homePath()), h.Class(skin.brand)], ['crease/ui']),
          h.nav(
            [h.AriaLabel('Site navigation'), h.Class(skin.nav)],
            navLinks(),
          ),
          h.a(
            [
              h.Href(props.counterpartHref),
              h.Class(skin.other),
              h.AriaLabel(`View this page in ${otherRendererLabel}`),
            ],
            [otherRendererLabel, ' ↗'],
          ),
          h.details(
            [h.Class(skin.mobile)],
            [
              h.summary(
                [h.AriaLabel('Open site navigation'), h.Class(skin.summary)],
                [Icon.icon('menu', { class: skin.icon }, h)],
              ),
              h.nav(
                [h.AriaLabel('Mobile site navigation'), h.Class(skin.menu)],
                navLinks(),
              ),
            ],
          ),
          h.button(
            [
              h.Type('button'),
              h.OnClick(props.onThemeToggle),
              h.AriaLabel(themeLabel),
              h.Title(themeLabel),
              h.Class(skin.theme),
            ],
            [Icon.icon(props.isDark ? 'sun' : 'moon', { class: skin.icon }, h)],
          ),
        ],
      ),
    ],
  )
}

export const notFound = <Msg>(path: string, h: HtmlBuilder<Msg>): Html =>
  h.main([h.Class(skin.notFound)], [`No page at ${path}.`])
