import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

/* Ported from Meta Astryx AppShell/AppShell.tsx — the application scaffold:
   root column shell with a skip link, an optional banner + topNav header
   region, an optional sideNav start panel, and a scrollable <main> content
   area. astryx's mobileNav drawer machinery is not ported (it depends on a
   media-query subscription and the SideNav/TopNav/MobileNav drawer
   components, none of which exist in Crease UI) — see PORT-NOTE in the
   porting report. astryx's auto-mode measured header offset becomes a fixed
   48px (--spacing-12) sticky offset.
   astryx --radius-page = 28px → rounded-ss-[28px] for the elevated corner. */

export type AppShellVariant = 'elevated' | 'wash' | 'surface' | 'section'
export type AppShellHeight = 'fill' | 'auto'
export type AppShellSpacing = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10

const contentPaddingClasses: Record<AppShellSpacing, string> = {
  0: 'p-0',
  0.5: 'p-0.5',
  1: 'p-1',
  1.5: 'p-1.5',
  2: 'p-2',
  3: 'p-3',
  4: 'p-4',
  5: 'p-5',
  6: 'p-6',
  8: 'p-8',
  10: 'p-10',
}

const variantRootClasses: Record<AppShellVariant, string> = {
  elevated: 'bg-background',
  wash: 'bg-background',
  surface: 'bg-card',
  section: 'bg-card',
}

export type AppShellProps = Readonly<{
  /**
   * Navigation background style controlling how nav areas contrast with
   * content.
   * - `wash`: nav uses wash background, no dividers
   * - `surface`: nav uses surface background, no dividers
   * - `section`: dividers between nav and content (classic look)
   * - `elevated`: wash nav with elevated surface content area + page-radius
   *   corner when a top nav and an inline side nav are both present (default)
   */
  variant?: AppShellVariant
  /** Optional banner slot rendered above the top nav. */
  banner?: Html
  /** Top navigation slot (typically an app's top nav markup). */
  topNav?: Html
  /** Side navigation slot rendered as the start panel. */
  sideNav?: Html
  /**
   * Padding for the main content area (spacing steps of 4px).
   * - `4` (16px) — standard for forms, settings, text-heavy pages
   * - `0` — edge-to-edge dashboards, maps, tables
   */
  contentPadding?: AppShellSpacing
  /**
   * Height behavior:
   * - `fill`: shell fills the viewport, content scrolls internally (default)
   * - `auto`: shell grows with content, page scrolls as a whole; the header
   *   and side nav stay sticky while scrolling
   */
  height?: AppShellHeight
  /** Accessible label for the skip-to-content link. */
  skipLinkLabel?: string
  /** Element id used as the skip link's focus target on <main>. */
  mainId?: string
  /** Main content area (rendered as <main>). */
  children?: ReadonlyArray<Html | string>
  class?: string
}>

const skipLinkClasses = cn(
  // visually hidden by default, revealed on keyboard focus
  'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip-path:inset(50%)]',
  'focus:fixed focus:top-2 focus:start-2 focus:z-[9999] focus:w-auto focus:h-auto focus:m-0 focus:px-4 focus:py-2 focus:overflow-visible focus:[clip-path:none] focus:whitespace-normal',
  'focus:bg-card focus:text-primary focus:font-semibold focus:text-sm focus:no-underline',
)

export const appShell = <Msg>(
  props: AppShellProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const variant = props.variant ?? 'elevated'
  const height = props.height ?? 'fill'
  const isFill = height === 'fill'
  const isAuto = height === 'auto'
  const mainId = props.mainId ?? 'app-shell-main'
  const hasBanner = props.banner !== undefined
  const hasTopNav = props.topNav !== undefined
  const hasSideNav = props.sideNav !== undefined
  const navHasDividers = variant === 'section'
  const isElevated = variant === 'elevated'
  const contentPadding = props.contentPadding ?? 0
  const navAreaClass =
    variant === 'wash' || variant === 'elevated'
      ? 'bg-background'
      : variant === 'surface'
        ? 'bg-card'
        : undefined
  const contentAreaClass =
    variant === 'wash'
      ? 'bg-background'
      : isElevated && hasTopNav && hasSideNav
        ? 'bg-transparent isolate'
        : variant === 'surface' || variant === 'elevated'
          ? 'bg-card'
          : undefined
  const headerAreaClass =
    navAreaClass ?? (isAuto && variant === 'section' ? 'bg-card' : undefined)
  const stickyBgClass = navAreaClass ?? 'bg-card'

  const headerContent =
    hasTopNav || hasBanner
      ? h.div(
          [
            h.Role('banner'),
            h.DataAttribute('slot', 'app-shell-header'),
            h.Class(
              cn(headerAreaClass, isAuto ? 'sticky top-0 z-[1]' : undefined),
            ),
          ],
          [
            h.header(
              [
                h.Class(
                  cn(navHasDividers && hasTopNav ? 'border-b' : undefined),
                ),
              ],
              [
                ...(hasBanner
                  ? [
                      h.div(
                        [
                          h.DataAttribute('slot', 'app-shell-banner'),
                          h.Class(cn('shrink-0', navAreaClass)),
                        ],
                        [props.banner as Html],
                      ),
                    ]
                  : []),
                ...(hasTopNav ? [props.topNav as Html] : []),
              ],
            ),
          ],
        )
      : undefined

  const sideNavPanel = hasSideNav
    ? h.aside(
        [
          h.DataAttribute('slot', 'app-shell-sidenav'),
          h.Class(
            cn(
              'flex flex-col shrink-0',
              navAreaClass,
              navHasDividers ? 'border-e' : undefined,
              isFill ? 'overflow-auto' : 'flex-1 overflow-auto',
            ),
          ),
        ],
        [props.sideNav as Html],
      )
    : undefined

  const sideNavContent =
    sideNavPanel !== undefined && isAuto
      ? h.div(
          [
            h.Class(
              cn(
                'flex flex-col shrink-0 overflow-clip sticky top-12 h-[calc(100dvh-3rem)]',
                stickyBgClass,
              ),
            ),
          ],
          [sideNavPanel],
        )
      : sideNavPanel

  const mainInner = h.main(
    [
      h.DataAttribute('slot', 'app-shell-content'),
      h.Id(mainId),
      h.Tabindex(-1),
      h.Class(
        cn(
          'flex-1 min-w-0 min-h-0 outline-none',
          contentAreaClass,
          contentPaddingClasses[contentPadding],
          isFill ? 'overflow-auto' : undefined,
        ),
      ),
    ],
    [...(props.children ?? [])],
  )

  // elevated corner treatment: a surface backdrop clips the page radius
  // behind the scrolling main region (astryx --radius-page = 28px)
  const mainContent =
    isElevated && hasTopNav && hasSideNav
      ? h.div(
          [
            h.DataAttribute('slot', 'app-shell-elevated-wrapper'),
            h.Class('relative flex flex-1 min-h-0 h-full'),
          ],
          [
            h.div(
              [
                h.Class(
                  'absolute inset-0 bg-card rounded-ss-[28px] pointer-events-none',
                ),
              ],
              [],
            ),
            mainInner,
          ],
        )
      : mainInner

  return h.div(
    [
      h.DataAttribute('slot', 'app-shell'),
      h.DataAttribute('variant', variant),
      h.Class(
        cn(
          'flex flex-col relative overflow-clip',
          variantRootClasses[variant],
          isFill ? 'h-dvh' : 'min-h-dvh',
          props.class,
        ),
      ),
    ],
    [
      h.a(
        [
          h.Href(`#${mainId}`),
          h.DataAttribute('testid', 'skip-to-content'),
          h.Class(skipLinkClasses),
        ],
        [props.skipLinkLabel ?? 'Skip to content'],
      ),
      ...(headerContent === undefined ? [] : [headerContent]),
      h.div(
        [
          h.DataAttribute('slot', 'app-shell-middle'),
          h.Class('flex flex-1 min-h-0'),
        ],
        [
          ...(sideNavContent === undefined ? [] : [sideNavContent]),
          mainContent,
        ],
      ),
    ],
  )
}
