import { previewLayout } from '@/docs/components/preview-layout.stylex'
import { reset } from '@/stylex/reset'
import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  sideNavFixtures,
  type SideNavFixtureHeading,
  type SideNavFixtureItem,
  type SideNavFixtureNav,
} from '@/docs/components/pages/side-nav/shared'
import * as Icon from '@/lib/icon'
import * as Badge from '@/stylex/badge'
import * as SideNav from '@/stylex/side-nav'
import { className } from '@/stylex/style'

const styles = stylex.create({
  wrap: {
    gap: '1.5rem',
    alignItems: 'flex-start',
    display: 'flex',
    height: '24rem',
  },
  navWrap: { height: '24rem' },
  itemIcon: { height: '0.875rem', width: '0.875rem' },
  headingIconTile: {
    borderRadius: 'calc(var(--radius) - 2px)',
    alignItems: 'center',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    display: 'flex',
    justifyContent: 'center',
    height: '1.5rem',
    width: '1.5rem',
  },
  headingIconGlyph: { height: '1.25rem', width: '1.25rem' },
  endText: {
    color: 'var(--muted-foreground)',
    flexShrink: 0,
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  endMenu: {
    padding: 0,
    borderRadius: 'calc(var(--radius) - 4px)',
    borderStyle: 'none',
    borderWidth: 0,
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    transitionDuration: '150ms',
    transitionProperty: 'background-color, color',
    height: '1.25rem',
    width: '1.25rem',
  },
})

const decorateItems = <Msg>(
  items: ReadonlyArray<SideNavFixtureItem>,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<SideNav.SideNavItemData> =>
  items.map(item => ({
    id: item.id,
    label: item.label,
    ...(item.icon === undefined ? {} : { icon: item.icon }),
    ...(item.isSelected === true ? { isSelected: true } : {}),
    ...(item.isDisabled === true ? { isDisabled: true } : {}),
    ...(item.href === undefined ? {} : { href: item.href }),
    ...(item.onSelect === true ? { onSelect: true } : {}),
    ...(item.endBadge !== undefined
      ? { endContent: Badge.badge({ children: [item.endBadge] }, h) }
      : item.endText !== undefined
        ? {
            endContent: h.span(
              [h.Class(className(styles.endText))],
              [item.endText],
            ),
          }
        : item.endMenu === true
          ? {
              endContent: h.button(
                [
                  h.Type('button'),
                  h.AriaLabel('More actions'),
                  h.Class(className(reset.button, styles.endMenu)),
                ],
                [
                  Icon.icon(
                    'ellipsis',
                    { class: className(styles.itemIcon) },
                    h,
                  ),
                ],
              ),
            }
          : {}),
    ...(item.children === undefined
      ? {}
      : { children: decorateItems(item.children, h) }),
  }))

const decorateHeading = <Msg>(
  heading: SideNavFixtureHeading,
  h: HtmlBuilder<Msg>,
): SideNav.SideNavHeadingData => ({
  heading: heading.heading,
  ...(heading.icon === undefined
    ? {}
    : {
        icon: h.span(
          [h.Class(className(styles.headingIconTile))],
          [
            Icon.icon(
              heading.icon === 'grid' ? 'layout-grid' : 'package',
              { class: className(styles.headingIconGlyph) },
              h,
            ),
          ],
        ),
      }),
  ...(heading.headingHref === undefined
    ? {}
    : { headingHref: heading.headingHref }),
  ...(heading.superheading === undefined
    ? {}
    : { superheading: heading.superheading }),
  ...(heading.subheading === undefined
    ? {}
    : { subheading: heading.subheading }),
  ...(heading.menu === undefined
    ? {}
    : {
        menu: heading.menu.map(label => ({ label, href: '#' })),
      }),
})

export const sideNavStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const fixture = sideNavFixtures[exampleIndex] ?? sideNavFixtures[0]
  const navs = (model as { navs: Record<string, SideNav.Model> }).navs
  const navViews = fixture.navs.map((nav: SideNavFixtureNav, index) => {
    const key = `nav-${String(index)}`
    const navModel = navs[key] ?? SideNav.init({ id: key })
    return h.submodel({
      slotId: `docs-stylex-side-nav-${String(index)}`,
      model: navModel,
      view: SideNav.view,
      viewInputs: {
        ...(nav.heading === undefined
          ? {}
          : { heading: decorateHeading(nav.heading, h) }),
        ...(nav.sections === undefined
          ? {}
          : {
              sections: nav.sections.map(section => ({
                ...(section.title === undefined
                  ? {}
                  : { title: section.title }),
                ...(section.isHeaderHidden === true
                  ? { isHeaderHidden: true }
                  : {}),
                items: decorateItems(section.items, h),
              })),
            }),
        ...(nav.items === undefined
          ? {}
          : { items: decorateItems(nav.items, h) }),
        ...(nav.hasCollapseButton === false
          ? { hasCollapseButton: false }
          : {}),
        ...(nav.footerCollapseButton === true
          ? { footerCollapseButton: true }
          : {}),
        ariaLabel: 'Docs nav',
      },
      toParentMessage: message =>
        onMessageJson(
          JSON.stringify({
            _tag: 'GotSideNavPreviewMessage',
            key,
            message,
          }),
        ),
    })
  })
  return h.div(
    [h.Class(className(previewLayout.wide))],
    [
      fixture.navs.length > 1
        ? h.div([h.Class(className(styles.wrap))], navViews)
        : h.div([h.Class(className(styles.navWrap))], navViews),
    ],
  )
}
