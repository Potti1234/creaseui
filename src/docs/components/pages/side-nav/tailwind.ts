import { Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { definePreviewProgram } from '@/docs/components/pages/authored-page'
import {
  sideNavFixtures,
  type SideNavFixture,
  type SideNavFixtureHeading,
  type SideNavFixtureItem,
  type SideNavFixtureNav,
} from '@/docs/components/pages/side-nav/shared'
import * as Icon from '@/lib/icon'
import * as Badge from '@/ui/badge'
import * as SideNav from '@/ui/side-nav'

const GotSideNavPreviewMessage = defineMessageUnion({
  GotSideNavPreviewMessage: {
    key: S.String,
    message: SideNav.Message,
  },
})
type GotSideNavPreviewMessage = typeof GotSideNavPreviewMessage.Type

const SideNavPreviewModel = S.Struct({
  _docsPage: S.Literal('side-nav'),
  navs: S.Record(S.String, SideNav.Model),
  maybeSelectedId: S.Option(S.String),
})
type SideNavPreviewModel = typeof SideNavPreviewModel.Type

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
              [h.Class('shrink-0 text-xs text-muted-foreground')],
              [item.endText],
            ),
          }
        : item.endMenu === true
          ? {
              endContent: h.button(
                [
                  h.Type('button'),
                  h.AriaLabel('More actions'),
                  h.Class(
                    'inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                  ),
                ],
                [Icon.icon('ellipsis', { class: 'size-3.5' }, h)],
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
          [
            h.Class(
              'flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground',
            ),
          ],
          [
            Icon.icon(
              heading.icon === 'grid' ? 'layout-grid' : 'package',
              { class: 'size-4' },
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

const navView = <Msg>(
  nav: SideNavFixtureNav,
  navModel: SideNav.Model,
  index: number,
  toParentMessage: (message: GotSideNavPreviewMessage) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  h.submodel({
    slotId: `docs-side-nav-${String(index)}`,
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
              ...(section.title === undefined ? {} : { title: section.title }),
              ...(section.isHeaderHidden === true
                ? { isHeaderHidden: true }
                : {}),
              items: decorateItems(section.items, h),
            })),
          }),
      ...(nav.items === undefined
        ? {}
        : { items: decorateItems(nav.items, h) }),
      ...(nav.hasCollapseButton === false ? { hasCollapseButton: false } : {}),
      ...(nav.footerCollapseButton === true
        ? { footerCollapseButton: true }
        : {}),
      ariaLabel: 'Docs nav',
    },
    toParentMessage: message =>
      toParentMessage(
        GotSideNavPreviewMessage.GotSideNavPreviewMessage({
          key: `nav-${String(index)}`,
          message,
        }),
      ),
  })

const fixtureView = <Msg>(
  fixture: SideNavFixture,
  model: SideNavPreviewModel,
  toParentMessage: (message: GotSideNavPreviewMessage) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const navs = fixture.navs.map((nav, index) => {
    const key = `nav-${String(index)}`
    const navModel = model.navs[key] ?? SideNav.init({ id: key })
    return navView(nav, navModel, index, toParentMessage, h)
  })
  return fixture.navs.length > 1
    ? h.div([h.Class('flex h-96 items-start gap-6')], navs)
    : h.div([h.Class('h-96')], navs)
}

export const sideNavTailwindPreviewProgram = definePreviewProgram<
  SideNavPreviewModel,
  GotSideNavPreviewMessage
>({
  Model: SideNavPreviewModel,
  Message: GotSideNavPreviewMessage,
  init: index => {
    const fixture = sideNavFixtures[index] ?? sideNavFixtures[0]
    return {
      _docsPage: 'side-nav',
      navs: Object.fromEntries(
        fixture.navs.map((nav, i) => [
          `nav-${String(i)}`,
          SideNav.init({
            id: `docs-side-nav-${String(index)}-${String(i)}`,
            ...(nav.isCollapsible === true ? { isCollapsible: true } : {}),
          }),
        ]),
      ),
      maybeSelectedId: Option.none(),
    }
  },
  update: (model, message) => {
    const nav = model.navs[message.key]
    if (nav === undefined) {
      return { model }
    }
    const result = SideNav.update(nav, message.message)
    const commands = result.commands ?? []
    const maybeOut = Option.fromNullishOr(result.outMessage)
    return {
      model: {
        ...model,
        navs: { ...model.navs, [message.key]: result.model },
        maybeSelectedId: Option.match(maybeOut, {
          onNone: () => model.maybeSelectedId,
          onSome: out =>
            out._tag === 'SelectedSideNavItem'
              ? Option.some(out.id)
              : model.maybeSelectedId,
        }),
      },
      commands: Command.mapMessages(commands, next =>
        GotSideNavPreviewMessage.GotSideNavPreviewMessage({
          key: message.key,
          message: next,
        }),
      ),
    }
  },
  view: (index, model, h) => {
    const fixture = sideNavFixtures[index] ?? sideNavFixtures[0]
    return h.div(
      [h.Class('w-full max-w-xl')],
      [fixtureView(fixture, model, message => message, h)],
    )
  },
})
