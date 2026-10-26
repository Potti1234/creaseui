import { reset } from '@/stylex/reset'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as stylex from '@stylexjs/stylex'

import type { ExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  type MobileNavFixture,
  type NavSectionSpec,
  mobileNavFixtures,
} from '@/docs/components/pages/mobile-nav/shared'
import * as Icon from '@/stylex/icon'
import * as Button from '@/stylex/button'
import * as MobileNav from '@/stylex/mobile-nav'
import * as Sidebar from '@/stylex/sidebar'
import { className } from '@/stylex/style'

const styles = stylex.create({
  main: {
    padding: '2rem',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '10rem',
  },
  headerRow: { gap: '0.75rem', alignItems: 'center', display: 'flex' },
  pageTitle: { fontSize: '1rem', fontWeight: 700, lineHeight: '1.5rem' },
  navContent: {
    padding: '0.5rem',
    gap: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
})

type PreviewModel = Readonly<{
  nav: MobileNav.Model
}>

const msg = <Msg>(
  onMessageJson: (json: string) => Msg,
  tag: string,
  fields?: Record<string, unknown>,
): Msg => onMessageJson(JSON.stringify({ _tag: tag, ...fields }))

const fixtureFor = (index: number): MobileNavFixture =>
  mobileNavFixtures[index] ?? mobileNavFixtures[0]!

const navIcons = {
  house: 'house',
  folder: 'folder',
  chartBarStacked: 'chart-bar-stacked',
  settings: 'settings',
  users: 'users',
} as const

const navSection = <Msg>(h: HtmlBuilder<Msg>, section: NavSectionSpec): Html =>
  Sidebar.sidebarGroup(
    {
      children: [
        Sidebar.sidebarGroupLabel({ children: [section.title] }, h),
        Sidebar.sidebarGroupContent(
          {
            children: [
              Sidebar.sidebarMenu(
                {
                  children: section.items.map(item =>
                    Sidebar.sidebarMenuItem(
                      {
                        children: [
                          Sidebar.sidebarMenuButton(
                            {
                              href: item.href,
                              ...(item.isSelected === true
                                ? { isActive: true }
                                : {}),
                              children: [
                                ...(item.icon === undefined
                                  ? []
                                  : [
                                      Icon.icon(
                                        {
                                          name: navIcons[
                                            item.icon as keyof typeof navIcons
                                          ],
                                          size: 'sm',
                                        },
                                        h,
                                      ),
                                    ]),
                                item.label,
                              ],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

const navContent = <Msg>(
  h: HtmlBuilder<Msg>,
  fixture: MobileNavFixture,
): Html =>
  h.div(
    [h.Class(className(styles.navContent))],
    fixture.sections.map(section => navSection(h, section)),
  )

const trigger = <Msg>(
  fixture: MobileNavFixture,
  model: PreviewModel,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  switch (fixture.trigger) {
    case 'icon':
      return Button.button(
        {
          variant: 'ghost',
          size: 'icon',
          ariaLabel: 'Open Navigation',
          onClick: msg(onMessageJson, 'ClickedOpenNavPreview'),
          children: [Icon.icon({ name: 'menu', size: 'md' }, h)],
        },
        h,
      )
    case 'labeled':
      return Button.button(
        {
          variant: 'default',
          onClick: msg(onMessageJson, 'ClickedOpenNavPreview'),
          children: ['Open from Right'],
        },
        h,
      )
    case 'toggle':
      return h.div(
        [h.Class(className(styles.headerRow))],
        [
          MobileNav.mobileNavToggle(
            {
              controls: model.nav.dialog.id,
              isExpanded: model.nav.dialog.isOpen,
              message: msg(onMessageJson, 'ClickedOpenNavPreview'),
            },
            h,
          ),
          h.p(
            [h.Class(className(reset.text, styles.pageTitle))],
            ['Page title'],
          ),
        ],
      )
    case 'togglelabeled':
      return h.div(
        [h.Class(className(styles.headerRow))],
        [
          MobileNav.mobileNavToggle(
            {
              controls: model.nav.dialog.id,
              isExpanded: model.nav.dialog.isOpen,
              message: msg(onMessageJson, 'ClickedOpenNavPreview'),
              label: 'Open menu',
            },
            h,
          ),
          h.p(
            [h.Class(className(reset.text, styles.pageTitle))],
            ['Page title'],
          ),
        ],
      )
  }
}

export const mobileNavStyleXPreview: ExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html | undefined => {
  const fixture = fixtureFor(exampleIndex)
  const m = model as PreviewModel
  return h.main(
    [h.Class(className(styles.main))],
    [
      trigger(fixture, m, onMessageJson, h),
      MobileNav.mobileNav(
        {
          model: m.nav,
          toParentMessage: message =>
            msg(onMessageJson, 'GotNavPreviewMessage', { message }),
          ...(fixture.navTitle === undefined
            ? {}
            : { title: fixture.navTitle }),
          content: navContent(h, fixture),
        },
        h,
      ),
    ],
  )
}
