import type { Html, HtmlBuilder } from 'foldkit/html'
import type { BreadcrumbTrailItem } from '@/pleat/breadcrumb'
import { breadcrumbTrail } from '@/pleat/breadcrumb'
import { badge } from '@/pleat/badge'
import { separator } from '@/pleat/separator'
import { icon } from '@/pleat/composition/icon'
import { inline } from '@/pleat/composition/inline'
import { text } from '@/pleat/composition/text'
import { stack } from '@/pleat/composition/stack'
import { themeScope, type SemanticThemeName } from '@/pleat/composition/theme'
import {
  sidebar,
  sidebarContent,
  sidebarFooter,
  sidebarGroup,
  sidebarGroupContent,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarInset,
  sidebarProvider,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuItem,
  sidebarRail,
  sidebarTrigger,
} from '@/pleat/sidebar'

export type ChromeState<Message> = Readonly<{
  collapsed: boolean
  mobileOpen: boolean
  onMobileToggle: Message
  onToggle: Message
}>

export type BlockChrome<Message> = Readonly<{
  actions?: ReadonlyArray<Html> | undefined
  collapsed: boolean
  content: ReadonlyArray<Html>
  mobileOpen: boolean
  navigation: ReadonlyArray<Html>
  onMobileToggle: Message
  onToggle: Message
  theme?: SemanticThemeName | undefined
  trail: ReadonlyArray<BreadcrumbTrailItem>
}>

/** Collapsible creaseui sidebar + breadcrumb header shared by the demo blocks. */
export const appChrome = <Message>(
  props: BlockChrome<Message>,
  h: HtmlBuilder<Message>,
): Html =>
  themeScope(
    {
      children: [
        sidebarProvider(
          {
            children: [
              sidebar(
                {
                  children: [
                    ...props.navigation,
                    sidebarRail({ onClick: props.onToggle }, h),
                  ],
                  collapsible: 'offcanvas',
                  isMobileOpen: props.mobileOpen,
                  onMobileDismiss: props.onMobileToggle,
                  state: props.collapsed ? 'collapsed' : 'expanded',
                },
                h,
              ),
              sidebarInset(
                {
                  children: [
                    inline(
                      {
                        align: 'center',
                        as: 'header',
                        children: [
                          inline(
                            {
                              align: 'center',
                              children: [
                                sidebarTrigger(
                                  {
                                    onClick: props.onToggle,
                                    onMobileClick: props.onMobileToggle,
                                  },
                                  h,
                                ),
                                separator(
                                  {
                                    orientation: 'vertical',
                                  },
                                  h,
                                ),
                                breadcrumbTrail({ items: props.trail }, h),
                              ],
                              gap: 'sm',
                            },
                            h,
                          ),
                          ...(props.actions ?? []),
                        ],
                        gap: 'sm',
                        justify: 'between',
                        variant: 'pageBar',
                        width: 'full',
                      },
                      h,
                    ),
                    stack(
                      {
                        children: props.content,
                        gap: 'lg',
                        grow: true,
                        padding: 'md',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
            state: props.collapsed ? 'collapsed' : 'expanded',
          },
          h,
        ),
      ],
      theme: props.theme,
    },
    h,
  )

export const orbitNavigation = <Message>(
  active: string,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => [
  sidebarHeader(
    {
      children: [
        inline(
          {
            align: 'center',
            children: [
              badge({ children: ['OS'] }, h),
              text({ children: ['Orbit Studio'], variant: 'label' }, h),
            ],
            gap: 'sm',
          },
          h,
        ),
      ],
    },
    h,
  ),
  sidebarContent(
    {
      children: [
        sidebarGroup(
          {
            children: [
              sidebarGroupLabel({ children: ['Workspace'] }, h),
              sidebarGroupContent(
                {
                  children: [
                    sidebarMenu(
                      {
                        children: [
                          'Overview',
                          'Growth',
                          'Projects',
                          'Services',
                          'Incidents',
                        ].map(label =>
                          sidebarMenuItem(
                            {
                              children: [
                                sidebarMenuButton(
                                  {
                                    children: [
                                      icon(
                                        {
                                          name:
                                            label === 'Overview'
                                              ? 'gauge'
                                              : label === 'Growth'
                                                ? 'chart-pie'
                                                : label === 'Projects'
                                                  ? 'file'
                                                  : label === 'Services'
                                                    ? 'square-terminal'
                                                    : 'circle-alert',
                                        },
                                        h,
                                      ),
                                      label,
                                    ],
                                    isActive: label === active,
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
        ),
      ],
    },
    h,
  ),
  sidebarFooter(
    {
      children: [
        sidebarMenu(
          {
            children: [
              sidebarMenuItem(
                {
                  children: [
                    sidebarMenuButton(
                      {
                        children: [
                          badge({ children: ['AL'], variant: 'outline' }, h),
                          'Alex Lee',
                        ],
                        size: 'lg',
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
        ),
      ],
    },
    h,
  ),
]
